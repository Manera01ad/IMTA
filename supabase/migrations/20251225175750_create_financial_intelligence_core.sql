/*
  # Financial Intelligence System - Core Tables
  
  ## Overview
  Creates core tables for the Indian Stock Market Intelligence System
  
  ## Tables Created
  1. stocks - NSE/BSE stock master data
  2. market_data - OHLCV and technical indicators  
  3. sector_performance - Sector-wise performance tracking
  4. economic_indicators - Macro economic data
  
  ## Security
  - RLS enabled on all tables
  - Public read access for market data
  - Service role can write data
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Stocks master table
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  company_name text NOT NULL,
  exchange text NOT NULL CHECK (exchange IN ('NSE', 'BSE', 'BOTH')),
  sector text NOT NULL,
  industry text,
  market_cap bigint,
  is_nifty_50 boolean DEFAULT false,
  is_nifty_500 boolean DEFAULT false,
  is_active boolean DEFAULT true,
  listing_date date,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stocks"
  ON stocks FOR SELECT
  TO authenticated
  USING (true);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('1m', '5m', '15m', '1h', '1d', '1w')),
  open numeric(12,2) NOT NULL,
  high numeric(12,2) NOT NULL,
  low numeric(12,2) NOT NULL,
  close numeric(12,2) NOT NULL,
  volume bigint NOT NULL,
  avg_volume_20d bigint,
  volume_ratio numeric(6,2),
  cpr_pivot numeric(12,2),
  cpr_bc numeric(12,2),
  cpr_tc numeric(12,2),
  vwap numeric(12,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(stock_id, timestamp, timeframe)
);

CREATE INDEX IF NOT EXISTS idx_market_data_stock_time ON market_data(stock_id, timestamp DESC);

ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market data"
  ON market_data FOR SELECT
  TO authenticated
  USING (true);

-- Sector performance table
CREATE TABLE IF NOT EXISTS sector_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector text NOT NULL,
  timestamp timestamptz NOT NULL,
  performance_1d numeric(6,2),
  performance_1w numeric(6,2),
  performance_1m numeric(6,2),
  market_bias text CHECK (market_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  strength_score numeric(3,0) CHECK (strength_score BETWEEN 0 AND 100),
  total_volume bigint,
  advancing_stocks integer,
  declining_stocks integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(sector, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_sector_performance_timestamp ON sector_performance(timestamp DESC);

ALTER TABLE sector_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sector performance"
  ON sector_performance FOR SELECT
  TO authenticated
  USING (true);

-- Economic indicators table
CREATE TABLE IF NOT EXISTS economic_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type text NOT NULL CHECK (indicator_type IN ('GDP', 'INFLATION', 'REPO_RATE', 'FII_FLOW', 'DII_FLOW', 'RBI_POLICY', 'OTHER')),
  timestamp timestamptz NOT NULL,
  value numeric(12,2),
  unit text,
  description text,
  sentiment text CHECK (sentiment IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')),
  impact_score numeric(3,0) CHECK (impact_score BETWEEN 0 AND 100),
  source text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_economic_indicators_type ON economic_indicators(indicator_type);

ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view economic indicators"
  ON economic_indicators FOR SELECT
  TO authenticated
  USING (true);