import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Activity, Target, Shield, AlertTriangle, CheckCircle, Clock, BarChart3, BookOpen } from 'lucide-react';

type PatternSignal = {
  id: string;
  symbol: string;
  pattern_name: string;
  pattern_type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timeframe: string;
  confidence_score: number;
  signal: 'BUY' | 'SELL' | 'WAIT';
  entry_price: number;
  target_price: number | null;
  stop_loss: number | null;
  risk_reward_ratio: number | null;
  pattern_description: string;
  why_it_works: string;
  why_it_fails: string | null;
  institutional_validation: boolean;
  success_rate: number | null;
  detected_at: string;
  is_active: boolean;
};

type PatternLibrary = {
  id: string;
  pattern_name: string;
  category: 'REVERSAL' | 'CONTINUATION' | 'BREAKOUT';
  description: string;
  bullish_or_bearish: string;
  success_rate: number | null;
  timeframe_best: string | null;
  volume_importance: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  how_to_identify: string;
  trading_rules: string;
  common_mistakes: string | null;
  institutional_use: boolean;
  retail_trap_warning: string | null;
};

type LivePrice = {
  symbol: string;
  ltp: number;
  open_price: number;
  high: number;
  low: number;
  prev_close: number;
  volume: number;
  change: number;
  change_percent: number;
  last_update: string;
};

export default function PatternIdentifier() {
  const [signals, setSignals] = useState<PatternSignal[]>([]);
  const [library, setLibrary] = useState<PatternLibrary[]>([]);
  const [livePrices, setLivePrices] = useState<Map<string, LivePrice>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'signals' | 'library'>('signals');
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'BUY' | 'SELL' | 'WAIT'>('ALL');
  const [selectedPattern, setSelectedPattern] = useState<PatternLibrary | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      updateLivePrices();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [signalsRes, libraryRes, pricesRes] = await Promise.all([
        supabase.from('pattern_signals').select('*').eq('is_active', true).order('detected_at', { ascending: false }),
        supabase.from('pattern_library').select('*').order('success_rate', { ascending: false }),
        supabase.from('live_prices').select('*')
      ]);

      if (signalsRes.data) setSignals(signalsRes.data);
      if (libraryRes.data) setLibrary(libraryRes.data);
      if (pricesRes.data) {
        const pricesMap = new Map<string, LivePrice>();
        pricesRes.data.forEach((price: any) => {
          pricesMap.set(price.symbol, price);
        });
        setLivePrices(pricesMap);
      }
    } catch (error) {
      console.error('Error loading patterns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateLivePrices() {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-live-prices`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch live prices:', response.status, response.statusText, errorText);
      } else {
        const result = await response.json();
        console.log('Price update result:', result);
      }

      const { data } = await supabase.from('live_prices').select('*');
      if (data) {
        const pricesMap = new Map<string, LivePrice>();
        data.forEach((price: any) => {
          pricesMap.set(price.symbol, price);
        });
        setLivePrices(pricesMap);
      }
    } catch (error) {
      console.error('Error updating prices:', error);
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

  const filteredSignals = filterSignal === 'ALL'
    ? signals
    : signals.filter(s => s.signal === filterSignal);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Loading Pattern Intelligence...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900/30 via-blue-900/30 to-emerald-900/30 border border-emerald-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Live Pattern Identifier</h2>
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-900/50 border border-emerald-600 rounded">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-bold text-sm">DETECTING</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Real-time chart pattern detection with institutional validation. Know WHY patterns work or fail before trading.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>{signals.length} active patterns detected</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>{library.length} patterns in library</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('signals')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'signals'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Live Signals ({signals.length})
          </button>
          <button
            onClick={() => setActiveView('library')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'library'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Pattern Library ({library.length})
          </button>
        </div>

        {activeView === 'signals' && (
          <div className="flex space-x-2">
            {['ALL', 'BUY', 'SELL', 'WAIT'].map(filter => (
              <button
                key={filter}
                onClick={() => setFilterSignal(filter as any)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  filterSignal === filter
                    ? filter === 'BUY' ? 'bg-emerald-600 text-white' :
                      filter === 'SELL' ? 'bg-rose-600 text-white' :
                      filter === 'WAIT' ? 'bg-amber-600 text-white' :
                      'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeView === 'signals' ? (
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className={`bg-slate-800/50 border rounded-lg p-6 ${
                signal.pattern_type === 'BULLISH' ? 'border-emerald-700/30' :
                signal.pattern_type === 'BEARISH' ? 'border-rose-700/30' :
                'border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{signal.symbol}</h3>
                    <span className={`px-3 py-1 rounded font-semibold text-sm ${
                      signal.pattern_type === 'BULLISH'
                        ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300'
                        : signal.pattern_type === 'BEARISH'
                        ? 'bg-rose-900/50 border border-rose-700 text-rose-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {signal.pattern_name}
                    </span>
                    <span className={`px-3 py-1 rounded font-bold text-sm ${
                      signal.signal === 'BUY'
                        ? 'bg-emerald-600 text-white'
                        : signal.signal === 'SELL'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {signal.signal}
                    </span>
                    {signal.institutional_validation && (
                      <CheckCircle className="w-5 h-5 text-blue-400" title="Institutionally validated" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(signal.detected_at)}</span>
                    </div>
                    <span>Timeframe: {signal.timeframe}</span>
                    <span>Confidence: {signal.confidence_score}%</span>
                    {signal.success_rate && <span>Success Rate: {signal.success_rate}%</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end ml-4">
                  {(() => {
                    const livePrice = livePrices.get(signal.symbol);
                    const priceChange = livePrice ? livePrice.ltp - signal.entry_price : 0;
                    const priceChangePercent = livePrice ? (priceChange / signal.entry_price) * 100 : 0;
                    const isPositive = priceChange >= 0;

                    return (
                      <>
                        {signal.pattern_type === 'BULLISH' ? (
                          <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
                        ) : signal.pattern_type === 'BEARISH' ? (
                          <TrendingDown className="w-8 h-8 text-rose-400 mb-2" />
                        ) : (
                          <Activity className="w-8 h-8 text-slate-400 mb-2" />
                        )}

                        {livePrice ? (
                          <>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                              <span className="text-xs font-bold text-green-400">LIVE</span>
                            </div>
                            <span className="text-3xl font-bold text-white">₹{livePrice.ltp.toFixed(2)}</span>
                            <div className={`flex items-center space-x-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span className="text-sm font-bold">
                                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-2 text-right">
                              <div>Entry: ₹{signal.entry_price}</div>
                              <div>Day Range: ₹{livePrice.low} - ₹{livePrice.high}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-bold text-white">₹{signal.entry_price}</span>
                            <span className="text-xs text-slate-400">Entry Price</span>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-300 leading-relaxed">{signal.pattern_description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {signal.target_price && (
                  <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">TARGET</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-300">₹{signal.target_price}</p>
                    {signal.entry_price && (
                      <p className="text-xs text-slate-400">
                        +{(((signal.target_price - signal.entry_price) / signal.entry_price) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                )}

                {signal.stop_loss && (
                  <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-400">STOP LOSS</span>
                    </div>
                    <p className="text-xl font-bold text-rose-300">₹{signal.stop_loss}</p>
                    {signal.entry_price && (
                      <p className="text-xs text-slate-400">
                        {(((signal.stop_loss - signal.entry_price) / signal.entry_price) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                )}

                {signal.risk_reward_ratio && (
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">RISK/REWARD</span>
                    </div>
                    <p className="text-xl font-bold text-blue-300">1:{signal.risk_reward_ratio}</p>
                    <p className="text-xs text-slate-400">Excellent ratio</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">WHY THIS PATTERN WORKS:</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{signal.why_it_works}</p>
                </div>

                {signal.why_it_fails && (
                  <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-semibold text-rose-400">WHEN THIS PATTERN FAILS:</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{signal.why_it_fails}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {library.map((pattern) => (
              <div
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`bg-slate-800/50 border rounded-lg p-5 hover:border-blue-600/50 cursor-pointer transition-all ${
                  pattern.category === 'REVERSAL' ? 'border-purple-700/30' :
                  pattern.category === 'CONTINUATION' ? 'border-blue-700/30' :
                  'border-emerald-700/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{pattern.pattern_name}</h3>
                      {pattern.institutional_use && (
                        <CheckCircle className="w-4 h-4 text-blue-400" title="Used by institutions" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        pattern.category === 'REVERSAL' ? 'bg-purple-900/50 text-purple-300' :
                        pattern.category === 'CONTINUATION' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-emerald-900/50 text-emerald-300'
                      }`}>
                        {pattern.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        pattern.bullish_or_bearish.includes('BULLISH') ? 'bg-emerald-900/30 text-emerald-400' :
                        pattern.bullish_or_bearish.includes('BEARISH') ? 'bg-rose-900/30 text-rose-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {pattern.bullish_or_bearish}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{pattern.description}</p>
                  </div>
                  {pattern.success_rate && (
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-emerald-400">{pattern.success_rate}%</div>
                      <div className="text-xs text-slate-400">Success</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  {pattern.timeframe_best && <span>Best: {pattern.timeframe_best}</span>}
                  {pattern.volume_importance && (
                    <span className={`px-2 py-1 rounded ${
                      pattern.volume_importance === 'HIGH' ? 'bg-rose-900/30 text-rose-400' :
                      pattern.volume_importance === 'MEDIUM' ? 'bg-amber-900/30 text-amber-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      Volume: {pattern.volume_importance}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedPattern && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedPattern(null)}>
              <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{selectedPattern.pattern_name}</h2>
                        {selectedPattern.institutional_use && (
                          <CheckCircle className="w-6 h-6 text-blue-400" title="Used by institutions" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          selectedPattern.category === 'REVERSAL' ? 'bg-purple-900/50 text-purple-300' :
                          selectedPattern.category === 'CONTINUATION' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-emerald-900/50 text-emerald-300'
                        }`}>
                          {selectedPattern.category}
                        </span>
                        {selectedPattern.success_rate && (
                          <span className="text-emerald-400 font-bold">Success Rate: {selectedPattern.success_rate}%</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPattern(null)}
                      className="text-slate-400 hover:text-white transition-colors text-2xl font-bold ml-4"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2">DESCRIPTION</h3>
                    <p className="text-slate-300 leading-relaxed">{selectedPattern.description}</p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">HOW TO IDENTIFY</h3>
                    <p className="text-slate-300 leading-relaxed">{selectedPattern.how_to_identify}</p>
                  </div>

                  <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-2">TRADING RULES</h3>
                    <p className="text-slate-300 leading-relaxed">{selectedPattern.trading_rules}</p>
                  </div>

                  {selectedPattern.common_mistakes && (
                    <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-rose-400 mb-2">COMMON MISTAKES</h3>
                      <p className="text-slate-300 leading-relaxed">{selectedPattern.common_mistakes}</p>
                    </div>
                  )}

                  {selectedPattern.retail_trap_warning && (
                    <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-amber-400 mb-2">RETAIL TRAP WARNING</h3>
                      <p className="text-slate-300 leading-relaxed">{selectedPattern.retail_trap_warning}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {selectedPattern.timeframe_best && (
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <h3 className="text-xs font-semibold text-slate-400 mb-1">BEST TIMEFRAME</h3>
                        <p className="text-lg font-bold text-white">{selectedPattern.timeframe_best}</p>
                      </div>
                    )}
                    {selectedPattern.volume_importance && (
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <h3 className="text-xs font-semibold text-slate-400 mb-1">VOLUME IMPORTANCE</h3>
                        <p className={`text-lg font-bold ${
                          selectedPattern.volume_importance === 'HIGH' ? 'text-rose-400' :
                          selectedPattern.volume_importance === 'MEDIUM' ? 'text-amber-400' :
                          'text-slate-300'
                        }`}>
                          {selectedPattern.volume_importance}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
