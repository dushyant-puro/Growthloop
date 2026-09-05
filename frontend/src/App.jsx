import { useEffect, useMemo, useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { PageHeader } from "./components/PageHeader";
import { Toast } from "./components/Toast";
import { ExperimentView } from "./components/views/ExperimentView";
import { PerformanceView } from "./components/views/PerformanceView";
import { GuardrailsView } from "./components/views/GuardrailsView";
import { AuditView } from "./components/views/AuditView";

const API = "http://localhost:8000";

const ensureRazorpayLoaded = async () => {
  if (typeof window !== "undefined" && window.Razorpay) {
    return true;
  }
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(!!window.Razorpay));
      existing.addEventListener("error", () => resolve(false));
      setTimeout(() => resolve(!!window.Razorpay), 1500);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
    setTimeout(() => resolve(!!window.Razorpay), 2500);
  });
};

export function App() {
  // Navigation State
  const [activeView, setActiveView] = useState("experiment");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Backend Data State
  const [data, setData] = useState({
    item_price: 999,
    arms: [],
    audit_trail: [],
    experiment: null,
    audit_verified: false,
    razorpay_key_id: null,
  });

  // Action / Form States
  const [merchantContext, setMerchantContext] = useState(
    "D2C footwear merchant: 68% cart abandonment on orders above ₹1,000 during late evening traffic."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isTestingGuardrail, setIsTestingGuardrail] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastViolationResult, setLastViolationResult] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // ----------------------------------------------------------
  // API: Fetch State
  // ----------------------------------------------------------
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/state`);
      if (!response.ok) {
        throw new Error("Backend unavailable");
      }
      const json = await response.json();
      setData({
        item_price: json.item_price ?? 999,
        arms: json.arms ?? [],
        audit_trail: json.audit_trail ?? [],
        experiment: json.experiment ?? null,
        audit_verified: json.audit_verified ?? false,
        razorpay_key_id: json.razorpay_key_id ?? null,
      });
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to fetch backend state:", error);
      setIsConnected(false);
    }
  }, []);

  // Initial Fetch & 2.5s Polling
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const response = await fetch(`${API}/api/state`);
        if (!response.ok) throw new Error("Backend unavailable");
        const json = await response.json();
        if (!cancelled) {
          setData({
            item_price: json.item_price ?? 999,
            arms: json.arms ?? [],
            audit_trail: json.audit_trail ?? [],
            experiment: json.experiment ?? null,
            audit_verified: json.audit_verified ?? false,
            razorpay_key_id: json.razorpay_key_id ?? null,
          });
          setIsConnected(true);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch backend state:", error);
          setIsConnected(false);
        }
      }
    }

    loadData();
    const interval = setInterval(loadData, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ----------------------------------------------------------
  // API: Generate AI Hypotheses
  // ----------------------------------------------------------
  const handleGenerateHypotheses = async () => {
    if (!merchantContext.trim()) {
      showToast("Please enter merchant context first.", "warning");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API}/api/agent/hypothesize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: merchantContext }),
      });

      if (!response.ok) {
        throw new Error("Hypothesis generation failed");
      }

      await fetchState();
      setActiveView("experiment");
      showToast("AI hypotheses generated and evaluated against guardrails.");
    } catch (error) {
      console.error(error);
      showToast("Unable to generate hypotheses.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // ----------------------------------------------------------
  // API: Simulate Batch (Route 25 checkouts)
  // ----------------------------------------------------------
  const runBatch = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${API}/api/simulate-batch`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Simulation failed");
      }

      const result = await response.json();
      await fetchState();

      if (result.error) {
        showToast(result.error, "warning");
      } else {
        showToast("25 simulated checkouts routed through Thompson Sampling.");
      }
    } catch (error) {
      console.error(error);
      showToast("Checkout simulation failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ----------------------------------------------------------
  // API: Test Guardrail Violation
  // ----------------------------------------------------------
  const triggerViolation = async () => {
    setIsTestingGuardrail(true);
    try {
      const response = await fetch(`${API}/api/test-guardrail-violation`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Guardrail test failed");
      }

      const result = await response.json();
      setLastViolationResult(result);
      await fetchState();

      if (result.accepted) {
        showToast("Guardrail test unexpectedly passed.", "error");
      } else {
        showToast(
          "Guardrail intercept verified: unsafe 35% discount deterministically blocked.",
          "warning"
        );
      }
    } catch (error) {
      console.error(error);
      showToast("Guardrail test failed.", "error");
    } finally {
      setIsTestingGuardrail(false);
    }
  };

  // ----------------------------------------------------------
  // API: Deploy Winner & Open Razorpay Checkout
  // ----------------------------------------------------------
  const deployTopArm = async () => {
    console.log("[GrowthLoop] Promote clicked");
    setIsDeploying(true);
    try {
      const isLoaded = await ensureRazorpayLoaded();
      console.log("[GrowthLoop] Razorpay script loaded:", isLoaded, "window.Razorpay available:", !!window.Razorpay);

      const response = await fetch(`${API}/api/deploy-winner`, {
        method: "POST",
      });

      const result = await response.json();
      console.log("[GrowthLoop] Promotion response:", result);
      console.log("[GrowthLoop] Razorpay available:", !!window.Razorpay);
      console.log("[GrowthLoop] Razorpay order:", result.razorpay_order);

      await fetchState();

      if (result.success && result.razorpay_order) {
        const order = result.razorpay_order;
        const keyId =
          result.razorpay_key_id ||
          data.razorpay_key_id ||
          import.meta.env.VITE_RAZORPAY_KEY_ID ||
          "rzp_test_TYNF1gJH3U5Hmc";

        console.log("[GrowthLoop] Opening Razorpay Checkout with order ID:", order.id, "and key:", keyId);

        if (typeof window === "undefined" || !window.Razorpay) {
          console.error("[GrowthLoop] window.Razorpay is not defined");
          showToast(
            `Strategy promoted! Razorpay order ${order.id} created, but Checkout script failed to load.`,
            "warning"
          );
          return;
        }

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "GrowthLoop",
          description: `GrowthLoop Checkout Experiment - ${result.winner?.label || "Promoted Strategy"}`,
          order_id: order.id,
          handler: function (paymentResponse) {
            console.log("[GrowthLoop] Payment successful:", paymentResponse);
            showToast(
              `Test payment successful! Razorpay Payment ID: ${paymentResponse.razorpay_payment_id}`,
              "success"
            );
            fetchState();
          },
          prefill: {
            name: "GrowthLoop Merchant",
            email: "checkout@growthloop.test",
            contact: "9999999999",
          },
          notes: {
            experiment: "growthloop",
            strategy: result.winner?.label,
            arm_id: result.winner?.arm_id,
            order_id: order.id,
          },
          theme: {
            color: "#059669",
          },
          modal: {
            ondismiss: function () {
              console.log("[GrowthLoop] Checkout modal dismissed by user.");
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (resp) {
          console.error("[GrowthLoop] Payment failed:", resp.error);
          showToast(
            `Payment failed: ${resp.error?.description || "Payment was rejected."}`,
            "error"
          );
        });

        console.log("[GrowthLoop] Calling razorpay.open()");
        razorpay.open();

        showToast(
          `Strategy promoted! Opening Razorpay Test Checkout for order ${order.id}...`
        );
      } else {
        showToast(
          typeof result.error === "string"
            ? result.error
            : Array.isArray(result.error)
            ? result.error.join(" ")
            : "Promotion blocked by guardrails.",
          "warning"
        );
      }
    } catch (error) {
      console.error("[GrowthLoop] Deployment request failed:", error);
      showToast("Deployment request failed.", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  // ----------------------------------------------------------
  // API: Reset Experiment
  // ----------------------------------------------------------
  const resetAll = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`${API}/api/reset`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      await fetchState();
      setActiveView("experiment");
      showToast("Experiment reset to initial Beta(1,1) priors. Audit chain preserved.");
    } catch (error) {
      console.error(error);
      showToast("Unable to reset experiment.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  // ----------------------------------------------------------
  // Derived Calculations
  // ----------------------------------------------------------
  const activeArms = useMemo(() => {
    return data.arms?.filter((arm) => arm.status !== "PAUSED") || [];
  }, [data.arms]);

  const winner = useMemo(() => {
    if (!data.arms?.length) return null;
    // Prefer leader designated by backend experiment summary
    if (data.experiment?.leader_arm_id) {
      const armMatch = data.arms.find(
        (a) => a.arm_id === data.experiment.leader_arm_id
      );
      if (armMatch) return armMatch;
    }
    // Fallback: arm with highest win_rate
    return [...data.arms].sort(
      (a, b) => (b.win_rate || 0) - (a.win_rate || 0)
    )[0];
  }, [data.arms, data.experiment]);

  const totalTrials = useMemo(() => {
    return data.arms?.reduce((sum, arm) => sum + (arm.trials || 0), 0) || 0;
  }, [data.arms]);

  const totalConversions = useMemo(() => {
    return data.arms?.reduce((sum, arm) => sum + (arm.conversions || 0), 0) || 0;
  }, [data.arms]);

  const overallConversion =
    totalTrials > 0
      ? ((totalConversions / totalTrials) * 100).toFixed(2)
      : "0.00";

  const promoted = useMemo(() => {
    return data.arms?.some((arm) => arm.status === "PROMOTED") || false;
  }, [data.arms]);

  const chartData = useMemo(() => {
    return (
      data.arms?.map((arm) => ({
        name: arm.label,
        probability: arm.win_rate || 0,
        status: arm.status,
      })) || []
    );
  }, [data.arms]);

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isConnected={isConnected}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN APPLICATION CONTENT */}
      <main className="main-content">
        <div className="content-container">
          {/* TOP PAGE HEADER */}
          <PageHeader
            activeView={activeView}
            onRefresh={fetchState}
            onReset={resetAll}
            isResetting={isResetting}
            isConnected={isConnected}
            onToggleMobileMenu={() => setMobileOpen(true)}
          />

          {/* DYNAMIC VIEW ROUTER */}
          {activeView === "experiment" && (
            <ExperimentView
              data={data}
              winner={winner}
              activeArms={activeArms}
              totalTrials={totalTrials}
              totalConversions={totalConversions}
              overallConversion={overallConversion}
              promoted={promoted}
              chartData={chartData}
              merchantContext={merchantContext}
              setMerchantContext={setMerchantContext}
              onGenerateHypotheses={handleGenerateHypotheses}
              isGenerating={isGenerating}
              onRouteBatch={runBatch}
              isProcessing={isProcessing}
              onDeployWinner={deployTopArm}
              isDeploying={isDeploying}
              onTriggerViolation={triggerViolation}
              isTestingGuardrail={isTestingGuardrail}
              onNavigateView={setActiveView}
            />
          )}

          {activeView === "performance" && (
            <PerformanceView
              data={data}
              winner={winner}
              activeArms={activeArms}
              totalTrials={totalTrials}
              totalConversions={totalConversions}
              overallConversion={overallConversion}
              chartData={chartData}
            />
          )}

          {activeView === "guardrails" && (
            <GuardrailsView
              data={data}
              winner={winner}
              onTriggerViolation={triggerViolation}
              isTestingGuardrail={isTestingGuardrail}
              lastViolationResult={lastViolationResult}
            />
          )}

          {activeView === "audit" && <AuditView data={data} />}

          {/* SAAS FOOTER */}
          <footer className="app-footer">
            <div className="footer-left">
              <span>GrowthLoop Autonomous Revenue Engine</span>
              <span className="footer-sep">·</span>
              <span>Thompson Sampling · Gemini · Razorpay Test Mode</span>
            </div>
            <div className="footer-right">
              <span>Deterministic Guardrails Active</span>
            </div>
          </footer>
        </div>
      </main>

      {/* TOAST NOTIFICATION */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;