export type Exchange = 'NSE' | 'BSE' | 'BOTH';

export type MarketBias = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export type TrapType = 'BULL_TRAP' | 'BEAR_TRAP' | 'INSTITUTIONAL_TRAP' | 'VOLUME_TRAP';

export type SignalType = 'BUY' | 'SELL' | 'BREAKOUT' | 'BREAKDOWN' | 'REVERSAL';

export type DecisionType = 'BUY' | 'SELL' | 'HOLD' | 'ALERT' | 'WARNING';

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'EXPIRED';

export type AgentType = 'MACRO_ANALYST' | 'CASH_MARKET_SPECIALIST' | 'STRATEGY_LOGIC' | 'PATTERN_RECOGNITION';

export type MemoryType = 'PATTERN' | 'CYCLE' | 'CONTEXT' | 'LEARNING';

export type RiskAppetite = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';

export type FilingType = 'QUARTERLY_RESULTS' | 'ANNUAL_REPORT' | 'CORPORATE_ACTION' | 'INSIDER_TRADING' | 'OTHER';

export type NoteType = 'ANALYSIS' | 'OBSERVATION' | 'STRATEGY' | 'LESSON';

export type IndicatorType = 'GDP' | 'INFLATION' | 'REPO_RATE' | 'FII_FLOW' | 'DII_FLOW' | 'RBI_POLICY' | 'OTHER';

export interface Stock {
  id: string;
  symbol: string;
  company_name: string;
  exchange: Exchange;
  sector: string;
  industry?: string;
  market_cap?: number;
  is_nifty_50: boolean;
  is_nifty_500: boolean;
  is_active: boolean;
  listing_date?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MarketData {
  id: string;
  stock_id: string;
  timestamp: string;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  avg_volume_20d?: number;
  volume_ratio?: number;
  cpr_pivot?: number;
  cpr_bc?: number;
  cpr_tc?: number;
  vwap?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SectorPerformance {
  id: string;
  sector: string;
  timestamp: string;
  performance_1d?: number;
  performance_1w?: number;
  performance_1m?: number;
  market_bias?: MarketBias;
  strength_score?: number;
  total_volume?: number;
  advancing_stocks?: number;
  declining_stocks?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface EconomicIndicator {
  id: string;
  indicator_type: IndicatorType;
  timestamp: string;
  value?: number;
  unit?: string;
  description?: string;
  sentiment?: Sentiment;
  impact_score?: number;
  source?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  agent_type: AgentType;
  memory_type: MemoryType;
  key: string;
  value: Record<string, any>;
  confidence_score?: number;
  usage_count: number;
  last_accessed: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentDecision {
  id: string;
  user_id?: string;
  agent_type: AgentType;
  stock_symbol: string;
  decision_type: DecisionType;
  reasoning: string;
  confidence_score?: number;
  suggested_price?: number;
  suggested_quantity?: number;
  stop_loss?: number;
  target_price?: number;
  risk_reward_ratio?: number;
  status: DecisionStatus;
  approved_by?: string;
  approved_at?: string;
  executed_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TrapDetection {
  id: string;
  stock_symbol: string;
  trap_type: TrapType;
  detection_timestamp: string;
  price_at_detection: number;
  volume_at_detection: number;
  volume_ratio?: number;
  confidence_score?: number;
  description?: string;
  is_active: boolean;
  resolved_at?: string;
  outcome?: 'CONFIRMED' | 'FALSE_POSITIVE' | 'PENDING';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TradeSignal {
  id: string;
  stock_symbol: string;
  signal_type: SignalType;
  timestamp: string;
  price: number;
  volume?: number;
  probability_score?: number;
  timeframe: string;
  entry_price?: number;
  stop_loss?: number;
  target_1?: number;
  target_2?: number;
  risk_reward_ratio?: number;
  pattern_detected?: string;
  is_high_conviction: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserPortfolio {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  avg_buy_price: number;
  current_price?: number;
  invested_amount: number;
  current_value?: number;
  pnl?: number;
  pnl_percentage?: number;
  stop_loss?: number;
  target_price?: number;
  bought_at: string;
  updated_at: string;
}

export interface RiskSettings {
  id: string;
  user_id: string;
  total_capital: number;
  max_position_size_percentage: number;
  max_risk_per_trade_percentage: number;
  max_daily_loss_percentage: number;
  volume_multiplier: number;
  auto_stop_loss: boolean;
  risk_appetite: RiskAppetite;
  created_at: string;
  updated_at: string;
}

export interface SEBIFiling {
  id: string;
  stock_symbol: string;
  filing_type: FilingType;
  filing_date: string;
  title: string;
  summary?: string;
  document_url?: string;
  key_highlights?: string[];
  sentiment?: Sentiment;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ResearchNote {
  id: string;
  user_id: string;
  stock_symbol?: string;
  title: string;
  content: string;
  note_type?: NoteType;
  tags?: string[];
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PositionSizeCalculation {
  capital: number;
  riskPercentage: number;
  entryPrice: number;
  stopLoss: number;
  recommendedQuantity: number;
  capitalAtRisk: number;
  positionValue: number;
}

export interface TradeProposal {
  decision: AgentDecision;
  stock: Stock;
  currentPrice: number;
  positionSize: PositionSizeCalculation;
  technicals: {
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
    support: number;
    resistance: number;
    volumeConfirmation: boolean;
  };
}
