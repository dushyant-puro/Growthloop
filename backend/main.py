import time
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from bandit import BanditArm
from guardrails import evaluate_guardrails
from razorpay_client import create_razorpay_order
from agent import generate_hypotheses

app = FastAPI(title="GrowthLoop Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_ITEM_PRICE = 999.0
audit_trail = []

arms = [
    BanditArm("arm_ctrl", "Baseline (No Promo)", 0.0, base_sim_rate=0.07),
    BanditArm("arm_v1", "Variant A (8% Instant Off)", 8.0, base_sim_rate=0.14),
    BanditArm("arm_v2", "Variant B (15% Cart Incentive)", 15.0, base_sim_rate=0.26),
]

def append_audit(action_type: str, message: str, status: str = "INFO"):
    audit_trail.append({
        "timestamp": time.strftime("%H:%M:%S"),
        "type": action_type,
        "message": message,
        "status": status
    })

class StrategyRequest(BaseModel):
    context: str

@app.get("/api/state")
def get_system_state():
    return {
        "item_price": BASE_ITEM_PRICE,
        "arms": [arm.to_dict() for arm in arms],
        "audit_trail": audit_trail[-25:]
    }

@app.post("/api/agent/hypothesize")
def agent_hypothesize(req: StrategyRequest):
    global arms
    proposed_strategies = generate_hypotheses(req.context)
    new_arms = []
    
    append_audit(
        "AGENT_REASONING_START",
        f"Evaluated context: '{req.context}'. Proposing {len(proposed_strategies)} candidate arms.",
        status="NORMAL"
    )

    for strat in proposed_strategies:
        label = strat["label"]
        discount = float(strat["discount_pct"])
        arm_id = strat["arm_id"]
        rationale = strat.get("rationale", "")

        is_safe, reason = evaluate_guardrails(label, discount, BASE_ITEM_PRICE)
        
        if is_safe:
            simulated_cvr = min(0.08 + (discount / 100.0) * 0.9, 0.45)
            arm = BanditArm(arm_id, label, discount, base_sim_rate=simulated_cvr)
            new_arms.append(arm)
            append_audit(
                "ARM_ACCEPTED",
                f"Approved '{label}' ({discount}%): {rationale}",
                status="SUCCESS"
            )
        else:
            append_audit(
                "ARM_REJECTED",
                f"Blocked '{label}' ({discount}%): {reason}",
                status="CRITICAL"
            )

    if new_arms:
        arms = new_arms

    return {
        "status": "success",
        "active_arms": [a.to_dict() for a in arms]
    }

@app.post("/api/simulate-batch")
def simulate_traffic_batch(trials: int = 25):
    active_arms = [a for a in arms if a.status == "ACTIVE"]
    if not active_arms:
        return {"error": "No active arms available."}

    for _ in range(trials):
        samples = [(arm.sample(), arm) for arm in active_arms]
        _, selected_arm = max(samples, key=lambda pair: pair[0])

        converted = random.random() < selected_arm.base_sim_rate
        selected_arm.update(converted)

    append_audit(
        "BANDIT_TRAFFIC_STEP",
        f"Routed {trials} checkouts. Thompson sampling posterior probabilities updated.",
        status="NORMAL"
    )
    return {"arms": [arm.to_dict() for arm in arms]}

@app.post("/api/test-guardrail-violation")
def trigger_guardrail_violation():
    candidate_label = "Variant Poison (35% Flash Cut)"
    candidate_discount = 35.0
    passed, reason = evaluate_guardrails(candidate_label, candidate_discount, BASE_ITEM_PRICE)

    append_audit(
        "GUARDRAIL_INTERCEPT",
        f"Rejected '{candidate_label}' ({candidate_discount}%): {reason}",
        status="CRITICAL"
    )
    return {"accepted": passed, "reason": reason}

@app.post("/api/deploy-winner")
def deploy_winning_strategy():
    active_arms = [a for a in arms if a.status == "ACTIVE"]
    if not active_arms:
        return {"error": "No active candidates."}

    winner = max(active_arms, key=lambda a: a.conversions / max(a.trials, 1))
    winner.status = "PROMOTED"

    final_price = BASE_ITEM_PRICE * (1.0 - (winner.discount_pct / 100.0))
    order = create_razorpay_order(final_price, winner.arm_id, f"exp_{int(time.time())}")

    append_audit(
        "RAZORPAY_ORDER_CREATED",
        f"Promoted '{winner.label}'. Razorpay Order ID: {order['id']} for ₹{final_price:.2f}.",
        status="SUCCESS"
    )
    return {"winner": winner.to_dict(), "razorpay_order": order}

@app.post("/api/reset")
def reset_experiment():
    global arms, audit_trail
    arms = [
        BanditArm("arm_ctrl", "Baseline (No Promo)", 0.0, base_sim_rate=0.07),
        BanditArm("arm_v1", "Variant A (8% Instant Off)", 8.0, base_sim_rate=0.14),
        BanditArm("arm_v2", "Variant B (15% Cart Incentive)", 15.0, base_sim_rate=0.26),
    ]
    audit_trail.clear()
    append_audit("SYSTEM_INIT", "Bandit priors re-initialized to Beta(1, 1).", status="INFO")
    return {"status": "reset_complete"}