import random
from typing import Dict, Any, Optional


class BanditArm:
    """
    Beta-Binomial Thompson Sampling Arm for dynamic offer/pricing optimization.
    Maintains alpha (successes/conversions) and beta (failures/non-conversions) priors.
    """

    def __init__(
        self,
        arm_id: str,
        label: str,
        discount_pct: float,
        price: float = 999.0,
        base_sim_rate: float = 0.1,
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
        self.base_sim_rate = float(base_sim_rate)
        self.alpha = float(alpha)
        self.beta = float(beta)
        self.trials = 0
        self.conversions = 0
        self.status = status
        self.metadata = metadata or {}

    def sample(self) -> float:
        """Draw a random sample from the Beta(alpha, beta) posterior distribution."""
        return random.betavariate(self.alpha, self.beta)

    def update(self, converted: bool) -> None:
        """Update Beta priors and trial counts based on conversion outcome."""
        self.trials += 1
        if converted:
            self.alpha += 1.0
            self.conversions += 1
        else:
            self.beta += 1.0

    @property
    def successes(self) -> int:
        return self.conversions

    @property
    def win_rate(self) -> float:
        """Win rate percentage."""
        if self.trials == 0:
            return round((self.alpha / (self.alpha + self.beta)) * 100, 1)
        return round((self.conversions / self.trials) * 100, 1)

    @property
    def expected_conversion_rate(self) -> float:
        return self.alpha / (self.alpha + self.beta)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize arm state to dictionary format for frontend & API consumption."""
        return {
            "arm_id": self.arm_id,
            "label": self.label,
            "name": self.name,
            "discount_pct": self.discount_pct,
            "price": self.price,
            "base_sim_rate": self.base_sim_rate,
            "alpha": round(self.alpha, 2),
            "beta": round(self.beta, 2),
            "trials": self.trials,
            "conversions": self.conversions,
            "win_rate": self.win_rate,
            "status": self.status,
            "metadata": self.metadata,
        }
