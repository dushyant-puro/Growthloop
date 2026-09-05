import { Sparkles } from "lucide-react";
import { Button } from "./Button";

export function AIStrategyGenerator({
  merchantContext,
  setMerchantContext,
  onGenerate,
  isGenerating = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <section className="panel ai-generator-panel">
      <div className="ai-panel-header">
        <div className="ai-header-left">
          <div className="panel-eyebrow ai-eyebrow">
            <Sparkles size={14} className="eyebrow-icon" />
            <span>AI STRATEGY GENERATOR</span>
          </div>
          <h2 className="panel-title">Merchant context</h2>
          <p className="panel-description">
            Describe the checkout problem. GrowthLoop will generate candidate
            strategies for the experiment.
          </p>
        </div>

        <div className="gemini-badge" title="Powered by Google Gemini">
          <span className="gemini-dot" />
          <span>Gemini</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ai-input-form">
        <div className="input-group">
          <input
            type="text"
            className="text-input ai-input"
            value={merchantContext}
            onChange={(e) => setMerchantContext(e.target.value)}
            placeholder="e.g. D2C footwear merchant: 68% cart abandonment on orders above ₹1,000..."
            maxLength={2000}
            disabled={isGenerating}
          />
        </div>

        <Button
          type="submit"
          variant="ai"
          size="md"
          icon={Sparkles}
          loading={isGenerating}
          disabled={isGenerating || !merchantContext.trim()}
          className="btn-generate"
        >
          {isGenerating ? "Generating..." : "Generate hypotheses"}
        </Button>
      </form>
    </section>
  );
}

export default AIStrategyGenerator;
