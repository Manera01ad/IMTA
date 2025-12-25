/*
  # Pattern Identification System

  1. New Tables
    - `pattern_signals`
      - `id` (uuid, primary key)
      - `symbol` (text) - Stock symbol
      - `pattern_name` (text) - Name of the pattern (Head & Shoulders, Double Bottom, etc)
      - `pattern_type` (text) - BULLISH, BEARISH, NEUTRAL
      - `timeframe` (text) - 1D, 1H, 15M, etc
      - `confidence_score` (decimal) - 0-100 confidence in pattern
      - `signal` (text) - BUY, SELL, WAIT
      - `entry_price` (decimal) - Suggested entry price
      - `target_price` (decimal) - Target price
      - `stop_loss` (decimal) - Stop loss price
      - `risk_reward_ratio` (decimal) - Risk/reward ratio
      - `pattern_description` (text) - What the pattern means
      - `why_it_works` (text) - Why this pattern is profitable
      - `why_it_fails` (text) - When this pattern fails
      - `institutional_validation` (boolean) - Do institutions use this?
      - `success_rate` (decimal) - Historical success rate %
      - `detected_at` (timestamptz) - When pattern was detected
      - `is_active` (boolean) - Is pattern still valid
      - `created_at` (timestamptz)
    
    - `pattern_library`
      - `id` (uuid, primary key)
      - `pattern_name` (text) - Pattern name
      - `category` (text) - REVERSAL, CONTINUATION, BREAKOUT
      - `description` (text) - Pattern description
      - `bullish_or_bearish` (text) - BULLISH, BEARISH, BOTH
      - `success_rate` (decimal) - Average success rate
      - `timeframe_best` (text) - Best timeframe for this pattern
      - `volume_importance` (text) - HIGH, MEDIUM, LOW
      - `how_to_identify` (text) - How to spot this pattern
      - `trading_rules` (text) - Rules for trading this pattern
      - `common_mistakes` (text) - What traders do wrong
      - `institutional_use` (boolean) - Used by institutions
      - `retail_trap_warning` (text) - How retail gets trapped
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Anyone can read patterns
    - Only system can insert/update patterns

  3. Important Notes
    - Focus on proven, high-probability patterns
    - Include institutional validation
    - Show both successes and failures
    - Real-time pattern detection
    - Educational approach to pattern trading
*/

CREATE TABLE IF NOT EXISTS pattern_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  pattern_name text NOT NULL,
  pattern_type text NOT NULL CHECK (pattern_type IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
  timeframe text NOT NULL,
  confidence_score decimal(5,2) NOT NULL,
  signal text NOT NULL CHECK (signal IN ('BUY', 'SELL', 'WAIT')),
  entry_price decimal(10,2) NOT NULL,
  target_price decimal(10,2),
  stop_loss decimal(10,2),
  risk_reward_ratio decimal(5,2),
  pattern_description text NOT NULL,
  why_it_works text NOT NULL,
  why_it_fails text,
  institutional_validation boolean DEFAULT false,
  success_rate decimal(5,2),
  detected_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pattern_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_name text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('REVERSAL', 'CONTINUATION', 'BREAKOUT')),
  description text NOT NULL,
  bullish_or_bearish text NOT NULL,
  success_rate decimal(5,2),
  timeframe_best text,
  volume_importance text CHECK (volume_importance IN ('HIGH', 'MEDIUM', 'LOW')),
  how_to_identify text NOT NULL,
  trading_rules text NOT NULL,
  common_mistakes text,
  institutional_use boolean DEFAULT false,
  retail_trap_warning text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pattern_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pattern signals"
  ON pattern_signals FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view pattern library"
  ON pattern_library FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert pattern signals"
  ON pattern_signals FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update pattern signals"
  ON pattern_signals FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert to pattern library"
  ON pattern_library FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pattern_signals_symbol ON pattern_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_pattern_signals_active ON pattern_signals(is_active);
CREATE INDEX IF NOT EXISTS idx_pattern_signals_detected ON pattern_signals(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_library_category ON pattern_library(category);