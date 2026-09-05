import random
from typing import Dict, Any, Optional


class BanditArm:
    """
    Bayesian Bernoulli bandit arm.

    Posterior:
        Beta(alpha, beta)

    Thompson Sampling:
        draw theta ~ Beta(alpha, beta)

    Conversion:
        alpha += 1

    Non-conversion:
        beta += 1
    """

    def __init__(
        self,
        arm_id: str,
        label: str,
        discount_pct: float,
        price: float = 999.0,
        true_conversion_rate: float = 0.10,
        alpha: float = 1.0,
        beta: float = 1.0,
        status: str = "ACTIVE",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.arm_id = arm_id
        self.label = label
        self.name = label

        self.discount_pct = float(discount_pct)
        self.price = float(price)

        # Hidden simulation parameter.
        # It is intentionally NOT exposed to the frontend.
        self._true_conversion_rate = float(true_conversion_rate)

        self.alpha = float(alpha)
        self.beta = float(beta)

        self.trials = 0
        self.conversions = 0

        self.status = status
        self.metadata = metadata or {}

    # ---------------------------------------------------------
    # THOMPSON SAMPLING
    # ---------------------------------------------------------

    def sample(self) -> float:
        """
        Draw one Thompson Sampling value from the posterior.
        """

        return random.betavariate(
            self.alpha,
            self.beta
        )

    # ---------------------------------------------------------
    # BAYESIAN UPDATE
    # ---------------------------------------------------------

    def update(self, converted: bool) -> None:
        """
        Update posterior after observing one customer.
        """

        self.trials += 1

        if converted:
            self.alpha += 1.0
            self.conversions += 1
        else:
            self.beta += 1.0

    # ---------------------------------------------------------
    # POSTERIOR STATISTICS
    # ---------------------------------------------------------

    @property
    def posterior_mean(self) -> float:
        """
        Expected value of Beta(alpha, beta).
        """

        return self.alpha / (
            self.alpha + self.beta
        )

    @property
    def empirical_conversion_rate(self) -> float:
        """
        Observed conversion rate.
        """

        if self.trials == 0:
            return 0.0

        return self.conversions / self.trials

    @property
    def posterior_probability_pct(self) -> float:
        return round(
            self.posterior_mean * 100,
            2
        )

    @property
    def win_rate(self) -> float:
        """
        Backwards-compatible field for frontend.

        This is now explicitly the posterior mean,
        not empirical conversion rate.
        """

        return self.posterior_probability_pct

    # ---------------------------------------------------------
    # SERIALIZATION
    # ---------------------------------------------------------

    def to_dict(self) -> Dict[str, Any]:

        return {
            "arm_id": self.arm_id,
            "label": self.label,
            "name": self.name,

            "discount_pct": self.discount_pct,
            "price": self.price,

            "alpha": round(self.alpha, 2),
            "beta": round(self.beta, 2),

            "trials": self.trials,
            "conversions": self.conversions,

            "posterior_mean": round(
                self.posterior_mean * 100,
                2
            ),

            "empirical_conversion_rate": round(
                self.empirical_conversion_rate * 100,
                2
            ),

            "win_rate": self.posterior_probability_pct,

            "status": self.status,

            "metadata": self.metadata
        }