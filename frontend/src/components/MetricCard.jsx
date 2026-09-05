export function MetricCard({ icon: Icon, label, value, detail, positive = false, badge }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <div className="metric-label-group">
          {Icon && (
            <div className="metric-icon-box">
              <Icon size={16} />
            </div>
          )}
          <span className="metric-label">{label}</span>
        </div>
        {badge && <span className="metric-badge">{badge}</span>}
      </div>

      <div className={`metric-value ${positive ? "metric-positive" : ""}`}>
        {value}
      </div>

      {detail && <div className="metric-detail">{detail}</div>}
    </div>
  );
}

export default MetricCard;
