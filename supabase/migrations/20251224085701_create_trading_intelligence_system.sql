/*
  # Trading Intelligence System - Complete Schema

  ## Overview
  This migration creates a comprehensive trading intelligence system that tracks:
  - IPO opportunities with institutional analysis
  - Institutional footprints and money flow
  - Trading strategies with success/failure reasoning
  - News sentiment and event analysis
  - Educational content explaining WHY to trade or not
  - User learning progress

  ## New Tables

  ### 1. `ipos` - IPO Tracking
  - `id` (uuid, primary key)
  - `symbol` (text) - Stock ticker
  - `company_name` (text)
  - `ipo_date` (date)
  - `price_range_low` (decimal)
  - `price_range_high` (decimal)
  - `final_price` (decimal)
  - `shares_offered` (bigint)
  - `market_cap` (decimal)
  - `sector` (text)
  - `underwriters` (jsonb) - Array of underwriter banks
  - `institutional_demand` (text) - High/Medium/Low
  - `lockup_period_days` (int)
  - `analysis_score` (decimal) - AI-generated score 0-100
  - `recommendation` (text) - BUY/WAIT/AVOID
  - `reasoning` (text) - Educational explanation
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 2. `institutional_trades` - Smart Money Footprints
  - `id` (uuid, primary key)
  - `symbol` (text)
  - `institution_name` (text)
  - `trade_type` (text) - BUY/SELL
  - `shares` (bigint)
  - `price` (decimal)
  - `total_value` (decimal)
  - `trade_date` (date)
  - `filing_date` (date)
  - `ownership_percent` (decimal)
  - `is_new_position` (boolean)
  - `is_increased` (boolean)
  - `is_decreased` (boolean)
  - `confidence_level` (text) - HIGH/MEDIUM/LOW
  - `created_at` (timestamp)

  ### 3. `trading_strategies` - Strategy Database with Results
  - `id` (uuid, primary key)
  - `name` (text)
  - `category` (text) - EVENT_DRIVEN/MOMENTUM/MEAN_REVERSION/etc
  - `description` (text)
  - `success_rate` (decimal)
  - `avg_return` (decimal)
  - `sharpe_ratio` (decimal)
  - `max_drawdown` (decimal)
  - `win_count` (int)
  - `loss_count` (int)
  - `is_recommended` (boolean)
  - `reasoning` (text) - Why this works or doesn't work
  - `retail_trap_warning` (text) - Warnings about common mistakes
  - `institutional_use` (boolean)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 4. `news_events` - Tracked News with Sentiment
  - `id` (uuid, primary key)
  - `symbol` (text)
  - `headline` (text)
  - `source` (text)
  - `event_type` (text) - EARNINGS/M&A/FDA/REGULATORY/etc
  - `sentiment_score` (decimal) - -1 to 1
  - `impact_prediction` (text) - BULLISH/BEARISH/NEUTRAL
  - `confidence` (decimal) - 0-100
  - `institutional_response` (text) - How institutions are reacting
  - `retail_response` (text) - How retail is reacting
  - `opportunity_type` (text) - FOLLOW/FADE/AVOID
  - `reasoning` (text) - Educational explanation
  - `published_at` (timestamp)
  - `created_at` (timestamp)

  ### 5. `trade_signals` - Generated Trading Signals
  - `id` (uuid, primary key)
  - `symbol` (text)
  - `signal_type` (text) - BUY/SELL/HOLD
  - `strategy_id` (uuid) - FK to trading_strategies
  - `entry_price` (decimal)
  - `target_price` (decimal)
  - `stop_loss` (decimal)
  - `confidence` (decimal) - 0-100
  - `time_horizon` (text) - INTRADAY/SWING/POSITION
  - `risk_reward_ratio` (decimal)
  - `reasoning` (text) - Why this signal was generated
  - `institutional_alignment` (boolean) - Are institutions doing the same?
  - `news_event_id` (uuid) - FK to news_events
  - `is_active` (boolean)
  - `outcome` (text) - WIN/LOSS/PENDING
  - `actual_return` (decimal)
  - `created_at` (timestamp)
  - `closed_at` (timestamp)

  ### 6. `market_footprints` - Order Flow & Volume Analysis
  - `id` (uuid, primary key)
  - `symbol` (text)
  - `timestamp` (timestamp)
  - `price_level` (decimal)
  - `bid_volume` (bigint)
  - `ask_volume` (bigint)
  - `delta` (bigint) - Bid - Ask volume
  - `cumulative_delta` (bigint)
  - `large_orders` (int) - Count of institutional-sized orders
  - `order_flow_direction` (text) - BULLISH/BEARISH/NEUTRAL
  - `absorption_detected` (boolean) - Smart money absorbing supply
  - `spoofing_detected` (boolean) - False orders
  - `analysis` (text) - What this footprint means

  ### 7. `educational_content` - Teaching System
  - `id` (uuid, primary key)
  - `topic` (text)
  - `category` (text) - WHY_TRADE/WHY_NOT_TRADE/FOOTPRINTS/STRATEGY
  - `title` (text)
  - `content` (text)
  - `difficulty_level` (text) - BEGINNER/INTERMEDIATE/ADVANCED
  - `related_strategy_id` (uuid) - FK to trading_strategies
  - `real_example_signal_id` (uuid) - FK to trade_signals
  - `key_takeaways` (jsonb) - Array of key points
  - `common_mistakes` (jsonb) - Array of mistakes to avoid
  - `created_at` (timestamp)

  ### 8. `user_learning_progress` - Track User Understanding
  - `id` (uuid, primary key)
  - `user_id` (uuid)
  - `content_id` (uuid) - FK to educational_content
  - `completed` (boolean)
  - `quiz_score` (decimal)
  - `trades_attempted` (int)
  - `successful_trades` (int)
  - `learned_concepts` (jsonb) - Array of mastered concepts
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 9. `strategy_warnings` - Retail Trap Alerts
  - `id` (uuid, primary key)
  - `strategy_name` (text)
  - `warning_type` (text) - RETAIL_TRAP/HIGH_COST/LOW_EDGE/OUTDATED
  - `severity` (text) - CRITICAL/HIGH/MEDIUM/LOW
  - `description` (text)
  - `why_institutions_win` (text) - How institutions exploit this
  - `alternative_approach` (text) - Better strategy to use
  - `money_lost_estimate` (decimal) - Avg loss for retail traders
  - `created_at` (timestamp)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users

  ## Indexes
  - Performance indexes on commonly queried fields
*/

-- IPOs Table
CREATE TABLE IF NOT EXISTS ipos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  company_name text NOT NULL,
  ipo_date date,
  price_range_low decimal(10,2),
  price_range_high decimal(10,2),
  final_price decimal(10,2),
  shares_offered bigint,
  market_cap decimal(15,2),
  sector text,
  underwriters jsonb DEFAULT '[]'::jsonb,
  institutional_demand text CHECK (institutional_demand IN ('High', 'Medium', 'Low')),
  lockup_period_days int,
  analysis_score decimal(5,2) CHECK (analysis_score >= 0 AND analysis_score <= 100),
  recommendation text CHECK (recommendation IN ('BUY', 'WAIT', 'AVOID')),
  reasoning text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Institutional Trades Table
CREATE TABLE IF NOT EXISTS institutional_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  institution_name text NOT NULL,
  trade_type text NOT NULL CHECK (trade_type IN ('BUY', 'SELL')),
  shares bigint NOT NULL,
  price decimal(10,2),
  total_value decimal(15,2),
  trade_date date NOT NULL,
  filing_date date,
  ownership_percent decimal(5,2),
  is_new_position boolean DEFAULT false,
  is_increased boolean DEFAULT false,
  is_decreased boolean DEFAULT false,
  confidence_level text CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
  created_at timestamptz DEFAULT now()
);

-- Trading Strategies Table
CREATE TABLE IF NOT EXISTS trading_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  success_rate decimal(5,2),
  avg_return decimal(8,2),
  sharpe_ratio decimal(5,2),
  max_drawdown decimal(5,2),
  win_count int DEFAULT 0,
  loss_count int DEFAULT 0,
  is_recommended boolean DEFAULT false,
  reasoning text,
  retail_trap_warning text,
  institutional_use boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News Events Table
CREATE TABLE IF NOT EXISTS news_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text,
  headline text NOT NULL,
  source text,
  event_type text,
  sentiment_score decimal(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  impact_prediction text CHECK (impact_prediction IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  confidence decimal(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  institutional_response text,
  retail_response text,
  opportunity_type text CHECK (opportunity_type IN ('FOLLOW', 'FADE', 'AVOID')),
  reasoning text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Trade Signals Table
CREATE TABLE IF NOT EXISTS trade_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  strategy_id uuid REFERENCES trading_strategies(id),
  entry_price decimal(10,2),
  target_price decimal(10,2),
  stop_loss decimal(10,2),
  confidence decimal(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  time_horizon text CHECK (time_horizon IN ('INTRADAY', 'SWING', 'POSITION')),
  risk_reward_ratio decimal(5,2),
  reasoning text,
  institutional_alignment boolean DEFAULT false,
  news_event_id uuid REFERENCES news_events(id),
  is_active boolean DEFAULT true,
  outcome text CHECK (outcome IN ('WIN', 'LOSS', 'PENDING')),
  actual_return decimal(8,2),
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Market Footprints Table
CREATE TABLE IF NOT EXISTS market_footprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  timestamp timestamptz NOT NULL,
  price_level decimal(10,2) NOT NULL,
  bid_volume bigint DEFAULT 0,
  ask_volume bigint DEFAULT 0,
  delta bigint,
  cumulative_delta bigint,
  large_orders int DEFAULT 0,
  order_flow_direction text CHECK (order_flow_direction IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  absorption_detected boolean DEFAULT false,
  spoofing_detected boolean DEFAULT false,
  analysis text
);

-- Educational Content Table
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  related_strategy_id uuid REFERENCES trading_strategies(id),
  real_example_signal_id uuid REFERENCES trade_signals(id),
  key_takeaways jsonb DEFAULT '[]'::jsonb,
  common_mistakes jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- User Learning Progress Table
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid REFERENCES educational_content(id),
  completed boolean DEFAULT false,
  quiz_score decimal(5,2),
  trades_attempted int DEFAULT 0,
  successful_trades int DEFAULT 0,
  learned_concepts jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Strategy Warnings Table
CREATE TABLE IF NOT EXISTS strategy_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name text NOT NULL,
  warning_type text NOT NULL,
  severity text CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  description text NOT NULL,
  why_institutions_win text,
  alternative_approach text,
  money_lost_estimate decimal(15,2),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_footprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_warnings ENABLE ROW LEVEL SECURITY;

-- Policies for public read access (authenticated users can read all data)
CREATE POLICY "Allow public read access to ipos"
  ON ipos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to institutional_trades"
  ON institutional_trades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to trading_strategies"
  ON trading_strategies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to news_events"
  ON news_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to trade_signals"
  ON trade_signals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to market_footprints"
  ON market_footprints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to educational_content"
  ON educational_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to strategy_warnings"
  ON strategy_warnings FOR SELECT
  TO authenticated
  USING (true);

-- User learning progress - users can only access their own data
CREATE POLICY "Users can view own learning progress"
  ON user_learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress"
  ON user_learning_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning progress"
  ON user_learning_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ipos_symbol ON ipos(symbol);
CREATE INDEX IF NOT EXISTS idx_ipos_date ON ipos(ipo_date);
CREATE INDEX IF NOT EXISTS idx_institutional_trades_symbol ON institutional_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_institutional_trades_date ON institutional_trades(trade_date);
CREATE INDEX IF NOT EXISTS idx_news_events_symbol ON news_events(symbol);
CREATE INDEX IF NOT EXISTS idx_news_events_published ON news_events(published_at);
CREATE INDEX IF NOT EXISTS idx_trade_signals_symbol ON trade_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_signals_active ON trade_signals(is_active);
CREATE INDEX IF NOT EXISTS idx_market_footprints_symbol_timestamp ON market_footprints(symbol, timestamp);
