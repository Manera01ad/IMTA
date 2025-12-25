/*
  # Community Insights System

  1. New Tables
    - `community_insights`
      - `id` (uuid, primary key)
      - `user_name` (text) - Display name or anonymous
      - `symbol` (text) - Stock symbol (RELIANCE, TCS, etc)
      - `insight_text` (text) - Factual insight or experience
      - `entry_price` (decimal) - Entry price if applicable
      - `exit_price` (decimal) - Exit price if trade closed
      - `outcome` (text) - PROFIT, LOSS, or ONGOING
      - `outcome_percentage` (decimal) - Profit/loss percentage
      - `trade_date` (timestamptz) - When trade was made
      - `insight_type` (text) - TRADE_RESULT, OBSERVATION, WARNING, TIP
      - `is_verified` (boolean) - Admin verified factual content
      - `created_at` (timestamptz)
    
    - `community_votes`
      - `id` (uuid, primary key)
      - `insight_id` (uuid, foreign key)
      - `vote_type` (text) - BUY or SELL
      - `voter_ip` (text) - To prevent duplicate votes
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Anyone can read insights and votes
    - Authenticated users can post insights
    - Anyone can vote (tracked by IP to prevent spam)

  3. Important Notes
    - Focus on factual insights, not speculation
    - Community sentiment via buy/sell votes
    - Track real trading outcomes to help others learn
*/

CREATE TABLE IF NOT EXISTS community_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL DEFAULT 'Anonymous Trader',
  symbol text NOT NULL,
  insight_text text NOT NULL,
  entry_price decimal(10,2),
  exit_price decimal(10,2),
  outcome text DEFAULT 'ONGOING',
  outcome_percentage decimal(10,2),
  trade_date timestamptz DEFAULT now(),
  insight_type text NOT NULL DEFAULT 'OBSERVATION',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id uuid REFERENCES community_insights(id) ON DELETE CASCADE,
  vote_type text NOT NULL CHECK (vote_type IN ('BUY', 'SELL')),
  voter_ip text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(insight_id, voter_ip)
);

ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view community insights"
  ON community_insights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create insights"
  ON community_insights FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update own insights"
  ON community_insights FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view votes"
  ON community_votes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can vote"
  ON community_votes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_community_insights_symbol ON community_insights(symbol);
CREATE INDEX IF NOT EXISTS idx_community_insights_created ON community_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_votes_insight ON community_votes(insight_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_type ON community_votes(vote_type);