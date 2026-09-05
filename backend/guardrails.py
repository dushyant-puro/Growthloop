from typing import Dict, Any, List, Tuple


MAX_DISCOUNT_PERCENT: float = 20.0
MIN_PRICE_INR: float = 120.0


class GuardrailViolationError(Exception):
    """Exception raised when a commercial offer violates deterministic guardrails."""

    def __init__(self, violations: List[str]):
        self.violations = violations
        super().__init__(f"Guardrail violation(s): {'; '.join(violations)}")


def evaluate_guardrails(*args, **kwargs) -> Tuple[bool, str]:
    """
    Strict deterministic check that rejects:
      1. Any discount above 20% (discount_pct > 20.0)
      2. Any final/base price below ₹120 (price < 120.0)

    Supports:
      evaluate_guardrails(label, discount_pct, price)
      evaluate_guardrails(discount_pct, price)

    Returns:
      (passed: bool, reason: str)
    """
    discount_pct = 0.0
    price = 999.0

    if len(args) == 3:
        _, discount_pct, price = args
    elif len(args) == 2:
        discount_pct, price = args
    elif "discount_pct" in kwargs and "price" in kwargs:
        discount_pct = kwargs["discount_pct"]
        price = kwargs["price"]

    normalized_discount = discount_pct * 100.0 if 0 < discount_pct <= 1.0 else discount_pct

    violations: List[str] = []

    # Rule 1: Rejects any discount above 20%
    if normalized_discount > MAX_DISCOUNT_PERCENT:
        violations.append(
            f"Discount {normalized_discount:.1f}% exceeds maximum permitted ceiling of {MAX_DISCOUNT_PERCENT:.1f}%"
        )

    # Rule 2: Rejects any final price below ₹120
    final_price = price * (1.0 - (normalized_discount / 100.0))
    if final_price < MIN_PRICE_INR or price < MIN_PRICE_INR:
        violations.append(
            f"Final price ₹{final_price:.2f} falls below minimum allowable floor price of ₹{MIN_PRICE_INR:.2f}"
        )

    if violations:
        return False, "; ".join(violations)
    return True, "Passed all deterministic safety guardrails."
