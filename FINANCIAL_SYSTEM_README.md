# Financial Intelligence System for Indian Stock Markets (NSE/BSE)

## 🎯 Mission: Study, Learn, and Earn

An institutional-grade AI-powered financial intelligence platform designed specifically for the Indian Stock and Cash Markets. This system acts as your "Human Brain" to navigate the complex Indian economy and avoid institutional traps.

---

## 🏗 System Architecture

### Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Framer Motion
- **UI Framework:** Material Design 3 principles, dark-mode focused
- **Backend:** Supabase (PostgreSQL + Edge Functions + Real-time subscriptions)
- **State Management:** React Hooks + Supabase real-time
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** Vercel/Lovable ready

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components | Material Design 3 | Responsive UI        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  AI Agent Orchestrator | Risk Calculator | Pattern Detector  │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│  Supabase PostgreSQL | RLS Security | Real-time Updates      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                          │
│  N8N Workflows | NSE/BSE APIs | RBI Data | News Feeds        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agent Modules

### 1. Macro Analyst Agent
**Purpose:** Analyze macroeconomic indicators and their market impact

**Data Sources:**
- RBI Repo Rate changes
- GDP growth data
- Inflation metrics (CPI, WPI)
- FII/DII flow sentiment
- RBI policy announcements

**Outputs:**
- Market bias assessment (Bullish/Bearish/Neutral)
- Sentiment scores (0-100)
- Impact analysis on sectors
- Strategic recommendations

### 2. Cash Market Specialist Agent
**Purpose:** Scan NSE/BSE stocks for institutional traps and opportunities

**Detection Logic:**
- **Volume Profile Analysis:** Identifies price moves on abnormally low volume
- **Institutional Trap Detection:** Flags spikes without institutional participation
- **Volume Ratio Threshold:** 1.5x average volume required for validation
- **Pattern Recognition:** Bull traps, bear traps, volume traps

**Criteria:**
```
If (PriceChange > 3% AND VolumeRatio < 1.5x):
  Flag as INSTITUTIONAL_TRAP
  Confidence = 75-90%
```

### 3. Strategy Logic Agent
**Purpose:** Implement advanced technical analysis strategies

**Strategies:**
- **CPR (Central Pivot Range):** Identify narrow vs wide CPR days
- **VWAP Analysis:** Volume Weighted Average Price zones
- **Support/Resistance:** Dynamic level calculation
- **Trend Analysis:** Uptrend, downtrend, sideways detection

### 4. Pattern Recognition Agent
**Purpose:** Identify chart patterns and generate probability-based signals

**Patterns Detected:**
- Breakouts (with volume confirmation)
- Reversals (bullish/bearish)
- Continuations
- Consolidations

**Signal Output:**
- Entry price
- Stop-loss level
- Target 1 and Target 2
- Risk:Reward ratio
- Probability score (0-100%)

---

## 📊 Core Features

### 1. Financial Intelligence Dashboard
**Location:** `/dashboard`

**Components:**
- **Market Bias Meter:** Real-time market sentiment (Bullish/Bearish/Neutral)
- **Sector Heatmap:** Performance tracking for Nifty Bank, IT, Auto, etc.
- **AI Trade Proposals:** Pending decisions requiring human approval
- **Institutional Trap Alerts:** Active warnings with confidence scores

**Key Metrics:**
- Strength Score (0-100)
- Sector performance (1D, 1W, 1M)
- Advancing vs Declining stocks
- Volume confirmation indicators

### 2. Risk Management System
**Location:** `/risk-management`

**Features:**
- **Position Size Calculator:** Automated quantity calculation based on risk
- **Capital Protection:** Max position size, risk per trade, daily loss limits
- **Risk Parameters:**
  - Total capital tracking
  - Max position size: 10% default (configurable)
  - Max risk per trade: 2% default
  - Max daily loss: 5% default
  - Volume multiplier: 1.5x minimum
  - Auto stop-loss: Enabled

**Position Sizing Formula:**
```
Capital at Risk = Total Capital × Risk Percentage
Risk Per Share = |Entry Price - Stop Loss|
Quantity = Capital at Risk ÷ Risk Per Share
Position Value = Quantity × Entry Price
```

**Validation:**
- Validates trades against user risk settings
- Flags violations before execution
- Calculates risk:reward ratios
- Ensures compliance with risk appetite

### 3. Study Lab (RAG-Powered)
**Location:** `/ai-assistant/chat` (existing AI Research Hub)

**Capabilities:**
- RAG (Retrieval Augmented Generation) for SEBI filings
- Quarterly earnings analysis
- Corporate action summaries
- Historical pattern learning
- Conversational AI with market context

### 4. Live Feed Module
**Location:** `/live-feed`

**Real-time Updates:**
- Price alerts with breakout notifications
- Volume spike alerts
- Trap detection warnings
- Pattern confirmations
- WebSocket-style live cards

**Display:**
- Symbol, LTP, Change%, Volume
- High conviction signals highlighted
- Color-coded by signal type (Buy/Sell/Alert)

### 5. Human-in-the-Loop Decision System

**Workflow:**
```
AI Agent Analyzes → Generates Proposal → Human Reviews → Approve/Reject → Execute
```

**Decision Card Components:**
- Stock symbol and current price
- AI agent type and reasoning
- Confidence score (0-100%)
- Entry price, stop-loss, target
- Risk:reward ratio
- Approve/Reject buttons

**Benefits:**
- No blind automation
- User maintains control
- Learns from AI reasoning
- Risk oversight

---

## 🗄 Database Schema

### Core Tables

1. **stocks** - NSE/BSE stock master (12 columns)
2. **market_data** - OHLCV + technical indicators (15 columns)
3. **sector_performance** - Sector heatmap data (12 columns)
4. **economic_indicators** - Macro data (10 columns)
5. **agent_memory** - AI pattern learning (10 columns)
6. **agent_decisions** - Trade proposals (16 columns)
7. **trap_detections** - Institutional trap alerts (12 columns)
8. **trade_signals** - Breakout alerts (15 columns)
9. **user_portfolios** - Holdings tracking (14 columns)
10. **risk_settings** - User risk parameters (10 columns)
11. **sebi_filings** - Regulatory filings (10 columns)
12. **research_notes** - User notes with tagging (11 columns)

**Total:** 12 tables with comprehensive RLS (Row Level Security)

### Security Model

- **Public Read:** Market data, sector performance, economic indicators
- **User-Specific:** Portfolios, risk settings, research notes, decisions
- **Service Role:** Agent operations, trap detection, signal generation
- **Authentication Required:** All operations require Supabase auth

---

## 🔐 Safety & Risk Guardrails

### 1. Institutional Filter
**Rule:** Reject trades if volume < 1.5x average volume

**Rationale:** Low volume moves are often institutional traps designed to lure retail traders.

**Implementation:**
```typescript
if (volumeRatio < volumeMultiplier) {
  flagAs('POTENTIAL_TRAP');
  blockTrade();
}
```

### 2. Automated Stop-Loss
**Feature:** Auto-calculates stop-loss based on risk tolerance

**Calculation:**
```
Stop Loss = Entry Price - (Capital at Risk / Quantity)
```

**Protection:** Limits maximum loss per trade to user-defined percentage (default 2%)

### 3. Position Sizing
**Enforcement:** Maximum position size capped at percentage of capital

**Default Limits:**
- 10% max position size
- 2% max risk per trade
- 5% max daily loss

**Validation:** All trades validated before execution

### 4. Risk:Reward Minimum
**Threshold:** Minimum 1:1.5 risk:reward ratio recommended

**Calculation:**
```
Risk:Reward = (Target - Entry) / (Entry - Stop Loss)
```

**Indicator:** Color-coded (green ≥ 2.0, yellow 1.5-2.0, red < 1.5)

---

## 🔌 N8N Integration

### Purpose
N8N acts as the data pipeline, fetching real-time market data, economic indicators, and news, then feeding the Supabase backend.

### Key Workflows

1. **Market Data Ingestion** (Every 5 min during market hours)
   - Fetch NSE/BSE real-time quotes
   - Calculate technical indicators (CPR, VWAP, volume ratios)
   - Insert into `market_data` table

2. **Trap Detection** (Every 15 min)
   - Query recent market data
   - Run trap detection algorithms
   - Insert alerts into `trap_detections`

3. **Economic Data Updates** (Daily at 6 PM IST)
   - Fetch RBI data, FII/DII flows
   - Store in `economic_indicators`
   - Trigger macro analysis

4. **Pattern Recognition** (Hourly)
   - Analyze OHLCV for top stocks
   - Detect breakouts, reversals
   - Generate signals in `trade_signals`

### Setup Guide
Refer to `N8N_INTEGRATION_GUIDE.md` for:
- Workflow templates
- API endpoints
- Authentication setup
- Sample code
- Testing procedures

---

## 📈 User Journey

### For Beginners
1. **Start:** View Dashboard to understand market bias
2. **Learn:** Read educational content on why strategies work/fail
3. **Observe:** Monitor AI trade proposals and their reasoning
4. **Practice:** Paper trade by following high-conviction signals
5. **Risk Setup:** Configure capital and risk parameters
6. **Execute:** Approve AI proposals that match your analysis

### For Intermediate Traders
1. **Dashboard:** Quick market overview and sector strength
2. **Pattern Identifier:** Scan for high-probability setups
3. **Trap Alerts:** Avoid institutional manipulation
4. **Risk Calculator:** Size positions correctly
5. **Study Lab:** Deep-dive into specific stocks/sectors
6. **Execute:** Combine AI insights with personal analysis

### For Advanced Traders
1. **Multi-Agent Analysis:** Review all agent outputs
2. **Risk Management:** Fine-tune position sizing and limits
3. **Custom Alerts:** Set specific criteria for signals
4. **Backtesting:** Analyze historical agent performance
5. **Integration:** Connect via n8n for automated workflows
6. **Portfolio Tracking:** Monitor real-time P&L

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account (free tier sufficient)
- N8N instance (optional, for automation)

### Installation

```bash
# Clone repository
git clone [your-repo-url]
cd project

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Create Supabase project
2. Run migrations from `supabase/migrations/` folder
3. Migrations automatically create tables and RLS policies
4. No manual SQL required

---

## 📚 Documentation

- **N8N Integration Guide:** `N8N_INTEGRATION_GUIDE.md`
- **System Architecture:** `SYSTEM_ARCHITECTURE.md`
- **Architecture Overview:** `ARCHITECTURE.md`
- **DevMap:** `/dev-map` route for visual system map

---

## 🎨 Design Principles

### Material Design 3
- High-density data tables for information efficiency
- Dark-mode focused for reduced eye strain
- Neon accents (cyan, green, red) for Buy/Sell indicators
- Glassmorphism effects for modern aesthetic

### Color Coding
- **Green/Emerald:** Bullish, Buy signals, Profit
- **Red/Rose:** Bearish, Sell signals, Loss
- **Cyan/Blue:** Neutral, Information, System messages
- **Yellow/Amber:** Warnings, Medium risk
- **Purple/Violet:** AI agents, Special features

### Typography
- Font: System default (optimized for readability)
- Headers: Bold, large (2xl-4xl)
- Body: Regular, 14-16px
- Data: Monospace for numbers

---

## ⚠️ Important Notes

### Data Sources
- **NSE/BSE Data:** Requires API access or web scraping
- **RBI Data:** Publicly available
- **FII/DII Flows:** From NSE official data
- **News:** Integrate with news APIs

### Compliance
- **SEBI Regulations:** Ensure compliance with Indian securities law
- **Disclaimer:** This is an educational/research tool, not investment advice
- **User Responsibility:** Users must make their own trading decisions

### Performance
- Real-time updates may have 5-15 second delays
- N8N workflows should respect API rate limits
- Database queries optimized with indexes
- Supabase free tier: 500MB database, 2GB bandwidth

---

## 🛠 Future Enhancements

### Phase 2
- [ ] Mobile app (React Native/Expo)
- [ ] Advanced backtesting engine
- [ ] Options chain analysis
- [ ] Futures sentiment tracking

### Phase 3
- [ ] Social trading features
- [ ] Portfolio analytics dashboard
- [ ] Automated trade execution (with broker API)
- [ ] Custom indicator builder

### Phase 4
- [ ] Machine learning model training
- [ ] Sentiment analysis from social media
- [ ] Earnings call transcripts analysis
- [ ] Predictive analytics

---

## 📊 System Metrics

### Database
- **Tables:** 12
- **Indexes:** 35+
- **RLS Policies:** 48+
- **Total Columns:** 150+

### Frontend
- **Pages:** 10+
- **Components:** 15+
- **Modules:** 6
- **Type Definitions:** 25+

### AI Agents
- **Agent Types:** 4
- **Decision Types:** 5
- **Trap Types:** 4
- **Signal Types:** 5

---

## 🤝 Contributing

This is a production-ready foundation. To extend:

1. Add new agent types in `agentOrchestrator.ts`
2. Create new detection algorithms
3. Build additional UI modules
4. Integrate more data sources via n8n
5. Enhance risk management rules

---

## 📝 License

[Your License Here]

---

## 🆘 Support

For questions, issues, or feature requests:
- GitHub Issues: [Your Repo]
- Email: [Your Email]
- Documentation: `/dev-map` in the app

---

**Built with ❤️ for Indian retail traders to level the playing field against institutions.**

**Version:** 1.0.0
**Last Updated:** December 25, 2025
**Status:** Production Ready ✅
