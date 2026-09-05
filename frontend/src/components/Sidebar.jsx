import {
  Activity,
  BarChart3,
  ShieldCheck,
  Clock3,
  X,
} from "lucide-react";

export function Sidebar({
  activeView,
  setActiveView,
  isConnected,
  mobileOpen,
  setMobileOpen,
}) {
  const navItems = [
    {
      id: "experiment",
      label: "Experiment",
      icon: Activity,
    },
    {
      id: "performance",
      label: "Performance",
      icon: BarChart3,
    },
    {
      id: "guardrails",
      label: "Guardrails",
      icon: ShieldCheck,
    },
    {
      id: "audit",
      label: "Audit trail",
      icon: Clock3,
    },
  ];

  const handleNavClick = (id) => {
    setActiveView(id);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* TOP BRAND */}
        <div className="sidebar-top">
          <div className="brand-header">
            <div className="brand-badge" aria-hidden="true">
              G
            </div>
            <div className="brand-text">
              <div className="brand-title">GrowthLoop</div>
              <div className="brand-subtitle">Autonomous Revenue</div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              className="mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* WORKSPACE SECTION */}
          <div className="nav-section">
            <div className="nav-section-title">WORKSPACE</div>
            <nav className="nav-list" aria-label="Main Navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-link ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={17} className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM STATUS */}
        <div className="sidebar-bottom">
          <div className="system-status-box">
            <div className="system-status-header">
              <span
                className={`status-pulse-dot ${
                  isConnected ? "dot-online" : "dot-offline"
                }`}
              />
              <span className="system-status-title">System status</span>
            </div>
            <div className="system-status-text">
              {isConnected
                ? "All systems operational"
                : "Backend disconnected"}
            </div>
          </div>

          <div className="environment-box">
            <span className="environment-label">Environment</span>
            <span className="environment-pill">TEST MODE</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
