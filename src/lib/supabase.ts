import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TradingStrategy = {
  id: string;
  name: string;
  category: string;
  description: string;
  success_rate: number;
  avg_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_count: number;
  loss_count: number;
  is_recommended: boolean;
  reasoning: string;
  retail_trap_warning: string;
  institutional_use: boolean;
  created_at: string;
  updated_at: string;
};

export type IPO = {
  id: string;
  symbol: string;
  company_name: string;
  ipo_date: string;
  price_range_low: number;
  price_range_high: number;
  final_price: number;
  shares_offered: number;
  market_cap: number;
  sector: string;
  underwriters: string[];
  institutional_demand: 'High' | 'Medium' | 'Low';
  lockup_period_days: number;
  analysis_score: number;
  recommendation: 'BUY' | 'WAIT' | 'AVOID';
  reasoning: string;
  created_at: string;
  updated_at: string;
};

export type InstitutionalTrade = {
  id: string;
  symbol: string;
  institution_name: string;
  trade_type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  total_value: number;
  trade_date: string;
  filing_date: string;
  ownership_percent: number;
  is_new_position: boolean;
  is_increased: boolean;
  is_decreased: boolean;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
};

export type StrategyWarning = {
  id: string;
  strategy_name: string;
  warning_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  why_institutions_win: string;
  alternative_approach: string;
  money_lost_estimate: number;
  created_at: string;
};

export type EducationalContent = {
  id: string;
  topic: string;
  category: string;
  title: string;
  content: string;
  difficulty_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  related_strategy_id: string | null;
  real_example_signal_id: string | null;
  key_takeaways: string[];
  common_mistakes: string[];
  created_at: string;
};
