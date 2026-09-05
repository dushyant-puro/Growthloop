import {
  BarChart3,
  TrendingUp,
  Target,
  FlaskConical,
  Zap,
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
import { MetricCard } from "../MetricCard";

export function PerformanceView({
  data,
  winner,
  activeArms,
  totalTrials,
  totalConversions,
  overallConversion,
  chartData,
}) {
  return (
    <div className="view-container">
      {/* 1. TOP METRIC SUMMARY */}
      <section className="metrics-grid" aria-label="Performance Metrics">
        <MetricCard
          icon={TrendingUp}
          label="OVERALL CONVERSION"
          value={`${overallConversion}%`}
          detail={`${totalConversions.toLocaleString()} conversions / ${totalTrials.toLocaleString()} checkouts`}
        />

        <MetricCard
          icon={Target}
          label="POSTERIOR LEADER"
          value={winner?.label || "Baseline — No Promotion"}
          detail={
            winner
              ? `${winner.win_rate}% probability of being best`
              : "No trials recorded"
          }
          positive={Boolean(winner)}
        />

        <MetricCard
          icon={Zap}
          label="TOTAL TRIALS EVALUATED"
          value={totalTrials.toLocaleString()}
          detail="Thompson Sampling customer checkouts"
        />

        <MetricCard
          icon={FlaskConical}
          label="ACTIVE CANDIDATES"
          value={activeArms.length}
          detail="Competing strategies in bandit pool"
        />
      </section>

      {/* 2. LARGE PERFORMANCE CHART */}
      <section className="panel chart-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">
              <BarChart3 size={14} className="eyebrow-icon" />
              <span>BAYESIAN CONFIDENCE</span>
            </div>
            <h2 className="panel-title">Posterior probability of being best</h2>
            <p className="panel-description">
              Simulated Bayesian posterior distribution via Thompson Sampling Monte Carlo draws.
            </p>
          </div>

          <div className="chart-badge">
            <span className="chart-pulse-dot" />
            <span>Live Bayesian update</span>
          </div>
        </div>

        <div className="chart-wrapper large-chart-wrapper">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: -15, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    fontSize: 12,
                    color: "#0f172a",
                    padding: "10px 14px",
                  }}
                  formatter={(val) => [`${val}%`, "Posterior Probability"]}
                />
                <Bar
                  dataKey="probability"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={70}
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
              <span>No simulation data available yet.</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. STRATEGY COMPARISON CARDS */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">
              <Target size={14} className="eyebrow-icon" />
              <span>STRATEGY COMPARISON</span>
            </div>
            <h2 className="panel-title">Active arm breakdown</h2>
            <p className="panel-description">
              Compare empirical evidence, conversion rates, and Beta distribution hyperparameters.
            </p>
          </div>
        </div>

        <div className="strategy-comparison-grid">
          {data.arms && data.arms.length > 0 ? (
            data.arms.map((arm) => {
              const isLeader = winner && arm.arm_id === winner.arm_id;
              const isPromoted = arm.status === "PROMOTED";
              const discountedPrice = (
                Number(data.item_price || 999) *
                (1 - arm.discount_pct / 100)
              ).toFixed(2);

              return (
                <div
                  key={arm.arm_id}
                  className={`strategy-card ${
                    isPromoted
                      ? "promoted-border"
                      : isLeader
                      ? "leader-border"
                      : ""
                  }`}
                >
                  <div className="strategy-card-header">
                    <div>
                      <div className="strategy-card-title">{arm.label}</div>
                      <div className="strategy-card-id">{arm.arm_id}</div>
                    </div>
                    <span
                      className={`badge ${
                        isPromoted
                          ? "badge-promoted"
                          : arm.status === "ACTIVE"
                          ? "badge-active"
                          : "badge-paused"
                      }`}
                    >
                      {arm.status}
                    </span>
                  </div>

                  <div className="strategy-card-metric">
                    <div className="metric-large-number">{arm.win_rate}%</div>
                    <div className="metric-large-caption">
                      Posterior probability of being best
                    </div>
                  </div>

                  <div className="strategy-stats-row">
                    <div className="stat-unit">
                      <span className="stat-unit-label">Trials</span>
                      <span className="stat-unit-val">
                        {(arm.trials || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="stat-unit">
                      <span className="stat-unit-label">Conversions</span>
                      <span className="stat-unit-val">
                        {(arm.conversions || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="stat-unit">
                      <span className="stat-unit-label">Observed CVR</span>
                      <span className="stat-unit-val font-mono">
                        {arm.empirical_conversion_rate}%
                      </span>
                    </div>
                  </div>

                  <div className="strategy-params-footer">
                    <div className="param-item">
                      <span className="param-key">Discount:</span>
                      <span className="param-val">{arm.discount_pct}%</span>
                    </div>
                    <div className="param-item">
                      <span className="param-key">Effective Price:</span>
                      <span className="param-val">₹{discountedPrice}</span>
                    </div>
                    <div className="param-item">
                      <span className="param-key">Prior / Posterior:</span>
                      <span className="param-val font-mono">
                        Beta({arm.alpha}, {arm.beta})
                      </span>
                    </div>
                  </div>

                  {arm.metadata?.rationale && (
                    <div className="strategy-rationale-box">
                      <span className="rationale-label">Agent Rationale:</span>
                      <p className="rationale-text">{arm.metadata.rationale}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state-box">
              <FlaskConical size={24} className="text-slate-400" />
              <span>No strategies present in experiment.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PerformanceView;
