import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Target, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RiskSettings, UserPortfolio } from '../types/financial';
import { agentOrchestrator } from '../lib/agentOrchestrator';

export default function RiskManagement() {
  const [riskSettings, setRiskSettings] = useState<RiskSettings | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio[]>([]);
  const [calculatorInputs, setCalculatorInputs] = useState({
    entryPrice: '',
    stopLoss: '',
    targetPrice: '',
  });
  const [calculation, setCalculation] = useState<any>(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [settingsRes, portfolioRes] = await Promise.all([
      supabase.from('risk_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('user_portfolios').select('*').eq('user_id', user.id),
    ]);

    if (settingsRes.data) setRiskSettings(settingsRes.data);
    if (portfolioRes.data) setPortfolio(portfolioRes.data);
  };

  const saveRiskSettings = async (settings: Partial<RiskSettings>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (riskSettings) {
      await supabase
        .from('risk_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('risk_settings')
        .insert({ ...settings, user_id: user.id });
    }

    loadRiskData();
  };

  const calculatePosition = () => {
    if (!riskSettings || !calculatorInputs.entryPrice || !calculatorInputs.stopLoss) return;

    const entry = parseFloat(calculatorInputs.entryPrice);
    const stopLoss = parseFloat(calculatorInputs.stopLoss);
    const target = calculatorInputs.targetPrice ? parseFloat(calculatorInputs.targetPrice) : entry * 1.05;

    const positionSize = agentOrchestrator.calculatePositionSize(
      riskSettings.total_capital,
      riskSettings.max_risk_per_trade_percentage,
      entry,
      stopLoss
    );

    const riskReward = agentOrchestrator.calculateRiskReward(entry, stopLoss, target);

    const validation = agentOrchestrator.validateTradeAgainstRiskSettings(
      positionSize.positionValue,
      positionSize.capitalAtRisk,
      riskSettings
    );

    setCalculation({
      ...positionSize,
      riskReward,
      validation,
      target,
    });
  };

  const getTotalExposure = () => {
    return portfolio.reduce((sum, pos) => sum + (pos.current_value || pos.invested_amount), 0);
  };

  const getTotalPnL = () => {
    return portfolio.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Risk Management & Position Sizing
          </h1>
          <p className="text-slate-400 mt-2">Protect Your Capital - The Foundation of Profitable Trading</p>
        </div>

        {!riskSettings ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur border border-yellow-500/30 rounded-xl p-8 text-center"
          >
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Set Up Your Risk Parameters</h2>
            <p className="text-slate-400 mb-6">Define your risk tolerance to enable AI-powered position sizing</p>
            <button
              onClick={() => {
                saveRiskSettings({
                  total_capital: 100000,
                  max_position_size_percentage: 10,
                  max_risk_per_trade_percentage: 2,
                  max_daily_loss_percentage: 5,
                  volume_multiplier: 1.5,
                  auto_stop_loss: true,
                  risk_appetite: 'MODERATE',
                });
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Initialize Default Settings
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
              >
                <DollarSign className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-sm text-slate-400">Total Capital</div>
                <div className="text-3xl font-bold">₹{riskSettings.total_capital.toLocaleString()}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
              >
                <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-sm text-slate-400">Current Exposure</div>
                <div className="text-3xl font-bold">₹{getTotalExposure().toLocaleString()}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {((getTotalExposure() / riskSettings.total_capital) * 100).toFixed(1)}% of capital
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`bg-gradient-to-br ${
                  getTotalPnL() >= 0
                    ? 'from-green-500/20 to-green-600/20 border-green-500/30'
                    : 'from-red-500/20 to-red-600/20 border-red-500/30'
                } border rounded-xl p-6`}
              >
                <Target className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-sm text-slate-400">Total P&L</div>
                <div className={`text-3xl font-bold ${getTotalPnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {getTotalPnL() >= 0 ? '+' : ''}₹{getTotalPnL().toLocaleString()}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
              >
                <Shield className="w-8 h-8 text-purple-400 mb-2" />
                <div className="text-sm text-slate-400">Risk Appetite</div>
                <div className="text-3xl font-bold">{riskSettings.risk_appetite}</div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calculator className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold">Position Size Calculator</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Entry Price (₹)</label>
                    <input
                      type="number"
                      value={calculatorInputs.entryPrice}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, entryPrice: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Stop Loss (₹)</label>
                    <input
                      type="number"
                      value={calculatorInputs.stopLoss}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, stopLoss: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Target Price (₹) - Optional</label>
                    <input
                      type="number"
                      value={calculatorInputs.targetPrice}
                      onChange={(e) => setCalculatorInputs({ ...calculatorInputs, targetPrice: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <button
                    onClick={calculatePosition}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Calculate Position Size
                  </button>
                </div>

                {calculation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommended Quantity</span>
                      <span className="font-bold text-xl text-cyan-400">{calculation.recommendedQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Position Value</span>
                      <span className="font-semibold">₹{calculation.positionValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Capital at Risk</span>
                      <span className="font-semibold text-red-400">₹{calculation.capitalAtRisk.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Risk:Reward Ratio</span>
                      <span className={`font-bold ${calculation.riskReward >= 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                        1:{calculation.riskReward.toFixed(2)}
                      </span>
                    </div>

                    {!calculation.validation.valid && (
                      <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                        <div className="font-semibold text-red-400 mb-2">⚠ Risk Violations:</div>
                        <ul className="text-sm text-red-300 space-y-1">
                          {calculation.validation.violations.map((violation: string, i: number) => (
                            <li key={i}>• {violation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold">Risk Parameters</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Max Position Size</span>
                      <span className="font-bold text-cyan-400">{riskSettings.max_position_size_percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Max ₹{((riskSettings.total_capital * riskSettings.max_position_size_percentage) / 100).toLocaleString()}{' '}
                      per position
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Max Risk Per Trade</span>
                      <span className="font-bold text-red-400">{riskSettings.max_risk_per_trade_percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Max ₹
                      {((riskSettings.total_capital * riskSettings.max_risk_per_trade_percentage) / 100).toLocaleString()}{' '}
                      at risk
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Max Daily Loss</span>
                      <span className="font-bold text-red-400">{riskSettings.max_daily_loss_percentage}%</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Max ₹{((riskSettings.total_capital * riskSettings.max_daily_loss_percentage) / 100).toLocaleString()}{' '}
                      per day
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400">Volume Multiplier</span>
                      <span className="font-bold text-purple-400">{riskSettings.volume_multiplier}x</span>
                    </div>
                    <div className="text-xs text-slate-500">Minimum volume confirmation required</div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Auto Stop-Loss</span>
                      <span className={`font-bold ${riskSettings.auto_stop_loss ? 'text-green-400' : 'text-red-400'}`}>
                        {riskSettings.auto_stop_loss ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {portfolio.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
              >
                <h2 className="text-2xl font-bold mb-4">Current Portfolio</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-700">
                      <tr className="text-left text-slate-400 text-sm">
                        <th className="pb-3">Symbol</th>
                        <th className="pb-3">Qty</th>
                        <th className="pb-3">Avg Buy</th>
                        <th className="pb-3">Current</th>
                        <th className="pb-3">Invested</th>
                        <th className="pb-3">Current Value</th>
                        <th className="pb-3">P&L</th>
                        <th className="pb-3">P&L %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((position) => (
                        <tr key={position.id} className="border-b border-slate-700/50">
                          <td className="py-3 font-bold">{position.stock_symbol}</td>
                          <td className="py-3">{position.quantity}</td>
                          <td className="py-3">₹{position.avg_buy_price}</td>
                          <td className="py-3">₹{position.current_price || position.avg_buy_price}</td>
                          <td className="py-3">₹{position.invested_amount.toLocaleString()}</td>
                          <td className="py-3">
                            ₹{(position.current_value || position.invested_amount).toLocaleString()}
                          </td>
                          <td
                            className={`py-3 font-semibold ${
                              (position.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {(position.pnl || 0) >= 0 ? '+' : ''}₹{(position.pnl || 0).toLocaleString()}
                          </td>
                          <td
                            className={`py-3 font-semibold ${
                              (position.pnl_percentage || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {(position.pnl_percentage || 0) >= 0 ? '+' : ''}
                            {(position.pnl_percentage || 0).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
