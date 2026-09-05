import os
import json
import requests
from typing import List, Dict, Any


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")


SYSTEM_PROMPT = """
You are GrowthLoop, an autonomous revenue optimization agent for an
e-commerce merchant.

Your job is to analyze a merchant's checkout problem and propose
3 to 4 DISTINCT commercial strategies.

You are a STRATEGIST, not the safety authority.

The downstream deterministic policy engine will independently decide
whether each strategy is commercially safe.

You MUST return valid JSON matching the supplied schema.

For every strategy provide:

- unique arm_id
- short human-readable label
- discount_pct
- rationale
- expected_mechanism
- target_segment
- risk_level

The strategies should be meaningfully different.

Possible mechanisms include:

- prepaid incentive
- cart-value incentive
- urgency
- free-shipping threshold
- payment-method incentive
- bundle incentive

Do NOT provide explanations outside the JSON response.
"""


STRATEGY_SCHEMA = {
    "type": "object",
    "properties": {
        "strategies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "arm_id": {"type": "string"},
                    "label": {"type": "string"},
                    "discount_pct": {"type": "number"},
                    "rationale": {"type": "string"},
                    "expected_mechanism": {"type": "string"},
                    "target_segment": {"type": "string"},
                    "risk_level": {
                        "type": "string",
                        "enum": ["LOW", "MEDIUM", "HIGH"]
                    }
                },
                "required": [
                    "arm_id",
                    "label",
                    "discount_pct",
                    "rationale",
                    "expected_mechanism",
                    "target_segment",
                    "risk_level"
                ]
            }
        }
    },
    "required": ["strategies"]
}


def generate_hypotheses(merchant_context: str) -> List[Dict[str, Any]]:
    """
    Ask Gemini to generate structured commercial hypotheses.

    The LLM is NEVER trusted for safety decisions.
    Every result goes through deterministic guardrails in main.py.
    """

    if not GEMINI_API_KEY:
        return _fallback_hypotheses()

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/{GEMINI_MODEL}:generateContent"
        f"?key={GEMINI_API_KEY}"
    )

    prompt = f"""
Merchant context:

{merchant_context}

Generate 3 to 4 distinct checkout optimization strategies.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.8,
            "response_mime_type": "application/json",
            "response_schema": STRATEGY_SCHEMA
        }
    }

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=12
        )

        response.raise_for_status()

        body = response.json()

        text = (
            body["candidates"][0]
            ["content"]["parts"][0]["text"]
        )

        parsed = json.loads(text)

        strategies = parsed.get("strategies", [])

        if not strategies:
            raise ValueError("Gemini returned no strategies")

        return strategies[:4]

    except Exception:
        # Deterministic fallback keeps the demo operational.
        return _fallback_hypotheses()


def _fallback_hypotheses() -> List[Dict[str, Any]]:
    """
    Offline-safe deterministic strategies.

    Notice that the fallback includes one deliberately unsafe
    candidate. The guardrail engine must reject it.
    """

    return [
        {
            "arm_id": "ai_prepaid_075",
            "label": "Instant Prepaid Incentive",
            "discount_pct": 7.5,
            "rationale": (
                "Rewards customers who complete payment immediately, "
                "reducing payment hesitation."
            ),
            "expected_mechanism": "prepaid_conversion",
            "target_segment": "late_evening_cart_users",
            "risk_level": "LOW"
        },
        {
            "arm_id": "ai_cart_140",
            "label": "Cart Size Booster",
            "discount_pct": 14.0,
            "rationale": (
                "Uses a stronger incentive to increase both conversion "
                "and average basket value."
            ),
            "expected_mechanism": "basket_expansion",
            "target_segment": "high_value_carts",
            "risk_level": "MEDIUM"
        },
        {
            "arm_id": "ai_urgency_110",
            "label": "Late Evening Checkout Boost",
            "discount_pct": 11.0,
            "rationale": (
                "Targets the merchant's evening abandonment window "
                "with a moderate time-sensitive incentive."
            ),
            "expected_mechanism": "urgency",
            "target_segment": "late_evening_users",
            "risk_level": "LOW"
        },
        {
            "arm_id": "ai_poison_240",
            "label": "Aggressive Clearance Slash",
            "discount_pct": 24.0,
            "rationale": (
                "Aggressive clearance incentive intended to test the "
                "merchant's commercial policy boundary."
            ),
            "expected_mechanism": "aggressive_discount",
            "target_segment": "all_users",
            "risk_level": "HIGH"
        }
    ]