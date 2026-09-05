import { useState } from "react";
import {
  ChevronRight,
  RotateCcw,
  RefreshCw,
  Menu,
} from "lucide-react";
import { Button } from "./Button";

export function PageHeader({
  activeView,
  onRefresh,
  onReset,
  isResetting = false,
  isConnected = true,
  onToggleMobileMenu,
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const viewTitles = {
    experiment: "Autonomous Checkout Optimization",
    performance: "Experiment Performance",
    guardrails: "Guardrails",
    audit: "Audit Trail",
  };

  const viewDescriptions = {
    experiment:
      "AI-generated strategies continuously tested and evaluated before promotion.",
    performance:
      "Thompson Sampling posterior probability and empirical conversion analysis.",
    guardrails:
      "Deterministic financial controls run before promotion to test gateway.",
    audit:
      "Complete immutable record of strategy decisions, safety events, and payment actions.",
  };

  const handleRefreshClick = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  return (
    <header className="page-header">
      <div className="header-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="mobile-menu-trigger"
          onClick={onToggleMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-titles">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <span>Checkout</span>
            <ChevronRight size={13} className="breadcrumb-separator" />
            <span className="breadcrumb-current">
              {activeView === "experiment"
                ? "Experiment"
                : activeView === "performance"
                ? "Performance"
                : activeView === "guardrails"
                ? "Guardrails"
                : "Audit trail"}
            </span>
          </nav>

          <h1 className="page-title">{viewTitles[activeView]}</h1>
          <p className="page-description">{viewDescriptions[activeView]}</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Reset button with explicit label */}
        <Button
          variant="secondary"
          size="md"
          icon={RotateCcw}
          onClick={onReset}
          loading={isResetting}
          title="Reset experiment to default state"
          className="btn-reset"
        >
          Reset
        </Button>

        {/* Dedicated 36-40px icon Refresh button */}
        <button
          type="button"
          className={`refresh-icon-btn ${isRefreshing ? "spin" : ""}`}
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          title="Refresh state"
          aria-label="Refresh experiment state"
        >
          <RefreshCw size={17} />
        </button>

        {/* Live Status Badge */}
        <div className="live-badge">
          <span
            className={`live-badge-dot ${
              isConnected ? "online" : "offline"
            }`}
          />
          <span>{isConnected ? "Live" : "Offline"}</span>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
