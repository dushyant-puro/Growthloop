import {
  Target,
  TrendingUp,
  FlaskConical,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { StatusBanner } from "../StatusBanner";
import { MetricCard } from "../MetricCard";
import { AIStrategyGenerator } from "../AIStrategyGenerator";
import { Button } from "../Button";

export function ExperimentView({
  data,
  winner,
  activeArms,
  totalTrials,
  totalConversions,
  overallConversion,
  promoted,
  chartData,
  merchantContext,
  setMerchantContext,
  onGenerateHypotheses,
  isGenerating,
  onRouteBatch,
  isProcessing,
  onDeployWinner,
  isDeploying,
  onTriggerViolation,
  isTestingGuardrail,
  onNavigateView,
}) {
  // Guardrail checks for leading candidate
  const maxDiscountPassed = winner ? winner.discount_pct <= 20 : true;
  const minPricePassed = winner
    ? Number(data.item_price || 999) * (1 - winner.discount_pct / 100) >= 120
    : true;
  const confidencePassed = winner ? (winner.win_rate || 0) >= 95 : false;
  const evidencePassed = winner ? (winner.trials || 0) >= 30 : false;

  return (
    <div className="view-container">
      {/* 1. DEPLOYMENT STATUS BANNER */}
      <StatusBanner
        promoted={promoted}
        winner={winner}
        activeArmsCount={activeArms.length}
        onRouteBatch={onRouteBatch}
        onDeployWinner={onDeployWinner}
        isProcessing={isProcessing}
        isDeploying={isDeploying}
      />

      {/* 2. KPI CARDS */}
      <section className="metrics-grid" aria-label="Key Performance Indicators">
        <MetricCard
          icon={Target}
          label="LEADING STRATEGY"
          value={winner?.label || "Baseline — No Promotion"}
          detail={
            winner
              ? `${winner.win_rate}% posterior probability`
              : "Awaiting trials"
          }
          positive={Boolean(winner)}
        />

        <MetricCard
          icon={TrendingUp}
          label="OVERALL CONVERSION"
          value={`${overallConversion}%`}
          detail={`${totalConversions.toLocaleString()} conversions from ${totalTrials.toLocaleString()} trials`}
        />

        <MetricCard
          icon={FlaskConical}
          label="ACTIVE CANDIDATES"
          value={activeArms.length}
          detail="Strategies currently learning"
        />

        <MetricCard
          icon={CircleDollarSign}
          label="BASE ITEM PRICE"
          value={`₹${Number(data.item_price || 999).toLocaleString("en-IN")}`}
          detail="Before strategy discount"
        />
      </section>

      {/* 3. AI STRATEGY GENERATOR */}
      <AIStrategyGenerator
        merchantContext={merchantContext}
        setMerchantContext={setMerchantContext}
        onGenerate={onGenerateHypotheses}
        isGenerating={isGenerating}
      />

      {/* 4. PERFORMANCE & GUARDRAILS 2-COLUMN GRID */}
      <section className="dashboard-two-column">
        {/* EXPERIMENT PERFORMANCE CHART */}
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <div className="panel-eyebrow">
                <BarChart3 size={14} className="eyebrow-icon" />
                <span>EXPERIMENT PERFORMANCE</span>
              </div>
              <h2 className="panel-title">Posterior probability of being best</h2>
              <p className="panel-description">
                Thompson Sampling confidence across active strategies.
              </p>
            </div>

            <div className="chart-badge">
              <span className="chart-pulse-dot" />
              <span>Live Bayesian update</span>
            </div>
          </div>

          <div className="chart-wrapper">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: 12,
                      color: "#0f172a",
                      padding: "8px 12px",
                    }}
                    formatter={(val) => [`${val}%`, "Posterior Probability"]}
                  />
                  <Bar
                    dataKey="probability"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={
                          entry.status === "PROMOTED"
                            ? "#047857"
                            : entry.name === winner?.label
                            ? "#10b981"
                            : "#94a3b8"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-state">
                <BarChart3 size={24} className="text-slate-400" />
                <span>Run simulated checkouts to populate the Bayesian posterior.</span>
              </div>
            )}
          </div>
        </div>

        {/* GUARDRAILS SUMMARY CARD */}
        <div className="panel guardrails-summary-panel">
          <div className="panel-header">
            <div>
              <div className="panel-eyebrow">
                <ShieldCheck size={14} className="eyebrow-icon" />
                <span>RISK CONTROL</span>
              </div>
              <h2 className="panel-title">Guardrails</h2>
              <p className="panel-description">
                Deterministic financial controls run before promotion.
              </p>
            </div>
          </div>

          <div className="guardrails-list">
            <div className="guardrail-row">
              <div className="guardrail-left">
                <div
                  className={`guardrail-status-icon ${
                    maxDiscountPassed ? "pass" : "pending"
                  }`}
                >
                  {maxDiscountPassed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div>
                  <div className="guardrail-label">Maximum discount</div>
                  <div className="guardrail-value">20% ceiling</div>
                </div>
              </div>
              <span
                className={`badge ${
                  maxDiscountPassed ? "badge-pass" : "badge-critical"
                }`}
              >
                {maxDiscountPassed ? "PASS" : "BLOCKED"}
              </span>
            </div>

            <div className="guardrail-row">
              <div className="guardrail-left">
                <div
                  className={`guardrail-status-icon ${
                    minPricePassed ? "pass" : "pending"
                  }`}
                >
                  {minPricePassed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div>
                  <div className="guardrail-label">Minimum checkout price</div>
                  <div className="guardrail-value">₹120 floor</div>
                </div>
              </div>
              <span
                className={`badge ${
                  minPricePassed ? "badge-pass" : "badge-critical"
                }`}
              >
                {minPricePassed ? "PASS" : "BLOCKED"}
              </span>
            </div>

            <div className="guardrail-row">
              <div className="guardrail-left">
                <div
                  className={`guardrail-status-icon ${
                    confidencePassed ? "pass" : "pending"
                  }`}
                >
                  {confidencePassed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div>
                  <div className="guardrail-label">Statistical confidence</div>
                  <div className="guardrail-value">
                    95% threshold ({winner ? `${winner.win_rate}%` : "0%"})
                  </div>
                </div>
              </div>
              <span
                className={`badge ${
                  confidencePassed ? "badge-pass" : "badge-pending"
                }`}
              >
                {confidencePassed ? "PASS" : "PENDING"}
              </span>
            </div>

            <div className="guardrail-row">
              <div className="guardrail-left">
                <div
                  className={`guardrail-status-icon ${
                    evidencePassed ? "pass" : "pending"
                  }`}
                >
                  {evidencePassed ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                </div>
                <div>
                  <div className="guardrail-label">Minimum evidence</div>
                  <div className="guardrail-value">
                    30 checkouts ({winner ? `${winner.trials} recorded` : "0"})
                  </div>
                </div>
              </div>
              <span
                className={`badge ${
                  evidencePassed ? "badge-pass" : "badge-pending"
                }`}
              >
                {evidencePassed ? "PASS" : "PENDING"}
              </span>
            </div>
          </div>

          <div className="guardrail-footer-action">
            <Button
              variant="danger"
              size="md"
              icon={AlertTriangle}
              onClick={onTriggerViolation}
              loading={isTestingGuardrail}
              className="w-full"
            >
              Test guardrail rejection
            </Button>
          </div>
        </div>
      </section>

      {/* 5. STRATEGY CANDIDATES TABLE */}
      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">
              <Target size={14} className="eyebrow-icon" />
              <span>STRATEGY CANDIDATES</span>
            </div>
            <h2 className="panel-title">Experiment arms</h2>
          </div>
          <div className="table-meta-tag">
            {totalTrials.toLocaleString()} total checkouts
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Discount</th>
                <th>Trials</th>
                <th>Conversions</th>
                <th>Observed CVR</th>
                <th>Posterior</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.arms && data.arms.length > 0 ? (
                data.arms.map((arm) => {
                  const isLeader = winner && arm.arm_id === winner.arm_id;
                  const isPromoted = arm.status === "PROMOTED";
                  return (
                    <tr key={arm.arm_id}>
                      <td>
                        <div className="strategy-identity">
                          <div
                            className={`strategy-symbol ${
                              isPromoted
                                ? "symbol-promoted"
                                : isLeader
                                ? "symbol-leader"
                                : ""
                            }`}
                          >
                            {isPromoted ? (
                              <Check size={14} />
                            ) : (
                              <Target size={14} />
                            )}
                          </div>
                          <div>
                            <div className="strategy-name">{arm.label}</div>
                            <div className="strategy-id">{arm.arm_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono">{arm.discount_pct}%</span>
                      </td>
                      <td>{(arm.trials || 0).toLocaleString()}</td>
                      <td>{(arm.conversions || 0).toLocaleString()}</td>
                      <td>
                        <div className="cvr-cell">
                          <span className="font-mono">
                            {arm.empirical_conversion_rate}%
                          </span>
                          <div className="mini-bar-track">
                            <div
                              className="mini-bar-fill"
                              style={{
                                width: `${Math.min(
                                  arm.empirical_conversion_rate || 0,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="posterior-cell">
                          <span className="font-semibold font-mono">
                            {arm.win_rate}%
                          </span>
                          {isLeader && (
                            <span className="leader-pill">LEADING</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            arm.status === "PROMOTED"
                              ? "badge-promoted"
                              : arm.status === "ACTIVE"
                              ? "badge-active"
                              : "badge-paused"
                          }`}
                        >
                          {arm.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No active strategies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. IMMUTABLE AUDIT PREVIEW */}
      <section className="panel audit-preview-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">
              <ShieldCheck size={14} className="eyebrow-icon" />
              <span>GOVERNANCE</span>
            </div>
            <h2 className="panel-title">Immutable audit trail</h2>
            <p className="panel-description">
              Every strategy decision and payment action is cryptographically recorded for traceability.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={ChevronRight}
            onClick={() => onNavigateView("audit")}
          >
            View all audit events
          </Button>
        </div>

        <div className="audit-preview-list">
          {data.audit_trail && data.audit_trail.length > 0 ? (
            data.audit_trail
              .slice()
              .reverse()
              .slice(0, 5)
              .map((log, index) => (
                <div key={log.event_id || index} className="audit-preview-item">
                  <div
                    className={`audit-marker ${
                      log.status === "SUCCESS"
                        ? "marker-success"
                        : log.status === "CRITICAL"
                        ? "marker-critical"
                        : "marker-info"
                    }`}
                  />
                  <div className="audit-preview-content">
                    <div className="audit-preview-top">
                      <span className="audit-type-tag">{log.type}</span>
                      <span className="audit-timestamp">{log.timestamp}</span>
                    </div>
                    <div className="audit-message">{log.message}</div>
                  </div>
                </div>
              ))
          ) : (
            <div className="empty-audit-state">
              <Clock3 size={18} className="text-slate-400" />
              <span>No audit logs recorded yet.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ExperimentView;
