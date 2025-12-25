import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Radio, Clock, AlertCircle, Target, Zap } from 'lucide-react';

type NewsEvent = {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  event_type: string;
  sentiment_score: number;
  impact_prediction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  institutional_response: string;
  retail_response: string;
  opportunity_type: 'FOLLOW' | 'FADE' | 'AVOID';
  reasoning: string;
  published_at: string;
};

type TradeSignal = {
  id: string;
  symbol: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence: number;
  time_horizon: string;
  risk_reward_ratio: number;
  reasoning: string;
  institutional_alignment: boolean;
  is_active: boolean;
  created_at: string;
};

export default function LiveFeed() {
  const [news, setNews] = useState<NewsEvent[]>([]);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(() => {
      loadLiveData();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadLiveData() {
    try {
      const [newsRes, signalsRes] = await Promise.all([
        supabase
          .from('news_events')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(10),
        supabase
          .from('trade_signals')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (newsRes.data) setNews(newsRes.data);
      if (signalsRes.data) setSignals(signalsRes.data);
    } catch (error) {
      console.error('Error loading live data:', error);
    } finally {
      setLoading(false);
    }
  }

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
        <div className="text-white text-lg">Loading Live Feed...</div>
      </div>
    );
  }

  const breakingNews = news.filter(n => n.confidence >= 90 && new Date(n.published_at).getTime() > Date.now() - 3600000);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 border border-red-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Radio className="w-6 h-6 text-red-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            </div>
            <h2 className="text-xl font-bold text-white">LIVE NSE/BSE MARKET INTELLIGENCE</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-300">
            <Clock className="w-4 h-4" />
            <span>Updated {getTimeAgo(lastUpdate.toISOString())}</span>
          </div>
        </div>
      </div>

      {breakingNews.length > 0 && (
        <div className="bg-red-900/20 border-2 border-red-600 rounded-lg overflow-hidden">
          <div className="bg-red-900/50 px-4 py-2 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Breaking News</span>
          </div>
          <div className="p-4 space-y-3">
            {breakingNews.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse"></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-bold text-white">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-slate-400">{getTimeAgo(item.published_at)}</span>
                  </div>
                  <h3 className="text-white font-semibold">{item.headline}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Live News Feed</span>
            </h3>
            <span className="text-xs text-slate-400">{news.length} updates</span>
          </div>

          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
            {news.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-800/50 border rounded-lg p-4 hover:border-slate-600 transition-all ${
                  item.impact_prediction === 'BULLISH' ? 'border-emerald-700/30' :
                  item.impact_prediction === 'BEARISH' ? 'border-rose-700/30' :
                  'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-slate-700 rounded font-bold text-white text-sm">
                      {item.symbol}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.impact_prediction === 'BULLISH' ? 'bg-emerald-900/50 text-emerald-300' :
                      item.impact_prediction === 'BEARISH' ? 'bg-rose-900/50 text-rose-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {item.impact_prediction}
                    </span>
                    {item.institutional_alignment !== null && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.opportunity_type === 'FOLLOW' ? 'bg-blue-900/50 text-blue-300' :
                        item.opportunity_type === 'FADE' ? 'bg-purple-900/50 text-purple-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {item.opportunity_type}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                    {getTimeAgo(item.published_at)}
                  </span>
                </div>

                <h4 className="text-white font-semibold mb-2 text-sm leading-snug">{item.headline}</h4>
                <p className="text-xs text-slate-400 mb-2">Source: {item.source}</p>

                <div className="bg-slate-900/50 rounded p-3 mb-2">
                  <p className="text-xs font-semibold text-blue-400 mb-1">INSTITUTIONAL RESPONSE:</p>
                  <p className="text-xs text-slate-300">{item.institutional_response}</p>
                </div>

                <div className="bg-slate-900/50 rounded p-3 mb-2">
                  <p className="text-xs font-semibold text-amber-400 mb-1">RETAIL RESPONSE:</p>
                  <p className="text-xs text-slate-300">{item.retail_response}</p>
                </div>

                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded p-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">TRADING STRATEGY:</p>
                  <p className="text-xs text-slate-300">{item.reasoning}</p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-slate-400">Confidence: </span>
                      <span className="text-white font-semibold">{item.confidence}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Sentiment: </span>
                      <span className={`font-semibold ${
                        item.sentiment_score > 0.5 ? 'text-emerald-400' :
                        item.sentiment_score < -0.5 ? 'text-rose-400' :
                        'text-slate-300'
                      }`}>
                        {item.sentiment_score > 0 ? '+' : ''}{(item.sentiment_score * 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>Active Trade Signals</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">{signals.length} LIVE</span>
          </div>

          <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className={`bg-slate-800/50 border rounded-lg p-4 ${
                  signal.signal_type === 'BUY' ? 'border-emerald-700/50' : 'border-rose-700/50'
                } hover:border-opacity-100 transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-slate-700 rounded font-bold text-white">
                      {signal.symbol}
                    </span>
                    <span className={`px-3 py-1 rounded font-bold text-sm ${
                      signal.signal_type === 'BUY'
                        ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300'
                        : 'bg-rose-900/50 border border-rose-700 text-rose-300'
                    }`}>
                      {signal.signal_type}
                    </span>
                    {signal.institutional_alignment && (
                      <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">
                        Institutions Aligned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {signal.signal_type === 'BUY' ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y border-slate-700">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Entry</p>
                    <p className="text-sm font-bold text-white">₹{signal.entry_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Target</p>
                    <p className="text-sm font-bold text-emerald-400">₹{signal.target_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Stop Loss</p>
                    <p className="text-sm font-bold text-rose-400">₹{signal.stop_loss}</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded p-3 mb-3">
                  <p className="text-xs font-semibold text-emerald-400 mb-1">SIGNAL REASONING:</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{signal.reasoning}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Confidence: </span>
                    <span className="text-white font-semibold">{signal.confidence}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">R:R: </span>
                    <span className="text-emerald-400 font-semibold">{signal.risk_reward_ratio}:1</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Horizon: </span>
                    <span className="text-white font-semibold">{signal.time_horizon}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Signal Created: {getTimeAgo(signal.created_at)}</span>
                    <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded font-semibold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
