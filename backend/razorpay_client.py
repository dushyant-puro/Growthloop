import os
import uuid
import logging
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()



import razorpay


logger = logging.getLogger(
    "growthloop.razorpay"
)


class RazorpayConfigurationError(Exception):
    pass


class RazorpayOrderError(Exception):
    pass


class RazorpayClientWrapper:
    """
    Razorpay Test Mode order client.

    IMPORTANT:
    This client does not fabricate successful orders.

    If credentials are missing or the Razorpay API fails,
    an exception is raised and the caller can display a
    graceful failure state.
    """

    def __init__(
        self,
        key_id: Optional[str] = None,
        key_secret: Optional[str] = None
    ):

        self.key_id = key_id or os.getenv(
            "RAZORPAY_KEY_ID"
        )

        self.key_secret = key_secret or os.getenv(
            "RAZORPAY_KEY_SECRET"
        )

        if not self.key_id:
            raise RazorpayConfigurationError(
                "RAZORPAY_KEY_ID is not configured."
            )

        if not self.key_secret:
            raise RazorpayConfigurationError(
                "RAZORPAY_KEY_SECRET is not configured."
            )

        self.client = razorpay.Client(
            auth=(
                self.key_id,
                self.key_secret
            )
        )

    def create_order(
        self,
        amount_inr: float,
        receipt: Optional[str] = None,
        notes: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:

        if amount_inr <= 0:
            raise RazorpayOrderError(
                "Order amount must be greater than zero."
            )

        amount_paise = int(
            round(amount_inr * 100)
        )

        receipt_id = (
            receipt
            or f"growthloop_{uuid.uuid4().hex[:12]}"
        )

        payload = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt_id,
            "notes": notes or {}
        }

        try:

            order = self.client.order.create(
                data=payload
            )

            order["is_test_mode"] = True

            return order

        except Exception as exc:

            logger.exception(
                "Razorpay order creation failed"
            )

            raise RazorpayOrderError(
                f"Razorpay API failed: {str(exc)}"
            ) from exc


_default_client = None


def get_razorpay_client():

    global _default_client

    if _default_client is None:
        _default_client = RazorpayClientWrapper()

    return _default_client


def create_razorpay_order(
    amount_inr: float,
    arm_id: Optional[str] = None,
    receipt: Optional[str] = None,
    notes: Optional[Dict[str, Any]] = None
):

    order_notes = dict(notes or {})

    if arm_id:
        order_notes["arm_id"] = arm_id

    return get_razorpay_client().create_order(
        amount_inr=amount_inr,
        receipt=receipt,
        notes=order_notes
    )