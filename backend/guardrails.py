from dataclasses import dataclass
from typing import List


MAX_DISCOUNT_PERCENT = 20.0
MIN_CHECKOUT_PRICE_INR = 120.0


@dataclass
class GuardrailResult:
    """
    Complete result of deterministic commercial validation.
    """

    passed: bool
    violations: List[str]
    final_price: float

    @property
    def severity(self) -> str:
        if self.passed:
            return "PASS"

        return "CRITICAL"


def evaluate_guardrails(
    discount_pct: float,
    base_price: float
) -> GuardrailResult:
    """
    Deterministic financial policy engine.

    Rules:

    1. Discount cannot exceed 20%.
    2. Discount cannot be negative.
    3. Base price must be positive.
    4. Final checkout price cannot fall below ₹120.

    The LLM has no authority over these rules.
    """

    violations: List[str] = []

    discount = float(discount_pct)
    price = float(base_price)

    if price <= 0:
        violations.append(
            "Base price must be greater than ₹0."
        )

    if discount < 0:
        violations.append(
            "Negative discounts are not permitted."
        )

    if discount > MAX_DISCOUNT_PERCENT:
        violations.append(
            f"Discount {discount:.1f}% exceeds "
            f"the maximum permitted ceiling of "
            f"{MAX_DISCOUNT_PERCENT:.1f}%."
        )

    final_price = price * (
        1.0 - discount / 100.0
    )

    if final_price < MIN_CHECKOUT_PRICE_INR:
        violations.append(
            f"Final checkout price ₹{final_price:.2f} "
            f"is below the minimum permitted price "
            f"of ₹{MIN_CHECKOUT_PRICE_INR:.2f}."
        )

    return GuardrailResult(
        passed=len(violations) == 0,
        violations=violations,
        final_price=round(final_price, 2)
    )


def validate_strategy(
    discount_pct: float,
    base_price: float
) -> GuardrailResult:
    """
    Explicit public API used by main.py.
    """

    return evaluate_guardrails(
        discount_pct,
        base_price
    )