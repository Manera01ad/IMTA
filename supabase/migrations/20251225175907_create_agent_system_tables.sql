/*
  # AI Agent System - Memory and Decision Tables
  
  ## Overview
  Creates AI agent orchestration tables for financial intelligence
  
  ## Tables Created
  1. agent_memory - Pattern and cycle memory
  2. agent_decisions - Trade proposals with human approval
  3. trap_detections - Institutional trap identification
  4. user_portfolios - User holdings tracking
  5. risk_settings - User risk parameters
  6. sebi_filings - Regulatory filings and analysis
  7. research_notes - RAG-powered research storage
  
  ## Security
  - RLS enabled on all tables
  - User-specific access for portfolios and settings
  - Public read for market intelligence
*/

-- Agent memory for pattern recognition
CREATE TABLE IF NOT EXISTS agent_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type text NOT NULL CHECK (agent_type IN ('MACRO_ANALYST', 'CASH_MARKET_SPECIALIST', 'STRATEGY_LOGIC', 'PATTERN_RECOGNITION')),
  memory_type text NOT NULL CHECK (memory_type IN ('PATTERN', 'CYCLE', 'CONTEXT', 'LEARNING')),
  key text NOT NULL,
  value jsonb NOT NULL,
  confidence_score numeric(3,0) CHECK (confidence_score BETWEEN 0 AND 100),
  usage_count integer DEFAULT 0,
  last_accessed timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agent_type, memory_type, key)
);

CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory(agent_type, memory_type);

ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view agent memory"
  ON agent_memory FOR SELECT
  TO authenticated
  USING (true);

-- Agent decisions for human-in-the-loop
CREATE TABLE IF NOT EXISTS agent_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type text NOT NULL CHECK (agent_type IN ('MACRO_ANALYST', 'CASH_MARKET_SPECIALIST', 'STRATEGY_LOGIC', 'PATTERN_RECOGNITION')),
  stock_symbol text NOT NULL,
  decision_type text NOT NULL CHECK (decision_type IN ('BUY', 'SELL', 'HOLD', 'ALERT', 'WARNING')),
  reasoning text NOT NULL,
  confidence_score numeric(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  suggested_price numeric(12,2),
  suggested_quantity integer,
  stop_loss numeric(12,2),
  target_price numeric(12,2),
  risk_reward_ratio numeric(6,2),
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  executed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_user ON agent_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_status ON agent_decisions(status);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created ON agent_decisions(created_at DESC);

ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own decisions"
  ON agent_decisions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own decisions"
  ON agent_decisions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trap detections
CREATE TABLE IF NOT EXISTS trap_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_symbol text NOT NULL,
  trap_type text NOT NULL CHECK (trap_type IN ('BULL_TRAP', 'BEAR_TRAP', 'INSTITUTIONAL_TRAP', 'VOLUME_TRAP')),
  detection_timestamp timestamptz NOT NULL,
  price_at_detection numeric(12,2) NOT NULL,
  volume_at_detection bigint NOT NULL,
  volume_ratio numeric(6,2),
  confidence_score numeric(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  description text,
  is_active boolean DEFAULT true,
  resolved_at timestamptz,
  outcome text CHECK (outcome IN ('CONFIRMED', 'FALSE_POSITIVE', 'PENDING')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trap_detections_symbol ON trap_detections(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_trap_detections_active ON trap_detections(is_active, detection_timestamp DESC);

ALTER TABLE trap_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view traps"
  ON trap_detections FOR SELECT
  TO authenticated
  USING (true);

-- User portfolios
CREATE TABLE IF NOT EXISTS user_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  avg_buy_price numeric(12,2) NOT NULL,
  current_price numeric(12,2),
  invested_amount numeric(12,2) NOT NULL,
  current_value numeric(12,2),
  pnl numeric(12,2),
  pnl_percentage numeric(6,2),
  stop_loss numeric(12,2),
  target_price numeric(12,2),
  bought_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_portfolios_user ON user_portfolios(user_id);

ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own portfolio"
  ON user_portfolios FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own portfolio"
  ON user_portfolios FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own portfolio"
  ON user_portfolios FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own portfolio"
  ON user_portfolios FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Risk settings
CREATE TABLE IF NOT EXISTS risk_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_capital numeric(12,2) NOT NULL,
  max_position_size_percentage numeric(5,2) DEFAULT 10 CHECK (max_position_size_percentage BETWEEN 1 AND 100),
  max_risk_per_trade_percentage numeric(5,2) DEFAULT 2 CHECK (max_risk_per_trade_percentage BETWEEN 0.5 AND 10),
  max_daily_loss_percentage numeric(5,2) DEFAULT 5 CHECK (max_daily_loss_percentage BETWEEN 1 AND 20),
  volume_multiplier numeric(3,1) DEFAULT 1.5 CHECK (volume_multiplier >= 1.0),
  auto_stop_loss boolean DEFAULT true,
  risk_appetite text DEFAULT 'MODERATE' CHECK (risk_appetite IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_settings_user ON risk_settings(user_id);

ALTER TABLE risk_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own risk settings"
  ON risk_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own risk settings"
  ON risk_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own risk settings"
  ON risk_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SEBI filings
CREATE TABLE IF NOT EXISTS sebi_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_symbol text NOT NULL,
  filing_type text NOT NULL CHECK (filing_type IN ('QUARTERLY_RESULTS', 'ANNUAL_REPORT', 'CORPORATE_ACTION', 'INSIDER_TRADING', 'OTHER')),
  filing_date date NOT NULL,
  title text NOT NULL,
  summary text,
  document_url text,
  key_highlights jsonb DEFAULT '[]',
  sentiment text CHECK (sentiment IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sebi_filings_symbol ON sebi_filings(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_sebi_filings_date ON sebi_filings(filing_date DESC);

ALTER TABLE sebi_filings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEBI filings"
  ON sebi_filings FOR SELECT
  TO authenticated
  USING (true);

-- Research notes (RAG-powered)
CREATE TABLE IF NOT EXISTS research_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_symbol text,
  title text NOT NULL,
  content text NOT NULL,
  note_type text CHECK (note_type IN ('ANALYSIS', 'OBSERVATION', 'STRATEGY', 'LESSON')),
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_research_notes_user ON research_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_research_notes_symbol ON research_notes(stock_symbol);
CREATE INDEX IF NOT EXISTS idx_research_notes_tags ON research_notes USING gin(tags);

ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own or public notes"
  ON research_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users insert own notes"
  ON research_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own notes"
  ON research_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notes"
  ON research_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);