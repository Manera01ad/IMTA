/*
  # Live Prices System

  1. New Tables
    - `live_prices`
      - `id` (uuid, primary key)
      - `symbol` (text, unique) - Stock symbol
      - `ltp` (decimal) - Last Traded Price
      - `open_price` (decimal) - Opening price
      - `high` (decimal) - Day high
      - `low` (decimal) - Day low
      - `prev_close` (decimal) - Previous close
      - `volume` (bigint) - Trading volume
      - `change` (decimal) - Price change from previous close
      - `change_percent` (decimal) - Percentage change
      - `last_update` (timestamptz) - Last price update time
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Anyone can read prices
    - Anyone can insert/update prices (for simulation)

  3. Important Notes
    - Stores real-time/simulated price data
    - Updated frequently to show live movement
    - Used by all components needing live prices
*/

CREATE TABLE IF NOT EXISTS live_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  ltp decimal(10,2) NOT NULL,
  open_price decimal(10,2) NOT NULL,
  high decimal(10,2) NOT NULL,
  low decimal(10,2) NOT NULL,
  prev_close decimal(10,2) NOT NULL,
  volume bigint DEFAULT 0,
  change decimal(10,2) NOT NULL,
  change_percent decimal(5,2) NOT NULL,
  last_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live prices"
  ON live_prices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert live prices"
  ON live_prices FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update live prices"
  ON live_prices FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_live_prices_symbol ON live_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_live_prices_update ON live_prices(last_update DESC);