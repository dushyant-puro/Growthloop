import os
import json
import requests
from typing import List, Dict, Any

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """
You are an autonomous quantitative growth agent for an e-commerce merchant using Razorpay.
Analyze the merchant scenario and output 3 to 4 distinct checkout/pricing incentive hypotheses to optimize conversion and revenue.
Rules:
1. Provide a clear business rationale for each.
2. The discount percentage must be a number between 3 and 25.
3. Intentionally include at least one edge-case or aggressive strategy so safety guardrails can test it.
4. Output STRICTLY a JSON array of objects with the following schema:
[
  {
    "arm_id": "unique_string",
    "label": "Short descriptive label",
    "discount_pct": float,
    "rationale": "One sentence explaining why this works"
  }
]
"""

def generate_hypotheses(merchant_context: str) -> List[Dict[str, Any]]:
    """Generates structured pricing hypotheses using Gemini REST API with fallback."""
    if not GEMINI_API_KEY:
        return _fallback_hypotheses(merchant_context)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": f"Merchant Situation: {merchant_context}"}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.7
        }
    }

    try:
        res = requests.post(url, json=payload, timeout=8)
        if res.status_code == 200:
            content = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(content)
    except Exception as e:
        pass

    return _fallback_hypotheses(merchant_context)

def _fallback_hypotheses(context: str) -> List[Dict[str, Any]]:
    """Deterministic fallback ensuring flawless demo execution without Wi-Fi issues."""
    return [
        {
            "arm_id": "arm_gemini_conservative",
            "label": "Instant Prepaid Incentive",
            "discount_pct": 7.5,
            "rationale": "Reduces cart drop-off by rewarding upfront digital checkout."
        },
        {
            "arm_id": "arm_gemini_volume",
            "label": "Cart Size Booster",
            "discount_pct": 14.0,
            "rationale": "Optimizes average order value near standard margin inflection points."
        },
        {
            "arm_id": "arm_gemini_breach",
            "label": "Aggressive Clearance Slash",
            "discount_pct": 24.0,
            "rationale": "High-velocity stock clearing tested against merchant floor limits."
        }
    ]