import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, Shield, Target,
  Activity, DollarSign, BarChart3, Brain, CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SectorPerformance, AgentDecision, TrapDetection, MarketBias } from '../types/financial';

export default function FinancialDashboard() {
  const [sectorData, setSectorData] = useState<SectorPerformance[]>([]);
  const [pendingDecisions, setPendingDecisions] = useState<AgentDecision[]>([]);
  const [activeTraps, setActiveTraps] = useState<TrapDetection[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketBias, setMarketBias] = useState<{ bias: MarketBias; strength: number }>({
    bias: 'NEUTRAL',
    strength: 50,
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sectorsRes, decisionsRes, trapsRes] = await Promise.all([
        supabase
          .from('sector_performance')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10),
        supabase
          .from('agent_decisions')
          .select('*')
          .eq('status', 'PENDING')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('trap_detections')
          .select('*')
          .eq('is_active', true)
          .order('detection_timestamp', { ascending: false })
          .limit(5),
      ]);

      if (sectorsRes.data) setSectorData(sectorsRes.data);
      if (decisionsRes.data) setPendingDecisions(decisionsRes.data);
      if (trapsRes.data) setActiveTraps(trapsRes.data);

      if (sectorsRes.data && sectorsRes.data.length > 0) {
        const avgBias = sectorsRes.data[0];
        setMarketBias({
          bias: avgBias.market_bias || 'NEUTRAL',
          strength: avgBias.strength_score || 50,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecisionAction = async (decisionId: string, action: 'APPROVED' | 'REJECTED') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('agent_decisions')
      .update({
        status: action,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', decisionId);

    loadDashboardData();
  };

  const getBiasColor = () => {
    if (marketBias.bias === 'BULLISH') return 'from-green-500 to-emerald-600';
    if (marketBias.bias === 'BEARISH') return 'from-red-500 to-rose-600';
    return 'from-gray-400 to-gray-500';
  };

  const getBiasIcon = () => {
    if (marketBias.bias === 'BULLISH') return <TrendingUp className="w-8 h-8" />;
    if (marketBias.bias === 'BEARISH') return <TrendingDown className="w-8 h-8" />;
    return <Activity className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Financial Intelligence...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Financial Intelligence Hub
            </h1>
            <p className="text-slate-400 mt-2">Study, Learn, and Earn - Your AI-Powered Market Brain</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${getBiasColor()} p-8 rounded-2xl shadow-2xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {getBiasIcon()}
              <div>
                <div className="text-sm uppercase tracking-wider opacity-90">Market Bias</div>
                <div className="text-4xl font-bold">{marketBias.bias}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm uppercase tracking-wider opacity-90">Strength Score</div>
              <div className="text-4xl font-bold">{marketBias.strength}/100</div>
              <div className="mt-2 w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${marketBias.strength}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-2xl font-bold">Sector Heatmap</h2>
            </div>
            <div className="space-y-3">
              {sectorData.map((sector) => (
                <div key={sector.id} className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{sector.sector}</span>
                    <span
                      className={`text-lg font-bold ${
                        (sector.performance_1d || 0) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(sector.performance_1d || 0) > 0 ? '+' : ''}
                      {sector.performance_1d?.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sector.market_bias === 'BULLISH'
                          ? 'bg-green-500/20 text-green-400'
                          : sector.market_bias === 'BEARISH'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {sector.market_bias}
                    </span>
                    <span>Strength: {sector.strength_score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold">AI Trade Proposals</h2>
              <span className="ml-auto bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                {pendingDecisions.length} Pending
              </span>
            </div>
            <div className="space-y-4">
              {pendingDecisions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No pending decisions. AI agents are analyzing the market...
                </div>
              ) : (
                pendingDecisions.map((decision) => (
                  <div key={decision.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{decision.stock_symbol}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              decision.decision_type === 'BUY'
                                ? 'bg-green-500/20 text-green-400'
                                : decision.decision_type === 'SELL'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {decision.decision_type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{decision.agent_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Confidence</div>
                        <div className="text-xl font-bold text-cyan-400">
                          {decision.confidence_score?.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-300 mb-3 line-clamp-2">{decision.reasoning}</div>
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      {decision.suggested_price && (
                        <div>
                          <div className="text-slate-400">Entry</div>
                          <div className="font-semibold">₹{decision.suggested_price}</div>
                        </div>
                      )}
                      {decision.target_price && (
                        <div>
                          <div className="text-slate-400">Target</div>
                          <div className="font-semibold text-green-400">₹{decision.target_price}</div>
                        </div>
                      )}
                      {decision.stop_loss && (
                        <div>
                          <div className="text-slate-400">Stop Loss</div>
                          <div className="font-semibold text-red-400">₹{decision.stop_loss}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecisionAction(decision.id, 'APPROVED')}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecisionAction(decision.id, 'REJECTED')}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur border border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold">Institutional Trap Alerts</h2>
            <span className="ml-auto bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
              {activeTraps.length} Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTraps.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-400">
                No active traps detected. Market appears healthy.
              </div>
            ) : (
              activeTraps.map((trap) => (
                <div key={trap.id} className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-lg">{trap.stock_symbol}</div>
                      <div className="text-xs text-red-400">{trap.trap_type.replace('_', ' ')}</div>
                    </div>
                    <div className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-semibold">
                      {trap.confidence_score?.toFixed(0)}% Confidence
                    </div>
                  </div>
                  <div className="text-sm text-slate-300 mb-2 line-clamp-2">{trap.description}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400">Price</div>
                      <div className="font-semibold">₹{trap.price_at_detection}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Volume Ratio</div>
                      <div className="font-semibold">{trap.volume_ratio?.toFixed(2)}x</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
