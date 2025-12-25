# Financial Intelligence System - Project Structure

## 📁 Clean Project Organization

### Root Directory
```
project/
├── src/                          # Source code
├── supabase/                     # Database & Edge Functions
├── public/                       # Static assets
├── dist/                         # Production build
├── FINANCIAL_SYSTEM_README.md    # Main system documentation
├── N8N_INTEGRATION_GUIDE.md      # Backend integration guide
├── SYSTEM_ARCHITECTURE.md        # Detailed architecture docs
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite build config
├── tailwind.config.js            # Tailwind CSS config
└── .env                          # Environment variables
```

---

## 📂 Source Code Structure (`/src`)

### **Pages** (`/src/pages`)
Main application views:
- `DevMap.tsx` - Visual system architecture with roadmap
- `FinancialDashboard.tsx` - Main intelligence hub (default route)
- `RiskManagement.tsx` - Position sizing and portfolio management

### **Modules** (`/src/modules`)
Feature modules:
- `LiveFeedModule.tsx` - Real-time market feed
- `PatternIdentifierModule.tsx` - Chart pattern detection
- `CommunityInsightsModule.tsx` - Community trading insights
- `StrategyIntelligenceModule.tsx` - Strategy analysis
- `IPOResearchModule.tsx` - IPO analysis and research

### **Components** (`/src/components`)
Reusable UI components:
- `Navigation.tsx` - Main navigation bar
- `AIResearchHub.tsx` - AI assistant interface
- `AIChat.tsx` - Chat component
- `LiveFeed.tsx` - Live feed display
- `PatternIdentifier.tsx` - Pattern identification UI
- `CommunityInsights.tsx` - Community insights display
- `AssistantSelector.tsx` - AI assistant picker
- `QuestionBuilder.tsx` - Question template builder

### **Library** (`/src/lib`)
Core utilities:
- `supabase.ts` - Supabase client & type definitions
- `agentOrchestrator.ts` - AI agent logic & calculations

### **Types** (`/src/types`)
TypeScript definitions:
- `financial.ts` - Financial system types (25+ interfaces)
- `system.ts` - General system types

### **Config** (`/src/config`)
Configuration files:
- `navigation.ts` - Navigation structure
- `architecture.ts` - System architecture config

### **Root Files** (`/src`)
- `App.tsx` - Main application component with routing
- `main.tsx` - Application entry point
- `index.css` - Global styles
- `vite-env.d.ts` - Vite type definitions

---

## 🗄 Database Structure (`/supabase`)

### **Migrations** (`/supabase/migrations`)
Database schema files:

**Legacy System** (Still in use for existing features):
- `20251224085701_create_trading_intelligence_system.sql`
- `20251224092404_create_community_insights_system.sql`
- `20251224094431_create_pattern_identification_system.sql`
- `20251224100455_create_live_prices_table.sql`
- `20251224112451_create_ai_chat_agent_system.sql`

**New Financial Intelligence System**:
- `20251225175750_create_financial_intelligence_core.sql`
  - stocks, market_data, sector_performance, economic_indicators
- `20251225175907_create_agent_system_tables.sql`
  - agent_memory, agent_decisions, trap_detections
  - trade_signals, user_portfolios, risk_settings
  - sebi_filings, research_notes

### **Edge Functions** (`/supabase/functions`)
Serverless functions:
- `ai-chat/` - AI chat endpoint
- `fetch-live-prices/` - Live price data fetcher

---

## 📊 Database Tables (Total: 23 Tables)

### Legacy Trading Intelligence Tables (11)
Used by existing modules:
1. `ai_assistants` - AI assistant configurations
2. `ai_models` - Model definitions
3. `chat_conversations` - Conversation history
4. `chat_messages` - Chat messages
5. `trading_strategies` - Strategy analysis
6. `ipos` - IPO data
7. `institutional_trades` - Institutional activity
8. `strategy_warnings` - Retail trap alerts
9. `educational_content` - Learning materials
10. `pattern_library` - Pattern definitions
11. `live_prices` - Real-time prices

### New Financial Intelligence Tables (12)
For financial dashboard:
1. `stocks` - NSE/BSE stock master
2. `market_data` - OHLCV + technicals
3. `sector_performance` - Sector heatmap
4. `economic_indicators` - Macro data
5. `agent_memory` - AI learning
6. `agent_decisions` - Trade proposals
7. `trap_detections` - Trap alerts
8. `trade_signals` - Breakout signals
9. `user_portfolios` - Holdings
10. `risk_settings` - Risk parameters
11. `sebi_filings` - Regulatory filings
12. `research_notes` - User research

---

## 🚀 Application Routes

```
/ (redirects to /dashboard)
├── /dashboard                 # Main financial intelligence hub
├── /risk-management          # Position sizing & portfolio
├── /ai-assistant/*           # AI research assistant
├── /live-feed                # Real-time market feed
├── /pattern-identifier       # Pattern detection
├── /community-insights       # Community insights
├── /community/*              # Community routes
├── /strategy-intelligence    # Strategy analysis
├── /ipo-research            # IPO research
├── /footprints              # Institutional trades
├── /warnings                # Retail trap warnings
├── /education               # Educational content
├── /learning/*              # Learning routes
└── /dev-map                 # System architecture map
```

---

## 📦 Key Dependencies

### Production
- `react` ^18.3.1 - UI library
- `react-router-dom` ^7.11.0 - Routing
- `@supabase/supabase-js` ^2.57.4 - Backend client
- `framer-motion` ^12.23.26 - Animations
- `lucide-react` ^0.344.0 - Icons
- `mermaid` ^11.12.2 - Diagrams

### Development
- `typescript` ^5.5.3
- `vite` ^5.4.2
- `tailwindcss` ^3.4.1
- `eslint` ^9.9.1

---

## 🎯 Feature Mapping

### Financial Dashboard (`/dashboard`)
**Uses:**
- `FinancialDashboard.tsx` (page)
- `sector_performance`, `agent_decisions`, `trap_detections` (tables)
- `financial.ts` (types)

### Risk Management (`/risk-management`)
**Uses:**
- `RiskManagement.tsx` (page)
- `agentOrchestrator.ts` (calculations)
- `user_portfolios`, `risk_settings` (tables)

### AI Assistant (`/ai-assistant/*`)
**Uses:**
- `AIResearchHub.tsx`, `AIChat.tsx` (components)
- `ai-chat` (edge function)
- `chat_conversations`, `chat_messages`, `ai_assistants` (tables)

### Live Feed (`/live-feed`)
**Uses:**
- `LiveFeedModule.tsx` (module)
- `LiveFeed.tsx` (component)
- `fetch-live-prices` (edge function)
- `live_prices` (table)

### Pattern Identifier (`/pattern-identifier`)
**Uses:**
- `PatternIdentifierModule.tsx` (module)
- `PatternIdentifier.tsx` (component)
- `pattern_library`, `pattern_signals` (tables)

---

## 🔧 Configuration Files

### Build & Dev Tools
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript base config
- `tsconfig.app.json` - App TypeScript config
- `tsconfig.node.json` - Node TypeScript config
- `eslint.config.js` - ESLint rules
- `postcss.config.js` - PostCSS config
- `tailwind.config.js` - Tailwind CSS config

### Environment
- `.env` - Supabase credentials (not in git)
- `.gitignore` - Git ignore rules

### Project Metadata
- `package.json` - Dependencies & scripts
- `package-lock.json` - Dependency lock
- `index.html` - HTML entry point

---

## 📝 Documentation Files

1. **FINANCIAL_SYSTEM_README.md** (Main)
   - Complete system overview
   - Feature documentation
   - User guide
   - Tech stack details

2. **N8N_INTEGRATION_GUIDE.md** (Backend)
   - N8N workflow setup
   - API documentation
   - Integration examples
   - JavaScript code samples

3. **SYSTEM_ARCHITECTURE.md** (Technical)
   - Detailed architecture
   - Component relationships
   - Data flow diagrams

4. **PROJECT_STRUCTURE.md** (This file)
   - File organization
   - Feature mapping
   - Quick reference

---

## 🗂 File Count Summary

```
Pages:           3
Modules:         5
Components:      8
Libraries:       2
Types:           2
Config:          2
Migrations:      7
Edge Functions:  2
Documentation:   4
Total Tables:    23
```

---

## 🧹 Clean Architecture Principles

### Separation of Concerns
- **Pages** - Route-level views
- **Modules** - Feature implementations
- **Components** - Reusable UI elements
- **Library** - Business logic & utilities
- **Types** - Type definitions
- **Config** - Configuration

### Data Flow
```
User Interaction
    ↓
Page Component
    ↓
Module/Component
    ↓
Library (agentOrchestrator)
    ↓
Supabase Client (lib/supabase)
    ↓
Database/Edge Functions
```

### Type Safety
- All components use TypeScript
- Comprehensive type definitions in `/types`
- Supabase types auto-generated
- No `any` types in production code

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev

# Production Build
npm run build

# Preview Build
npm run preview

# Type Check
npm run typecheck

# Lint
npm run lint
```

---

## 📊 System Metrics

- **Total Lines of Code:** ~15,000+
- **Components:** 18
- **Database Tables:** 23
- **Edge Functions:** 2
- **Type Definitions:** 25+ interfaces
- **Routes:** 14
- **Build Size:** ~1.1 MB (302 KB gzipped)
- **Dependencies:** 11 production, 13 dev

---

**Status:** Production Ready ✅
**Version:** 1.0.0
**Last Updated:** December 25, 2025
