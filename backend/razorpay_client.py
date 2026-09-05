import os
import time
import uuid
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("growthloop.razorpay")


class RazorpayClientWrapper:
    """
    Razorpay test-mode client with basic auth and graceful mock fallbacks.
    Handles order creation in INR (subunits: paise) and falls back to simulated
    orders if test credentials fail or network/auth errors occur.
    """

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None,
    ):
        self.key_id = key_id or os.getenv("RAZORPAY_KEY_ID", "rzp_test_mockGrowthLoopKey")
        self.key_secret = key_secret or os.getenv("RAZORPAY_KEY_SECRET", "mockGrowthLoopSecret")
        self._razorpay_client = None

        try:
            import razorpay
            # Razorpay SDK uses HTTP Basic Auth (key_id, key_secret)
            self._razorpay_client = razorpay.Client(auth=(self.key_id, self.key_secret))
            logger.info("Initialized Razorpay client with Key ID: %s...", self.key_id[:10])
        except Exception as err:
            logger.warning("Failed to initialize official Razorpay client: %s. Using mock fallback mode.", err)
            self._razorpay_client = None

    def create_order(
        self,
        amount_inr: float,
        currency: str = "INR",
        receipt: Optional[str] = None,
        notes: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Creates a payment order. Converts amount in INR to paise (subunits).
        If live/test API call fails or mock keys are used, returns a graceful mock order.
        """
        amount_paise = int(round(amount_inr * 100))
        receipt_id = receipt or f"rcpt_{uuid.uuid4().hex[:10]}"
        order_notes = notes or {}

        payload = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt_id,
            "notes": order_notes,
            "payment_capture": 1,
        }

        # Attempt API call if SDK client is initialized and keys are not generic dummy keys
        if self._razorpay_client and not self.key_id.startswith("rzp_test_mock"):
            try:
                order_response = self._razorpay_client.order.create(data=payload)
                order_response["is_mock"] = False
                logger.info("Razorpay order created successfully: %s", order_response.get("id"))
                return order_response
            except Exception as exc:
                logger.warning(
                    "Razorpay API call failed (%s). Falling back gracefully to mock order.",
                    exc,
                )

        # Graceful Mock Fallback
        mock_order_id = f"order_mock_{uuid.uuid4().hex[:14]}"
        mock_order = {
            "id": mock_order_id,
            "entity": "order",
            "amount": amount_paise,
            "amount_paid": 0,
            "amount_due": amount_paise,
            "currency": currency,
            "receipt": receipt_id,
            "status": "created",
            "attempts": 0,
            "notes": order_notes,
            "created_at": int(time.time()),
            "is_mock": True,
            "mock_reason": "Test mode / Fallback active",
        }
        logger.info("Generated mock Razorpay order: %s for ₹%.2f", mock_order_id, amount_inr)
        return mock_order


_default_client = RazorpayClientWrapper()


def create_razorpay_order(
    amount_inr: float,
    arm_id: Optional[str] = None,
    receipt: Optional[str] = None,
    notes: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Top-level convenience function used by main.py to generate a Razorpay order."""
    order_notes = dict(notes) if notes else {}
    if arm_id:
        order_notes["arm_id"] = arm_id
    return _default_client.create_order(
        amount_inr=amount_inr,
        receipt=receipt,
        notes=order_notes,
    )
