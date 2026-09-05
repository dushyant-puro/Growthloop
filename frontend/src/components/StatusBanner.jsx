import { FlaskConical, CheckCircle2, Play, Zap } from "lucide-react";
import { Button } from "./Button";

export function StatusBanner({
  promoted = false,
  winner,
  activeArmsCount = 0,
  onRouteBatch,
  onDeployWinner,
  isProcessing = false,
  isDeploying = false,
}) {
  return (
    <section className={`status-banner ${promoted ? "promoted-state" : "learning-state"}`}>
      <div className="banner-left">
        <div className="banner-icon-box">
          {promoted ? (
            <CheckCircle2 size={22} className="banner-icon-svg" />
          ) : (
            <FlaskConical size={22} className="banner-icon-svg" />
          )}
        </div>

        <div className="banner-content">
          <h2 className="banner-heading">
            {promoted
              ? "Winning strategy is deployed"
              : "Experiment is actively learning"}
          </h2>
          <p className="banner-description">
            {promoted
              ? `${winner?.label || "Winner"} is currently promoted to the Razorpay test gateway.`
              : `${activeArmsCount} ${
                  activeArmsCount === 1 ? "strategy is" : "strategies are"
                } being evaluated using Thompson Sampling.`}
          </p>
        </div>
      </div>

      <div className="banner-actions">
        <Button
          variant="secondary"
          size="md"
          icon={Play}
          onClick={onRouteBatch}
          loading={isProcessing}
          disabled={isProcessing || activeArmsCount === 0}
        >
          Route 25 checkouts
        </Button>

        <Button
          variant="primary"
          size="md"
          icon={Zap}
          onClick={onDeployWinner}
          loading={isDeploying}
          disabled={isDeploying || !winner || promoted}
        >
          {promoted ? "Winner Deployed" : "Promote winner"}
        </Button>
      </div>
    </section>
  );
}

export default StatusBanner;
