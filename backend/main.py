import time
import random
import math

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from bandit import BanditArm
import os
from guardrails import validate_strategy
from razorpay_client import (
    create_razorpay_order,
    RazorpayOrderError,
    RazorpayConfigurationError,
    get_razorpay_client
)
from agent import generate_hypotheses
from audit import AuditLogger


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="GrowthLoop Autonomous Revenue Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# EXPERIMENT CONFIG
# ============================================================

BASE_ITEM_PRICE = 999.0

DOMINANCE_THRESHOLD = 0.95

MIN_TRIALS_FOR_PROMOTION = 30

audit = AuditLogger()


# ============================================================
# HIDDEN SIMULATION ENVIRONMENT
# ============================================================

# These represent the hidden behavior of simulated customers.
#
# The bandit does NOT know these values.
# The frontend never receives them.
#
# This is what makes the experiment meaningful.

DEFAULT_TRUE_RATES = {
    "baseline": 0.075,
    "prepaid": 0.155,
    "cart": 0.235,
    "urgency": 0.125,
}


def infer_hidden_rate(
    arm_id: str,
    discount_pct: float
) -> float:

    arm_lower = arm_id.lower()

    if "prepaid" in arm_lower:
        return DEFAULT_TRUE_RATES["prepaid"]

    if "cart" in arm_lower:
        return DEFAULT_TRUE_RATES["cart"]

    if "urgency" in arm_lower:
        return DEFAULT_TRUE_RATES["urgency"]

    if "baseline" in arm_lower:
        return DEFAULT_TRUE_RATES["baseline"]

    # Deterministic fallback.
    # Slightly different rates prevent all unknown
    # strategies from becoming identical.
    return min(
        0.08 + discount_pct * 0.003,
        0.30
    )


# ============================================================
# INITIAL BANDIT
# ============================================================

def create_default_arms():

    return [
        BanditArm(
            arm_id="baseline",
            label="Baseline — No Promotion",
            discount_pct=0,
            true_conversion_rate=0.075
        ),
        BanditArm(
            arm_id="prepaid",
            label="Instant Prepaid Incentive",
            discount_pct=8,
            true_conversion_rate=0.155
        ),
        BanditArm(
            arm_id="cart",
            label="Cart Size Booster",
            discount_pct=15,
            true_conversion_rate=0.235
        )
    ]


arms = create_default_arms()


# ============================================================
# REQUEST MODELS
# ============================================================

class StrategyRequest(BaseModel):
    context: str = Field(
        min_length=10,
        max_length=2000
    )


class BatchRequest(BaseModel):
    trials: int = Field(
        default=25,
        ge=1,
        le=1000
    )


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def active_arms():

    return [
        arm
        for arm in arms
        if arm.status == "ACTIVE"
    ]


def probability_arm_is_best(
    candidate: BanditArm,
    simulations: int = 4000
) -> float:

    active = active_arms()

    if len(active) <= 1:
        return 1.0

    wins = 0

    for _ in range(simulations):

        candidate_sample = candidate.sample()

        other_samples = [
            arm.sample()
            for arm in active
            if arm.arm_id != candidate.arm_id
        ]

        if candidate_sample >= max(
            other_samples
        ):
            wins += 1

    return wins / simulations


def experiment_summary():

    active = active_arms()

    if not active:
        return None

    probabilities = {}

    for arm in active:
        probabilities[arm.arm_id] = round(
            probability_arm_is_best(arm, 1000) * 100,
            1
        )

    winner = max(
        active,
        key=lambda arm: probabilities[arm.arm_id]
    )

    return {
        "leader_arm_id": winner.arm_id,
        "leader_label": winner.label,
        "leader_probability": probabilities[
            winner.arm_id
        ],
        "probabilities": probabilities
    }


# ============================================================
# STATE
# ============================================================

@app.get("/api/state")
def get_system_state():

    summary = experiment_summary()

    key_id = None
    try:
        key_id = get_razorpay_client().key_id
    except Exception:
        key_id = os.getenv("RAZORPAY_KEY_ID")

    return {
        "item_price": BASE_ITEM_PRICE,

        "arms": [
            arm.to_dict()
            for arm in arms
        ],

        "experiment": summary,

        "audit_trail": audit.recent(30),

        "audit_verified": audit.verify_chain(),

        "razorpay_key_id": key_id
    }


# ============================================================
# AI HYPOTHESIS GENERATION
# ============================================================

@app.post("/api/agent/hypothesize")
def agent_hypothesize(req: StrategyRequest):

    global arms

    proposed = generate_hypotheses(
        req.context
    )

    audit.append(
        "AGENT_REASONING_START",
        (
            f"Merchant context received. "
            f"Generated {len(proposed)} candidate strategies."
        ),
        "NORMAL",
        {
            "context": req.context,
            "candidate_count": len(proposed)
        }
    )

    new_arms = []

    for strategy in proposed:

        try:

            arm_id = str(
                strategy["arm_id"]
            )

            label = str(
                strategy["label"]
            )

            discount = float(
                strategy["discount_pct"]
            )

            rationale = strategy.get(
                "rationale",
                ""
            )

            # ----------------------------------------------
            # DETERMINISTIC GUARDRAIL
            # ----------------------------------------------

            result = validate_strategy(
                discount,
                BASE_ITEM_PRICE
            )

            if not result.passed:

                audit.append(
                    "ARM_REJECTED",
                    (
                        f"Blocked '{label}' "
                        f"({discount:.1f}%): "
                        f"{' '.join(result.violations)}"
                    ),
                    "CRITICAL",
                    {
                        "arm_id": arm_id,
                        "discount_pct": discount,
                        "violations": result.violations
                    }
                )

                continue

            # ----------------------------------------------
            # APPROVED ARM
            # ----------------------------------------------

            hidden_rate = infer_hidden_rate(
                arm_id,
                discount
            )

            arm = BanditArm(
                arm_id=arm_id,
                label=label,
                discount_pct=discount,
                true_conversion_rate=hidden_rate,
                metadata={
                    "rationale": rationale,
                    "mechanism": strategy.get(
                        "expected_mechanism",
                        ""
                    ),
                    "target_segment": strategy.get(
                        "target_segment",
                        ""
                    ),
                    "risk_level": strategy.get(
                        "risk_level",
                        "MEDIUM"
                    )
                }
            )

            new_arms.append(arm)

            audit.append(
                "ARM_ACCEPTED",
                (
                    f"Approved '{label}' "
                    f"({discount:.1f}%). "
                    f"{rationale}"
                ),
                "SUCCESS",
                {
                    "arm_id": arm_id,
                    "discount_pct": discount,
                    "final_price": result.final_price
                }
            )

        except Exception as exc:

            audit.append(
                "AGENT_OUTPUT_INVALID",
                f"Strategy rejected due to invalid schema: {exc}",
                "CRITICAL"
            )

    if new_arms:
        arms = new_arms

    return {
        "status": "success",
        "active_arms": [
            arm.to_dict()
            for arm in arms
        ]
    }


# ============================================================
# THOMPSON SAMPLING
# ============================================================

@app.post("/api/simulate-batch")
def simulate_traffic_batch(
    request: BatchRequest = BatchRequest()
):

    promoted = next(
        (
            arm
            for arm in arms
            if arm.status == "PROMOTED"
        ),
        None
    )

    if promoted is not None:
        selected_arm = promoted
    else:
        active = active_arms()

        if not active:
            return {
                "success": False,
                "error": "No active arms available."
            }

    for _ in range(request.trials):

        if promoted is not None:
            selected_arm = promoted
        else:
            # ----------------------------------------------
            # SAMPLE EVERY ACTIVE ARM
            # ----------------------------------------------

            sampled = [
                (
                    arm.sample(),
                    arm
                )
                for arm in active
            ]

            _, selected_arm = max(
                sampled,
                key=lambda item: item[0]
            )

        # ----------------------------------------------
        # HIDDEN CUSTOMER RESPONSE
        # ----------------------------------------------

        converted = (
            random.random()
            < selected_arm._true_conversion_rate
        )

        # ----------------------------------------------
        # BAYESIAN UPDATE
        # ----------------------------------------------

        selected_arm.update(
            converted
        )

    summary = experiment_summary()

    audit.append(
        "BANDIT_TRAFFIC_STEP",
        (
            f"Routed {request.trials} checkouts to promoted strategy '{promoted.label}'."
            if promoted
            else (
                f"Routed {request.trials} simulated "
                f"checkouts through Thompson Sampling."
            )
        ),
        "NORMAL",
        {
            "trials": request.trials,
            "leader": (
                promoted.label
                if promoted
                else (
                    summary["leader_label"]
                    if summary
                    else None
                )
            )
        }
    )

    return {
        "arms": [
            arm.to_dict()
            for arm in arms
        ],
        "experiment": summary
    }


# ============================================================
# POISON STRATEGY DEMO
# ============================================================

@app.post("/api/test-guardrail-violation")
def trigger_guardrail_violation():

    label = "Aggressive Clearance Slash"
    discount = 35.0

    result = validate_strategy(
        discount,
        BASE_ITEM_PRICE
    )

    audit.append(
        "GUARDRAIL_INTERCEPT",
        (
            f"Rejected '{label}' "
            f"({discount:.1f}%): "
            f"{' '.join(result.violations)}"
        ),
        "CRITICAL",
        {
            "discount_pct": discount,
            "final_price": result.final_price
        }
    )

    return {
        "accepted": result.passed,
        "severity": result.severity,
        "reason": result.violations,
        "final_price": result.final_price
    }


# ============================================================
# PROMOTION
# ============================================================

@app.post("/api/deploy-winner")
def deploy_winning_strategy():

    active = active_arms()

    if not active:

        return {
            "success": False,
            "error": "No active candidates."
        }

    summary = experiment_summary()

    if not summary:

        return {
            "success": False,
            "error": "Unable to determine experiment leader."
        }

    winner = next(
        arm
        for arm in active
        if arm.arm_id
        == summary["leader_arm_id"]
    )

    # ----------------------------------------------
    # REQUIRE MINIMUM EVIDENCE
    # ----------------------------------------------

    if winner.trials < MIN_TRIALS_FOR_PROMOTION:

        return {
            "success": False,
            "error": (
                f"Not enough evidence. "
                f"{winner.label} has "
                f"{winner.trials} trials; "
                f"{MIN_TRIALS_FOR_PROMOTION} required."
            ),
            "experiment": summary
        }

    # ----------------------------------------------
    # REQUIRE STATISTICAL DOMINANCE
    # ----------------------------------------------

    dominance = summary[
        "leader_probability"
    ]

    if dominance < DOMINANCE_THRESHOLD * 100:

        return {
            "success": False,
            "error": (
                f"Winner has only {dominance:.1f}% "
                f"probability of being best. "
                f"95% is required."
            ),
            "experiment": summary
        }

    # ----------------------------------------------
    # RE-RUN FINANCIAL GUARDRAILS
    # ----------------------------------------------

    result = validate_strategy(
        winner.discount_pct,
        BASE_ITEM_PRICE
    )

    if not result.passed:

        audit.append(
            "PROMOTION_BLOCKED",
            (
                f"Promotion blocked for "
                f"'{winner.label}': "
                f"{' '.join(result.violations)}"
            ),
            "CRITICAL"
        )

        return {
            "success": False,
            "error": result.violations
        }

    # ----------------------------------------------
    # CREATE RAZORPAY ORDER
    # ----------------------------------------------

    try:

        order = create_razorpay_order(
            amount_inr=result.final_price,
            arm_id=winner.arm_id,
            receipt=(
                f"growthloop_"
                f"{int(time.time())}"
            ),
            notes={
                "experiment": "growthloop",
                "strategy": winner.label,
                "posterior_probability": (
                    winner.posterior_probability_pct
                )
            }
        )

    except (
        RazorpayOrderError,
        RazorpayConfigurationError
    ) as exc:

        audit.append(
            "RAZORPAY_ORDER_FAILED",
            (
                f"Promotion approved but "
                f"Razorpay order creation failed: "
                f"{str(exc)}"
            ),
            "CRITICAL"
        )

        return {
            "success": False,
            "error": str(exc),
            "winner": winner.to_dict()
        }

    # ----------------------------------------------
    # PROMOTE
    # ----------------------------------------------

    winner.status = "PROMOTED"

    for arm in arms:

        if arm.arm_id != winner.arm_id:
            arm.status = "PAUSED"

    audit.append(
        "RAZORPAY_ORDER_CREATED",
        (
            f"Promoted '{winner.label}'. "
            f"Razorpay Test Order "
            f"{order['id']} created for "
            f"₹{result.final_price:.2f}."
        ),
        "SUCCESS",
        {
            "order_id": order["id"],
            "amount_paise": order["amount"],
            "arm_id": winner.arm_id
        }
    )

    key_id = None
    try:
        key_id = get_razorpay_client().key_id
    except Exception:
        key_id = os.getenv("RAZORPAY_KEY_ID")

    return {
        "success": True,
        "winner": winner.to_dict(),
        "razorpay_order": order,
        "final_price": result.final_price,
        "razorpay_key_id": key_id
    }


# ============================================================
# RESET
# ============================================================

@app.post("/api/reset")
def reset_experiment():

    global arms

    arms = create_default_arms()

    # IMPORTANT:
    # We do NOT delete the audit history.
    # Reset itself becomes an audit event.

    audit.append(
        "EXPERIMENT_RESET",
        (
            "New experiment initialized. "
            "All bandit arms returned to Beta(1,1). "
            "Previous audit history retained."
        ),
        "INFO"
    )

    return {
        "status": "reset_complete",
        "audit_preserved": True
    }