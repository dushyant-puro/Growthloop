<div align="center">

# ⚡ GrowthLoop
### Autonomous Commercial Revenue & Checkout Optimization Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2+-646C99.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340.svg?style=flat&logo=razorpay&logoColor=white)](https://razorpay.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4.svg?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*An intelligent, self-optimizing e-commerce engine combining Bayesian Thompson Sampling, Gemini-powered strategy formulation, deterministic financial guardrails, tamper-evident cryptographic audit trails, and live Razorpay payment processing.*

---

</div>

## 📌 Overview: What GrowthLoop Represents

Traditional e-commerce checkout optimization faces three fatal hurdles:
1. **Inefficient A/B Testing**: Standard static A/B tests split traffic equally 50/50 for weeks, needlessly routing thousands of paying customers to inferior checkout flows and sacrificing significant revenue during the experiment.
2. **Unconstrained AI Hallucination**: Pure LLM solutions cannot be entrusted with commercial decisions; a hallucinated 90% discount or negative checkout price destroys merchant unit economics and profit margins.
3. **Opaque Commercial Decision-Making**: Regulators, finance teams, and merchants require immutable, auditable proof for why prices, discounts, and commercial strategies were offered to customers.

**GrowthLoop solves this through an autonomous closed-loop revenue engine:**
- **Formulates** novel checkout strategies via **Google Gemini 2.5 Flash**.
- **Enforces** zero-hallucination **Deterministic Financial Guardrails** (hard discount ceilings and minimum price floors).
- **Routes Traffic Dynamically** using a **Bayesian Multi-Armed Bandit (Thompson Sampling)** to maximize revenue in real time while learning customer behavior.
- **Deploys Winning Strategies** to live checkout via **Razorpay Test Mode API** once $\ge 95\%$ statistical dominance is proven.
- **Guarantees Integrity** with an append-only **Cryptographic SHA-256 Hash-Chained Audit Ledger**.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph AI["🧠 Generative Strategist"]
        A[Merchant Problem / Context] --> B[Gemini 2.5 Flash]
        B --> C[Structured Commercial Hypotheses]
    end

    subgraph Guardrails["🛡️ Deterministic Financial Guardrails"]
        C --> D{Policy Validation}
        D -- "Discount > 20% or Price < ₹120" --> E[❌ Intercepted & Logged to Audit]
        D -- "Compliant Financial Rules" --> F[✅ Approved Bandit Arms]
    end

    subgraph Bandit["🎯 Bayesian Optimization Engine"]
        F --> G[Thompson Sampling Multi-Armed Bandit]
        H[Simulated / Live Checkouts] --> G
        G --> I[Posterior Updates: Beta(α, β)]
        I --> J[Monte Carlo Dominance Simulation]
    end

    subgraph Execution["💳 Promotion & Payment Gateway"]
        J -- "Dominance ≥ 95% & Trials ≥ 30" --> K[Deploy Winner]
        K --> L[Razorpay Orders API]
        L --> M[Interactive Razorpay Checkout Modal]
    end

    subgraph AuditLedger["🔗 Cryptographic Ledger"]
        E -.-> N[(Tamper-Evident SHA-256 Hash Chain)]
        F -.-> N
        I -.-> N
        K -.-> N
        L -.-> N
    end
```

---

## ✨ Core Pillars & Features

### 1. 🧠 Autonomous AI Commercial Strategist
- Driven by **Google Gemini 2.5 Flash** with strict JSON schema response guarantees.
- Analyzes merchant drop-off dilemmas (e.g., high COD failure rate, cart drop-offs, payment friction) and hypothesizes diverse commercial mechanisms:
  - *Instant Prepaid Incentives*
  - *Cart Size Booster Discounts*
  - *Urgency / Scarcity Checkout Triggers*
  - *Free-Shipping & Bundle Thresholds*
- Includes graceful deterministic fallbacks if no Gemini API key is configured.

### 2. 🛡️ Zero-Hallucination Deterministic Guardrails
- **The LLM is strictly treated as an untrusted commercial strategist, never the safety authority.**
- Hardcoded financial rules enforced before any strategy touches customer traffic:
  - 🚫 **Maximum Discount Ceiling**: Strict cap at `20.0%`.
  - 🚫 **Minimum Price Floor**: Checkout price cannot drop below `₹120.00`.
  - 🚫 **Sanity Checks**: Non-negative discounts and base price $> ₹0.00$.
- Includes a built-in **Poison Strategy Simulator** (35% aggressive clearance slash) demonstrating real-time policy interception.

### 3. 🎯 Bayesian Multi-Armed Bandit (Thompson Sampling)
- Replaces static A/B testing with continuous Bayesian exploration-exploitation.
- Each arm maintains independent conjugate priors:
  $$\theta \sim \text{Beta}(\alpha, \beta)$$
- On conversion: $\alpha \leftarrow \alpha + 1$; on drop-off: $\beta \leftarrow \beta + 1$.
- Runs **4,000 Monte Carlo simulations** per state request to calculate the exact statistical probability that an arm is globally optimal.
- Minimizes cumulative regret by allocating progressively more traffic to higher-converting checkout variations.

### 4. 🏆 Statistical Dominance & Promotion Engine
- Prevents premature convergence or false positives through rigorous criteria:
  - Minimum of **30 customer trials** on the leading strategy.
  - At least **95% probability of being best** ($\ge 95\%$ statistical dominance).
- Automatically re-evaluates financial guardrails before promoting.
- Upon promotion, pauses competing arms and directs 100% of checkout traffic to the proven champion.

### 5. 💳 Live Razorpay Payment Gateway Integration
- Seamlessly communicates with the **Razorpay Orders API** in Test Mode.
- Generates official `order_id` references with receipts and tamper-proof metadata.
- Frontend includes complete **Razorpay Standard Checkout modal** integration (`checkout.js`) with pre-filled test payment options.

### 6. 🔗 Tamper-Evident Cryptographic Audit Ledger
- Every state transition, LLM output, guardrail rejection, traffic step, and payment creation is appended to `growthloop_audit.jsonl`.
- Each record embeds the **SHA-256 cryptographic hash of the preceding block**:
  $$\text{Hash}_{N} = \text{SHA256}(\text{Block}_N + \text{Hash}_{N-1})$$
- Exposes an automated verification engine (`audit.verify_chain()`) that detects any offline tampering, altered discounts, or deleted entries.

### 7. 💻 Modern React 19 Operator Dashboard
- Built with **React 19**, **Vite**, **Tailwind CSS**, **Lucide Icons**, and **Recharts**.
- Five intuitive views:
  1. **Experiment Command Center**: Real-time traffic simulation batches, Bayesian conversion gauges, and promotion triggers.
  2. **AI Strategy Workshop**: Custom merchant context prompt builder with instant guardrail validation feedback.
  3. **Financial Guardrails Matrix**: Real-time policy simulator, parameter controls, and poison payload tester.
  4. **Revenue & Bayesian Analytics**: Conversion distribution comparison, Monte Carlo dominance chart, and revenue uplift metrics.
  5. **Cryptographic Audit Ledger**: Verifiable event stream, hash inspector, and cryptographic chain health badge.

---

## 📁 Repository Structure

```text
GrowthLoop/
├── README.md                     # Comprehensive project documentation
├── .gitignore                    # Git configuration (protects .env & audit logs)
├── backend/
│   ├── main.py                   # FastAPI REST API, state management & orchestration
│   ├── agent.py                  # Gemini 2.5 Flash LLM strategist & structured schema
│   ├── bandit.py                 # Bayesian Bernoulli Bandit (Beta-Binomial & Thompson Sampling)
│   ├── guardrails.py             # Deterministic financial policy & validation rules
│   ├── razorpay_client.py        # Razorpay Test Mode client wrapper & order creator
│   ├── audit.py                  # Cryptographic SHA-256 tamper-evident audit logger
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── index.html                # Entry HTML with Razorpay checkout.js script
    ├── package.json              # React 19, Tailwind CSS, Recharts, Lucide dependencies
    ├── vite.config.js            # Vite development & build configuration
    ├── tailwind.config.js        # Custom Tailwind design tokens & styling
    └── src/
        ├── App.jsx               # Main state container, API synchronization & tab router
        ├── App.css / index.css   # Global styling and design utilities
        └── components/
            ├── Sidebar.jsx              # Navigation and system status indicators
            ├── PageHeader.jsx           # Dynamic header with action triggers
            ├── MetricCard.jsx           # Reusable metric card with trend visualizations
            ├── StatusBanner.jsx         # Promotion, guardrail, and alert banners
            ├── AIStrategyGenerator.jsx   # Gemini strategy formulation modal
            ├── Toast.jsx                # Toast notification alerts
            ├── Button.jsx               # Polished, accessible interactive button states
            └── views/
                ├── ExperimentView.jsx   # Thompson Sampling traffic runner & arm status
                ├── GuardrailsView.jsx   # Policy engine & poison test simulator
                ├── PerformanceView.jsx  # Recharts graphs & Bayesian analytics
                └── AuditView.jsx        # SHA-256 blockchain-style event verification
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and **npm**
- *(Optional)* **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com))
- *(Optional)* **Razorpay Test API Keys** ([Razorpay Dashboard](https://dashboard.razorpay.com))

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables by creating a `.env` file in `backend/`:
   ```env
   # Google Gemini Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash

   # Razorpay Test Mode Credentials
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret_here

   # Audit Log File Location
   GROWTHLOOP_AUDIT_FILE=growthloop_audit.jsonl
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/state` | Fetches active arms, Bayesian posterior stats, dominance probabilities, recent audit entries, and verification status. |
| `POST` | `/api/agent/hypothesize` | Invokes Gemini to formulate candidate strategies, routes them through financial guardrails, and installs approved arms. |
| `POST` | `/api/simulate-batch` | Runs a batch of customer checkouts (`10`, `25`, `50`, or `100`) routed through Thompson Sampling. |
| `POST` | `/api/test-guardrail-violation` | Submits a 35% discount poison payload to demonstrate deterministic policy blocking. |
| `POST` | `/api/deploy-winner` | Validates statistical dominance ($\ge 95\%$ with $\ge 30$ trials), re-checks guardrails, and creates a live Razorpay order. |
| `POST` | `/api/reset` | Resets bandit priors back to $\text{Beta}(1,1)$ while preserving cryptographic audit history. |

---

## 🔬 Interactive Demo Walkthrough

1. **Simulate Traffic**: On the **Experiment Command Center**, click **Run 25 Checkouts**. Observe how Thompson Sampling balances exploration with exploitation, gradually allocating more traffic to higher-converting arms.
2. **Test Financial Guardrails**: Switch to the **Financial Guardrails** tab and click **Simulate Poison Strategy (35% Discount)**. Notice how the deterministic guardrail intercepts the payload immediately with `CRITICAL` severity, shielding margins.
3. **Generate AI Strategies**: Click **AI Strategy Generator** in the top navigation. Enter a custom merchant scenario (e.g. *"Our average order value is ₹999 with high COD return-to-origin rates"*). Watch Gemini synthesize distinct commercial hypotheses that are automatically vetted by the guardrails.
4. **Achieve Dominance & Deploy**: Continue routing batches until the leader reaches $\ge 95\%$ probability of being best. Click **Deploy Winning Strategy** to create an authentic Razorpay order and trigger the Razorpay checkout modal.
5. **Verify Audit Chain**: Go to the **Audit Trail** tab to view the immutable ledger. Verify that every event contains valid SHA-256 block hashes with zero detected tampering.

---

## 🧮 Mathematical Foundations

### Thompson Sampling Conjugate Prior Update
For each arm $k$, customer conversion follows a Bernoulli likelihood:
$$X_i \sim \text{Bernoulli}(\theta_k)$$
With conjugate prior:
$$\theta_k \sim \text{Beta}(\alpha_k, \beta_k)$$
Upon observing conversion outcome $x \in \{0, 1\}$:
$$\alpha_k \leftarrow \alpha_k + x, \quad \beta_k \leftarrow \beta_k + (1 - x)$$

### Monte Carlo Winner Probability
To compute whether candidate arm $k$ is statistically superior to all competing arms $j \neq k$:
$$P(\text{Arm}_k \text{ is optimal}) = \frac{1}{M} \sum_{m=1}^{M} \mathbb{I}\left(\theta_k^{(m)} > \max_{j \neq k} \theta_j^{(m)}\right)$$
where $M = 4,000$ draws from the respective posterior Beta distributions.

---

## 🛡️ License

This project is open-source under the [MIT License](LICENSE).