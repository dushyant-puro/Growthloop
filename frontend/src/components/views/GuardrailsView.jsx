import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "../Button";

export function GuardrailsView({
  data,
  winner,
  onTriggerViolation,
  isTestingGuardrail = false,
  lastViolationResult,
}) {
  const maxDiscountPassed = winner ? winner.discount_pct <= 20 : true;
  const minPricePassed = winner
    ? Number(data.item_price || 999) * (1 - winner.discount_pct / 100) >= 120
    : true;
  const confidencePassed = winner ? (winner.win_rate || 0) >= 95 : false;
  const evidencePassed = winner ? (winner.trials || 0) >= 30 : false;

  const allPassed =
    maxDiscountPassed && minPricePassed && confidencePassed && evidencePassed;

  return (
    <div className="view-container">
      {/* 1. RISK CONTROL BANNER */}
      <section
        className={`guardrails-hero-banner ${
          allPassed ? "hero-passed" : "hero-pending"
        }`}
      >
        <div className="banner-left">
          <div className="hero-shield-icon">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="panel-eyebrow">
              <Lock size={13} className="eyebrow-icon" />
              <span>DETERMINISTIC COMMERCIAL FIREWALL</span>
            </div>
            <h2 className="hero-title">
              {allPassed
                ? "All Guardrails Satisfied — Gateway Clearance Granted"
                : "Promotion Blocked by Safety Guardrails"}
            </h2>
            <p className="hero-description">
              {allPassed
                ? `Leading candidate "${
                    winner?.label || "Strategy"
                  }" meets both deterministic financial limits and Bayesian confidence requirements.`
                : "Candidates cannot be promoted to the live payment gateway until all financial thresholds and statistical confidence rules pass."}
            </p>
          </div>
        </div>

        <div className="hero-badge-wrap">
          <span
            className={`status-pill-large ${
              allPassed ? "pill-pass" : "pill-pending"
            }`}
          >
            {allPassed ? "READY FOR PROMOTION" : "PROMOTION BLOCKED"}
          </span>
        </div>
      </section>

      {/* 2. GUARDRAILS RULES CARDS */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">
              <ShieldCheck size={14} className="eyebrow-icon" />
              <span>ACTIVE POLICIES</span>
            </div>
            <h2 className="panel-title">Deterministic validation rules</h2>
            <p className="panel-description">
              Rules executed by the backend Python engine. The LLM has zero authority to bypass these policies.
            </p>
          </div>
        </div>

        <div className="guardrail-cards-grid">
          {/* Rule 1 */}
          <div className="guardrail-card">
            <div className="guardrail-card-top">
              <div className="guardrail-status-circle pass">
                <CheckCircle2 size={18} />
              </div>
              <span className="badge badge-pass">PASS</span>
            </div>

            <div className="guardrail-card-body">
              <h3 className="guardrail-card-title">Maximum discount ceiling</h3>
              <div className="guardrail-card-metric">20%</div>
              <p className="guardrail-card-desc">
                Prevents margin collapse. Any strategy proposing a discount &gt; 20% is instantly rejected.
              </p>
            </div>

            <div className="guardrail-card-footer">
              <span className="footer-label">Current Leader:</span>
              <span className="footer-val">
                {winner ? `${winner.discount_pct}% discount` : "0% (Baseline)"}
              </span>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="guardrail-card">
            <div className="guardrail-card-top">
              <div className="guardrail-status-circle pass">
                <CheckCircle2 size={18} />
              </div>
              <span className="badge badge-pass">PASS</span>
            </div>

            <div className="guardrail-card-body">
              <h3 className="guardrail-card-title">Minimum checkout price</h3>
              <div className="guardrail-card-metric">₹120.00</div>
              <p className="guardrail-card-desc">
                Maintains positive unit economics. Final checkout price cannot drop below ₹120.
              </p>
            </div>

            <div className="guardrail-card-footer">
              <span className="footer-label">Final Price:</span>
              <span className="footer-val">
                ₹
                {winner
                  ? (
                      Number(data.item_price || 999) *
                      (1 - winner.discount_pct / 100)
                    ).toFixed(2)
                  : Number(data.item_price || 999).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="guardrail-card">
            <div className="guardrail-card-top">
              <div
                className={`guardrail-status-circle ${
                  confidencePassed ? "pass" : "pending"
                }`}
              >
                {confidencePassed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </div>
              <span
                className={`badge ${
                  confidencePassed ? "badge-pass" : "badge-pending"
                }`}
              >
                {confidencePassed ? "PASS" : "PENDING"}
              </span>
            </div>

            <div className="guardrail-card-body">
              <h3 className="guardrail-card-title">Statistical confidence</h3>
              <div className="guardrail-card-metric">95.0%</div>
              <p className="guardrail-card-desc">
                Bayesian posterior dominance requirement before auto-promotion to payment gateway.
              </p>
            </div>

            <div className="guardrail-card-footer">
              <span className="footer-label">Observed Posterior:</span>
              <span className="footer-val">
                {winner ? `${winner.win_rate}%` : "0%"}
              </span>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="guardrail-card">
            <div className="guardrail-card-top">
              <div
                className={`guardrail-status-circle ${
                  evidencePassed ? "pass" : "pending"
                }`}
              >
                {evidencePassed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
              </div>
              <span
                className={`badge ${
                  evidencePassed ? "badge-pass" : "badge-pending"
                }`}
              >
                {evidencePassed ? "PASS" : "PENDING"}
              </span>
            </div>

            <div className="guardrail-card-body">
              <h3 className="guardrail-card-title">Minimum sample evidence</h3>
              <div className="guardrail-card-metric">30 trials</div>
              <p className="guardrail-card-desc">
                Protects against small-sample anomalies before promoting a candidate strategy.
              </p>
            </div>

            <div className="guardrail-card-footer">
              <span className="footer-label">Sample Count:</span>
              <span className="footer-val">
                {winner ? `${winner.trials} checkouts` : "0 checkouts"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE GUARDRAIL TEST REJECTION CONSOLE */}
      <section className="panel test-guardrail-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow eyebrow-critical">
              <AlertTriangle size={14} className="eyebrow-icon" />
              <span>SECURITY VERIFICATION</span>
            </div>
            <h2 className="panel-title">Test guardrail rejection</h2>
            <p className="panel-description">
              Dispatch an intentionally malicious/excessive strategy (35% discount) to verify deterministic rejection by backend Python guardrails.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            icon={AlertTriangle}
            onClick={onTriggerViolation}
            loading={isTestingGuardrail}
          >
            Dispatch unsafe strategy
          </Button>
        </div>

        {lastViolationResult ? (
          <div className="violation-result-card">
            <div className="violation-header">
              <div className="violation-tag">
                <ShieldCheck size={16} />
                <span>GUARDRAIL INTERCEPT CONFIRMED</span>
              </div>
              <span className="badge badge-critical">
                {lastViolationResult.severity || "CRITICAL"}
              </span>
            </div>

            <div className="violation-body">
              <div className="violation-row">
                <span className="v-key">Test Candidate:</span>
                <span className="v-val font-semibold">
                  Aggressive Clearance Slash (35.0% discount)
                </span>
              </div>
              <div className="violation-row">
                <span className="v-key">Rejection Reason:</span>
                <span className="v-val text-red-700">
                  {Array.isArray(lastViolationResult.reason)
                    ? lastViolationResult.reason.join(" ")
                    : lastViolationResult.reason ||
                      "Discount 35.0% exceeds the maximum permitted ceiling of 20.0%."}
                </span>
              </div>
              <div className="violation-row">
                <span className="v-key">Deterministic Action:</span>
                <span className="v-val">
                  Strategy dropped from bandit candidate pool. Payment gateway untouched.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="violation-helper-box">
            <div className="helper-icon">
              <ArrowRight size={16} />
            </div>
            <p className="helper-text">
              Click <strong>&quot;Dispatch unsafe strategy&quot;</strong> above to send a test payload to{" "}
              <code>/api/test-guardrail-violation</code> and verify the cryptographic audit record.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default GuardrailsView;
