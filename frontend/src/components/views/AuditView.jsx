import { useState, useMemo } from "react";
import {
  Clock3,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Filter,
} from "lucide-react";

export function AuditView({ data }) {
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const logs = useMemo(() => {
    const rawLogs = data.audit_trail || [];
    return rawLogs.slice().reverse();
  }, [data.audit_trail]);

  const filteredLogs = useMemo(() => {
    if (severityFilter === "ALL") return logs;
    return logs.filter((log) => {
      const status = log.status?.toUpperCase();
      if (severityFilter === "INFO") {
        return status === "NORMAL" || status === "INFO";
      }
      return status === severityFilter;
    });
  }, [logs, severityFilter]);

  const counts = useMemo(() => {
    return {
      all: logs.length,
      success: logs.filter((l) => l.status?.toUpperCase() === "SUCCESS").length,
      info: logs.filter(
        (l) =>
          l.status?.toUpperCase() === "NORMAL" ||
          l.status?.toUpperCase() === "INFO"
      ).length,
      critical: logs.filter((l) => l.status?.toUpperCase() === "CRITICAL")
        .length,
    };
  }, [logs]);

  return (
    <div className="view-container">
      {/* 1. CRYPTOGRAPHIC CHAIN STATUS BANNER */}
      <section className="panel chain-verification-panel">
        <div className="chain-panel-left">
          <div className="chain-icon-box">
            <ShieldCheck size={22} className="text-emerald-700" />
          </div>
          <div>
            <div className="panel-eyebrow">
              <ShieldCheck size={13} className="eyebrow-icon" />
              <span>CRYPTOGRAPHIC INTEGRITY</span>
            </div>
            <h2 className="chain-title">
              {data.audit_verified
                ? "SHA-256 Hash Chain Verified"
                : "Hash Chain Verification Pending"}
            </h2>
            <p className="chain-desc">
              Every audit log is cryptographically chained with the previous record&apos;s SHA-256 digest, guaranteeing tamper resistance.
            </p>
          </div>
        </div>

        <div className="chain-panel-right">
          <div className="chain-stat-badge">
            <span className="chain-stat-num">{logs.length}</span>
            <span className="chain-stat-label">Events Logged</span>
          </div>
          <span
            className={`badge ${
              data.audit_verified ? "badge-promoted" : "badge-pending"
            }`}
          >
            {data.audit_verified ? "VALID CHAIN" : "UNVERIFIED"}
          </span>
        </div>
      </section>

      {/* 2. AUDIT LOGS TABLE WITH FILTERS */}
      <section className="panel audit-full-panel">
        <div className="panel-header audit-filter-header">
          <div>
            <div className="panel-eyebrow">
              <Clock3 size={14} className="eyebrow-icon" />
              <span>EVENT TIMELINE</span>
            </div>
            <h2 className="panel-title">Audit event ledger</h2>
          </div>

          {/* Filter Pills */}
          <div className="filter-pill-group">
            <span className="filter-group-label">
              <Filter size={13} />
              Filter:
            </span>
            <button
              type="button"
              className={`filter-btn ${severityFilter === "ALL" ? "active" : ""}`}
              onClick={() => setSeverityFilter("ALL")}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={`filter-btn ${
                severityFilter === "SUCCESS" ? "active" : ""
              }`}
              onClick={() => setSeverityFilter("SUCCESS")}
            >
              Success ({counts.success})
            </button>
            <button
              type="button"
              className={`filter-btn ${
                severityFilter === "INFO" ? "active" : ""
              }`}
              onClick={() => setSeverityFilter("INFO")}
            >
              Normal ({counts.info})
            </button>
            <button
              type="button"
              className={`filter-btn ${
                severityFilter === "CRITICAL" ? "active" : ""
              }`}
              onClick={() => setSeverityFilter("CRITICAL")}
            >
              Critical ({counts.critical})
            </button>
          </div>
        </div>

        <div className="audit-timeline">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => {
              const status = log.status?.toUpperCase() || "NORMAL";
              const isSuccess = status === "SUCCESS";
              const isCritical = status === "CRITICAL";

              return (
                <div
                  key={log.event_id || `${log.timestamp}-${index}`}
                  className="timeline-item"
                >
                  <div
                    className={`timeline-marker ${
                      isSuccess
                        ? "marker-success"
                        : isCritical
                        ? "marker-critical"
                        : "marker-info"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 size={15} />
                    ) : isCritical ? (
                      <AlertTriangle size={15} />
                    ) : (
                      <Activity size={15} />
                    )}
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div className="timeline-headline">
                        <span className="event-type-badge">{log.type}</span>
                        <span
                          className={`badge ${
                            isSuccess
                              ? "badge-pass"
                              : isCritical
                              ? "badge-critical"
                              : "badge-active"
                          }`}
                        >
                          {status === "NORMAL" ? "INFO" : status}
                        </span>
                      </div>

                      <div className="timeline-meta">
                        <span className="timestamp-text font-mono">
                          {log.timestamp}
                        </span>
                        {log.hash && (
                          <span
                            className="hash-snippet font-mono"
                            title={`SHA-256 Digest: ${log.hash}`}
                          >
                            hash: {log.hash.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="timeline-message">{log.message}</p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="timeline-metadata-chips">
                        {Object.entries(log.metadata).map(([key, val]) => {
                          if (val === null || val === undefined) return null;
                          const displayVal =
                            typeof val === "object"
                              ? JSON.stringify(val)
                              : String(val);
                          return (
                            <span key={key} className="meta-chip">
                              <span className="meta-chip-key">{key}:</span>
                              <span className="meta-chip-val font-mono">
                                {displayVal}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-audit-state">
              <Clock3 size={24} className="text-slate-400" />
              <span>No audit logs matching selected filter.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AuditView;
