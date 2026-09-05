import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  ShieldCheck, AlertTriangle, Play, CheckCircle2, RotateCcw, Sparkles, Loader2 
} from "lucide-react";

export default function App() {
  const [data, setData] = useState({ item_price: 999, arms: [], audit_trail: [] });
  const [merchantContext, setMerchantContext] = useState(
    "D2C footwear merchant: 68% cart abandonment on orders above ₹1,000 during late evening traffic."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchState = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/state");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to connect to backend", err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateHypotheses = async () => {
    setIsGenerating(true);
    try {
      await fetch("http://localhost:8000/api/agent/hypothesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: merchantContext }),
      });
      await fetchState();
    } catch (err) {
      console.error("Hypothesis generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const runBatch = async () => {
    setIsProcessing(true);
    await fetch("http://localhost:8000/api/simulate-batch", { method: "POST" });
    await fetchState();
    setIsProcessing(false);
  };

  const triggerViolation = async () => {
    await fetch("http://localhost:8000/api/test-guardrail-violation", { method: "POST" });
    await fetchState();
  };

  const deployTopArm = async () => {
    await fetch("http://localhost:8000/api/deploy-winner", { method: "POST" });
    await fetchState();
  };

  const resetAll = async () => {
    await fetch("http://localhost:8000/api/reset", { method: "POST" });
    await fetchState();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-mono p-6">
      {/* Top Telemetry Header */}
      <header className="border-b border-zinc-800 pb-4 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-sm font-semibold tracking-wider uppercase text-zinc-200">
              GROWTHLOOP // AGENTIC CHECKOUT ENGINE
            </h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Gemini Hypothesis Generation + Thompson Sampling + Razorpay Gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="p-2 border border-zinc-800 hover:bg-zinc-900 rounded text-zinc-400"
            title="Reset Experiment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={triggerViolation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900/60 text-red-300 rounded text-xs transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Inject Poison Strategy
          </button>
          <button
            onClick={runBatch}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-200 transition"
          >
            <Play className="w-3.5 h-3.5" />
            Route +25 Checkouts
          </button>
          <button
            onClick={deployTopArm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-semibold rounded text-xs transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
            Promote to Razorpay
          </button>
        </div>
      </header>

      {/* LLM Merchant Context Prompt Bar */}
      <section className="bg-zinc-950 border border-zinc-800 rounded-md p-3.5 mb-6">
        <div className="text-[11px] text-zinc-400 font-medium mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>MERCHANT CONTEXT // AUTONOMOUS HYPOTHESIS GENERATOR</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={merchantContext}
            onChange={(e) => setMerchantContext(e.target.value)}
            placeholder="Enter store scenario, target margins, or drop-off trends..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            onClick={handleGenerateHypotheses}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded text-xs font-semibold whitespace-nowrap transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing via Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Hypotheses
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Telemetry & Visuals */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution Graph & Candidate Table */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Posterior Conversion Probabilities (Thompson Sampling)
              </h2>
              <span className="text-[11px] text-zinc-500">Live Beta Sampling</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.arms}>
                  <XAxis dataKey="label" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} unit="%" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", fontSize: "11px" }}
                  />
                  <Bar dataKey="win_rate" radius={[2, 2, 0, 0]}>
                    {data.arms.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === "PROMOTED" ? "#10b981" : "#3f3f46"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-3 font-normal">Candidate Arm</th>
                  <th className="p-3 font-normal">Discount</th>
                  <th className="p-3 font-normal">Trials</th>
                  <th className="p-3 font-normal">Conversions</th>
                  <th className="p-3 font-normal">Win Rate</th>
                  <th className="p-3 font-normal">Priors (α/β)</th>
                  <th className="p-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.arms.map((arm) => (
                  <tr key={arm.arm_id} className="hover:bg-zinc-900/30 transition">
                    <td className="p-3 font-medium text-zinc-200">{arm.label}</td>
                    <td className="p-3 text-zinc-400">{arm.discount_pct}%</td>
                    <td className="p-3 text-zinc-400">{arm.trials}</td>
                    <td className="p-3 text-zinc-400">{arm.conversions}</td>
                    <td className="p-3 font-semibold text-emerald-400">{arm.win_rate}%</td>
                    <td className="p-3 text-zinc-500">{arm.alpha} / {arm.beta}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        arm.status === "PROMOTED"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {arm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Col: Audit Stream */}
        <section className="bg-zinc-950 border border-zinc-800 rounded-md p-4 flex flex-col h-[580px]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Immutable Audit Trail</h2>
            </div>
            <span className="text-[10px] text-zinc-600">Deterministic Guardrails</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {data.audit_trail.slice().reverse().map((log, index) => (
              <div 
                key={index} 
                className={`p-2.5 rounded border text-xs leading-relaxed ${
                  log.status === "CRITICAL"
                    ? "bg-red-950/20 border-red-900/50 text-red-300"
                    : log.status === "SUCCESS"
                    ? "bg-emerald-950/20 border-emerald-900/50 text-emerald-300"
                    : "bg-zinc-900/40 border-zinc-800/80 text-zinc-300"
                }`}
              >
                <div className="flex justify-between items-center text-[10px] mb-1 font-mono text-zinc-500">
                  <span>{log.timestamp}</span>
                  <span className="uppercase font-semibold tracking-wider">{log.type}</span>
                </div>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
