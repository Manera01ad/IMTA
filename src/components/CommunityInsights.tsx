import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, TrendingDown, AlertTriangle, MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, XCircle, Clock } from 'lucide-react';

type CommunityInsight = {
  id: string;
  user_name: string;
  symbol: string;
  insight_text: string;
  entry_price: number | null;
  exit_price: number | null;
  outcome: 'PROFIT' | 'LOSS' | 'ONGOING';
  outcome_percentage: number | null;
  trade_date: string;
  insight_type: 'TRADE_RESULT' | 'OBSERVATION' | 'WARNING' | 'TIP';
  is_verified: boolean;
  created_at: string;
  buy_votes?: number;
  sell_votes?: number;
};

export default function CommunityInsights() {
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [newInsight, setNewInsight] = useState({
    user_name: '',
    symbol: '',
    insight_text: '',
    insight_type: 'OBSERVATION'
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      const { data: insightsData, error } = await supabase
        .from('community_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (insightsData) {
        const insightsWithVotes = await Promise.all(
          insightsData.map(async (insight) => {
            const { data: votes } = await supabase
              .from('community_votes')
              .select('vote_type')
              .eq('insight_id', insight.id);

            const buy_votes = votes?.filter(v => v.vote_type === 'BUY').length || 0;
            const sell_votes = votes?.filter(v => v.vote_type === 'SELL').length || 0;

            return { ...insight, buy_votes, sell_votes };
          })
        );

        setInsights(insightsWithVotes);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(insightId: string, voteType: 'BUY' | 'SELL') {
    try {
      const voterIp = Math.random().toString(36).substring(7);

      const { error } = await supabase
        .from('community_votes')
        .insert({ insight_id: insightId, vote_type: voteType, voter_ip: voterIp });

      if (error && error.code === '23505') {
        alert('You have already voted on this insight');
        return;
      }

      loadInsights();
    } catch (error) {
      console.error('Error voting:', error);
    }
  }

  async function handleSubmitInsight(e: React.FormEvent) {
    e.preventDefault();

    if (!newInsight.symbol || !newInsight.insight_text) {
      alert('Please fill in symbol and insight');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_insights')
        .insert([{
          user_name: newInsight.user_name || 'Anonymous Trader',
          symbol: newInsight.symbol.toUpperCase(),
          insight_text: newInsight.insight_text,
          insight_type: newInsight.insight_type
        }]);

      if (error) throw error;

      setNewInsight({ user_name: '', symbol: '', insight_text: '', insight_type: 'OBSERVATION' });
      setShowForm(false);
      loadInsights();
    } catch (error) {
      console.error('Error submitting insight:', error);
    }
  }

  const uniqueSymbols = ['ALL', ...new Set(insights.map(i => i.symbol))];
  const filteredInsights = filterSymbol === 'ALL'
    ? insights
    : insights.filter(i => i.symbol === filterSymbol);

  function getTimeAgo(timestamp: string) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Loading Community Insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30 border border-blue-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Community Knowledge Center</h2>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Share real trading experiences, learn from others' wins and losses. Facts only, no speculation.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified insights from real traders</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>{insights.length} community insights</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Share Insight
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">Share Your Trading Insight</h3>
          <form onSubmit={handleSubmitInsight} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={newInsight.user_name}
                  onChange={(e) => setNewInsight({ ...newInsight, user_name: e.target.value })}
                  placeholder="Anonymous Trader"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Stock Symbol *
                </label>
                <input
                  type="text"
                  value={newInsight.symbol}
                  onChange={(e) => setNewInsight({ ...newInsight, symbol: e.target.value })}
                  placeholder="RELIANCE, TCS, INFY..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Insight Type
              </label>
              <select
                value={newInsight.insight_type}
                onChange={(e) => setNewInsight({ ...newInsight, insight_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="OBSERVATION">Observation</option>
                <option value="TIP">Trading Tip</option>
                <option value="WARNING">Warning</option>
                <option value="TRADE_RESULT">Trade Result</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Your Insight (Factual information only) *
              </label>
              <textarea
                value={newInsight.insight_text}
                onChange={(e) => setNewInsight({ ...newInsight, insight_text: e.target.value })}
                placeholder="Share your factual observations, real trade results, or lessons learned..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Submit Insight
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {uniqueSymbols.map(symbol => (
          <button
            key={symbol}
            onClick={() => setFilterSymbol(symbol)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${
              filterSymbol === symbol
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredInsights.map((insight) => {
          const totalVotes = (insight.buy_votes || 0) + (insight.sell_votes || 0);
          const buyPercentage = totalVotes > 0 ? ((insight.buy_votes || 0) / totalVotes) * 100 : 50;
          const sellPercentage = totalVotes > 0 ? ((insight.sell_votes || 0) / totalVotes) * 100 : 50;

          return (
            <div
              key={insight.id}
              className={`bg-slate-800/50 border rounded-lg p-5 ${
                insight.insight_type === 'WARNING' ? 'border-red-700/50' :
                insight.outcome === 'PROFIT' ? 'border-emerald-700/30' :
                insight.outcome === 'LOSS' ? 'border-rose-700/30' :
                'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    insight.insight_type === 'WARNING' ? 'bg-red-900/50' :
                    insight.insight_type === 'TRADE_RESULT' ? 'bg-blue-900/50' :
                    insight.insight_type === 'TIP' ? 'bg-purple-900/50' :
                    'bg-slate-700'
                  }`}>
                    {insight.insight_type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {insight.insight_type === 'TRADE_RESULT' && <TrendingUp className="w-5 h-5 text-blue-400" />}
                    {insight.insight_type === 'TIP' && <MessageSquare className="w-5 h-5 text-purple-400" />}
                    {insight.insight_type === 'OBSERVATION' && <MessageSquare className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{insight.user_name}</span>
                      {insight.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" title="Verified insight" />
                      )}
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-bold text-white">
                        {insight.symbol}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        insight.insight_type === 'WARNING' ? 'bg-red-900/50 text-red-300' :
                        insight.insight_type === 'TRADE_RESULT' ? 'bg-blue-900/50 text-blue-300' :
                        insight.insight_type === 'TIP' ? 'bg-purple-900/50 text-purple-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {insight.insight_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeAgo(insight.created_at)}</span>
                    </div>
                  </div>
                </div>

                {insight.outcome !== 'ONGOING' && (
                  <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                    insight.outcome === 'PROFIT'
                      ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                      : 'bg-rose-900/50 text-rose-300 border border-rose-700'
                  }`}>
                    {insight.outcome === 'PROFIT' ? '+' : ''}{insight.outcome_percentage?.toFixed(2)}%
                  </div>
                )}
              </div>

              {(insight.entry_price || insight.exit_price) && (
                <div className="flex items-center space-x-4 mb-3 text-sm">
                  {insight.entry_price && (
                    <div>
                      <span className="text-slate-400">Entry: </span>
                      <span className="text-white font-semibold">₹{insight.entry_price}</span>
                    </div>
                  )}
                  {insight.exit_price && (
                    <div>
                      <span className="text-slate-400">Exit: </span>
                      <span className="text-white font-semibold">₹{insight.exit_price}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {insight.insight_text}
              </p>

              <div className="border-t border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Community Sentiment</span>
                      <span>{totalVotes} votes</span>
                    </div>
                    <div className="flex h-8 rounded-lg overflow-hidden">
                      <div
                        className="bg-emerald-600 flex items-center justify-center text-white font-bold text-xs transition-all"
                        style={{ width: `${buyPercentage}%` }}
                      >
                        {insight.buy_votes || 0}
                      </div>
                      <div
                        className="bg-rose-600 flex items-center justify-center text-white font-bold text-xs transition-all"
                        style={{ width: `${sellPercentage}%` }}
                      >
                        {insight.sell_votes || 0}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleVote(insight.id, 'BUY')}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-700 rounded-lg transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 text-emerald-300" />
                      <span className="text-emerald-300 font-semibold text-sm">BUY</span>
                    </button>
                    <button
                      onClick={() => handleVote(insight.id, 'SELL')}
                      className="flex items-center space-x-2 px-4 py-2 bg-rose-900/50 hover:bg-rose-900 border border-rose-700 rounded-lg transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4 text-rose-300" />
                      <span className="text-rose-300 font-semibold text-sm">SELL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
