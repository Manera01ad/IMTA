import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, TradingStrategy, IPO, InstitutionalTrade, StrategyWarning, EducationalContent } from './lib/supabase';
import { TrendingUp, TrendingDown, AlertTriangle, BookOpen } from 'lucide-react';
import Navigation from './components/Navigation';
import AIResearchHub from './components/AIResearchHub';
import LiveFeedModule from './modules/LiveFeedModule';
import PatternIdentifierModule from './modules/PatternIdentifierModule';
import CommunityInsightsModule from './modules/CommunityInsightsModule';
import StrategyIntelligenceModule from './modules/StrategyIntelligenceModule';
import IPOResearchModule from './modules/IPOResearchModule';
import DevMap from './pages/DevMap';
import FinancialDashboard from './pages/FinancialDashboard';
import RiskManagement from './pages/RiskManagement';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
  const [ipos, setIPOs] = useState<IPO[]>([]);
  const [institutionalTrades, setInstitutionalTrades] = useState<InstitutionalTrade[]>([]);
  const [warnings, setWarnings] = useState<StrategyWarning[]>([]);
  const [education, setEducation] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [strategiesRes, iposRes, tradesRes, warningsRes, educationRes] = await Promise.all([
        supabase.from('trading_strategies').select('*').order('is_recommended', { ascending: false }),
        supabase.from('ipos').select('*').order('ipo_date', { ascending: false }),
        supabase.from('institutional_trades').select('*').order('trade_date', { ascending: false }).limit(20),
        supabase.from('strategy_warnings').select('*').order('severity', { ascending: true }),
        supabase.from('educational_content').select('*').order('created_at', { ascending: false })
      ]);

      if (strategiesRes.data) setStrategies(strategiesRes.data);
      if (iposRes.data) setIPOs(iposRes.data);
      if (tradesRes.data) setInstitutionalTrades(tradesRes.data);
      if (warningsRes.data) setWarnings(warningsRes.data);
      if (educationRes.data) setEducation(educationRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading Trading Intelligence System...</div>
      </div>
    );
  }

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation currentPath={location.pathname} onNavigate={handleNavigate} />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<FinancialDashboard />} />
        <Route path="/risk-management" element={<RiskManagement />} />
        <Route path="/ai-assistant/*" element={<AIResearchHub />} />
        <Route path="/live-feed" element={<LiveFeedModule />} />
        <Route path="/pattern-identifier" element={<PatternIdentifierModule />} />
        <Route path="/community-insights" element={<CommunityInsightsModule />} />
        <Route path="/community/*" element={<CommunityInsightsModule />} />
        <Route path="/strategy-intelligence" element={<StrategyIntelligenceModule />} />
        <Route path="/ipo-research" element={<IPOResearchModule />} />
        <Route path="/footprints" element={<FootprintsView trades={institutionalTrades} />} />
        <Route path="/warnings" element={<WarningsView warnings={warnings} />} />
        <Route path="/education" element={<EducationView content={education} />} />
        <Route path="/learning/*" element={<EducationView content={education} />} />
        <Route path="/dev-map" element={<DevMap />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function StrategiesView({ strategies }: { strategies: TradingStrategy[] }) {
  const recommended = strategies.filter(s => s.is_recommended);
  const notRecommended = strategies.filter(s => !s.is_recommended);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-emerald-400 mb-2">Recommended Strategies (Profitable)</h2>
        <p className="text-slate-300 text-sm">These strategies have proven edge and institutional adoption. Follow these to make money.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recommended.map((strategy) => (
          <div key={strategy.id} className="bg-slate-800/50 border border-emerald-700/30 rounded-lg p-6 hover:border-emerald-600/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{strategy.name}</h3>
                  {strategy.institutional_use && (
                    <span className="px-2 py-1 bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-300">
                      Institutional Use
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm">{strategy.description}</p>
              </div>
              <div className="flex flex-col items-end ml-4">
                <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                <span className="text-2xl font-bold text-emerald-400">{strategy.success_rate}%</span>
                <span className="text-xs text-slate-400">Success Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-y border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg Return</p>
                <p className="text-lg font-semibold text-white">{strategy.avg_return > 0 ? '+' : ''}{strategy.avg_return}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Sharpe Ratio</p>
                <p className="text-lg font-semibold text-white">{strategy.sharpe_ratio}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Max Drawdown</p>
                <p className="text-lg font-semibold text-rose-400">-{strategy.max_drawdown}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Win/Loss</p>
                <p className="text-lg font-semibold text-white">{strategy.win_count}/{strategy.loss_count}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-xs font-semibold text-emerald-400 mb-1">WHY THIS WORKS:</p>
                <p className="text-sm text-slate-300">{strategy.reasoning}</p>
              </div>

              <div className="bg-amber-900/20 border border-amber-700/50 rounded p-3">
                <p className="text-xs font-semibold text-amber-400 mb-1">WARNING:</p>
                <p className="text-sm text-slate-300">{strategy.retail_trap_warning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-rose-400 mb-2">NOT Recommended Strategies (Money Losers)</h2>
        <p className="text-slate-300 text-sm">Avoid these strategies. They consistently lose money for retail traders.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {notRecommended.map((strategy) => (
          <div key={strategy.id} className="bg-slate-800/50 border border-rose-700/30 rounded-lg p-6 opacity-90">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white line-through">{strategy.name}</h3>
                  <span className="px-2 py-1 bg-rose-900/50 border border-rose-700 rounded text-xs text-rose-300">
                    LOSING STRATEGY
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{strategy.description}</p>
              </div>
              <div className="flex flex-col items-end ml-4">
                <TrendingDown className="w-6 h-6 text-rose-400 mb-2" />
                <span className="text-2xl font-bold text-rose-400">{strategy.success_rate}%</span>
                <span className="text-xs text-slate-400">Success Rate</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-y border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg Return</p>
                <p className="text-lg font-semibold text-rose-400">{strategy.avg_return > 0 ? '+' : ''}{strategy.avg_return}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Sharpe Ratio</p>
                <p className="text-lg font-semibold text-rose-400">{strategy.sharpe_ratio}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Max Drawdown</p>
                <p className="text-lg font-semibold text-rose-400">-{strategy.max_drawdown}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Win/Loss</p>
                <p className="text-lg font-semibold text-white">{strategy.win_count}/{strategy.loss_count}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-900/30 rounded p-3 border border-rose-700/50">
                <p className="text-xs font-semibold text-rose-400 mb-1">WHY THIS FAILS:</p>
                <p className="text-sm text-slate-300">{strategy.reasoning}</p>
              </div>

              <div className="bg-rose-900/20 border border-rose-700/50 rounded p-3">
                <p className="text-xs font-semibold text-rose-400 mb-1">CRITICAL WARNING:</p>
                <p className="text-sm text-slate-300">{strategy.retail_trap_warning}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IPOsView({ ipos }: { ipos: IPO[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-2">IPO Research Center</h2>
        <p className="text-slate-300 text-sm">Analyze upcoming and recent IPOs with institutional demand indicators</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ipos.map((ipo) => (
          <div key={ipo.id} className={`bg-slate-800/50 border rounded-lg p-6 ${
            ipo.recommendation === 'BUY' ? 'border-emerald-700/50' :
            ipo.recommendation === 'WAIT' ? 'border-amber-700/50' :
            'border-rose-700/50'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{ipo.symbol}</h3>
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${
                    ipo.recommendation === 'BUY' ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300' :
                    ipo.recommendation === 'WAIT' ? 'bg-amber-900/50 border border-amber-700 text-amber-300' :
                    'bg-rose-900/50 border border-rose-700 text-rose-300'
                  }`}>
                    {ipo.recommendation}
                  </span>
                </div>
                <h4 className="text-lg text-slate-300 mb-1">{ipo.company_name}</h4>
                <p className="text-sm text-slate-400">{ipo.sector}</p>
              </div>
              <div className="flex flex-col items-end ml-4">
                <span className="text-3xl font-bold text-white">{ipo.analysis_score}</span>
                <span className="text-xs text-slate-400">Score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 py-4 border-y border-slate-700">
              <div>
                <p className="text-xs text-slate-400 mb-1">IPO Price</p>
                <p className="text-lg font-semibold text-white">${ipo.final_price}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Market Cap</p>
                <p className="text-lg font-semibold text-white">${(ipo.market_cap / 1000000000).toFixed(1)}B</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Institutional Demand</p>
                <p className={`text-lg font-semibold ${
                  ipo.institutional_demand === 'High' ? 'text-emerald-400' :
                  ipo.institutional_demand === 'Medium' ? 'text-amber-400' :
                  'text-rose-400'
                }`}>{ipo.institutional_demand}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Lockup Period</p>
                <p className="text-lg font-semibold text-white">{ipo.lockup_period_days} days</p>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded p-4 mb-3">
              <p className="text-xs font-semibold text-slate-400 mb-2">UNDERWRITERS:</p>
              <div className="flex flex-wrap gap-2">
                {ipo.underwriters.map((underwriter, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-xs text-slate-300">
                    {underwriter}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded p-4">
              <p className="text-xs font-semibold text-blue-400 mb-2">ANALYSIS & REASONING:</p>
              <p className="text-sm text-slate-300 leading-relaxed">{ipo.reasoning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FootprintsView({ trades }: { trades: InstitutionalTrade[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-purple-400 mb-2">Institutional Footprints</h2>
        <p className="text-slate-300 text-sm">Track smart money moves - Follow the institutions, avoid trading against them</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trades.map((trade) => (
          <div key={trade.id} className={`bg-slate-800/50 border rounded-lg p-5 ${
            trade.trade_type === 'BUY' ? 'border-emerald-700/30 hover:border-emerald-600/50' : 'border-rose-700/30 hover:border-rose-600/50'
          } transition-all`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{trade.symbol}</h3>
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${
                    trade.trade_type === 'BUY'
                      ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300'
                      : 'bg-rose-900/50 border border-rose-700 text-rose-300'
                  }`}>
                    {trade.trade_type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.confidence_level === 'HIGH' ? 'bg-blue-900/50 text-blue-300' :
                    trade.confidence_level === 'MEDIUM' ? 'bg-slate-700 text-slate-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {trade.confidence_level} Confidence
                  </span>
                </div>
                <p className="text-slate-300 font-medium mb-1">{trade.institution_name}</p>
                <p className="text-sm text-slate-400">Filed: {new Date(trade.filing_date).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col items-end ml-4">
                <p className="text-2xl font-bold text-white">${(trade.total_value / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-400 mb-2">{trade.shares.toLocaleString()} shares @ ${trade.price}</p>

                <div className="flex flex-wrap gap-1 justify-end mt-2">
                  {trade.is_new_position && (
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">New Position</span>
                  )}
                  {trade.is_increased && (
                    <span className="px-2 py-1 bg-emerald-900/50 text-emerald-300 text-xs rounded">Increased</span>
                  )}
                  {trade.is_decreased && (
                    <span className="px-2 py-1 bg-rose-900/50 text-rose-300 text-xs rounded">Decreased</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningsView({ warnings }: { warnings: StrategyWarning[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-rose-400 mb-2">Retail Trap Alerts</h2>
        <p className="text-slate-300 text-sm">Common mistakes that cost retail traders millions. Learn what NOT to do.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {warnings.map((warning) => (
          <div key={warning.id} className={`bg-slate-800/50 border rounded-lg p-6 ${
            warning.severity === 'CRITICAL' ? 'border-rose-700' :
            warning.severity === 'HIGH' ? 'border-amber-700/50' :
            'border-slate-700'
          }`}>
            <div className="flex items-start space-x-4 mb-4">
              <AlertTriangle className={`w-8 h-8 flex-shrink-0 ${
                warning.severity === 'CRITICAL' ? 'text-rose-400' :
                warning.severity === 'HIGH' ? 'text-amber-400' :
                'text-slate-400'
              }`} />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{warning.strategy_name}</h3>
                  <span className={`px-3 py-1 rounded font-semibold text-sm ${
                    warning.severity === 'CRITICAL' ? 'bg-rose-900/50 border border-rose-700 text-rose-300' :
                    warning.severity === 'HIGH' ? 'bg-amber-900/50 border border-amber-700 text-amber-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {warning.severity}
                  </span>
                </div>
                <p className="text-slate-300 mb-4">{warning.description}</p>

                <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-4 mb-3">
                  <p className="text-xs font-semibold text-rose-400 mb-2">AVG MONEY LOST BY RETAIL TRADERS:</p>
                  <p className="text-2xl font-bold text-rose-400">${warning.money_lost_estimate.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-400 mb-2">WHY INSTITUTIONS WIN:</p>
                <p className="text-sm text-slate-300 leading-relaxed">{warning.why_institutions_win}</p>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-sm font-semibold text-emerald-400 mb-2">BETTER ALTERNATIVE:</p>
                <p className="text-sm text-slate-300 leading-relaxed">{warning.alternative_approach}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationView({ content }: { content: EducationalContent[] }) {
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-indigo-400 mb-2">Trading Education Center</h2>
        <p className="text-slate-300 text-sm">Learn the principles of profitable trading - understand WHY strategies work or fail</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedContent(item)}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-indigo-600/50 cursor-pointer transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span className={`px-2 py-1 rounded text-xs ${
                item.difficulty_level === 'BEGINNER' ? 'bg-emerald-900/50 text-emerald-300' :
                item.difficulty_level === 'INTERMEDIATE' ? 'bg-amber-900/50 text-amber-300' :
                'bg-rose-900/50 text-rose-300'
              }`}>
                {item.difficulty_level}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-slate-400 mb-3">{item.topic}</p>
            <span className="text-xs text-indigo-400 font-medium">{item.category.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>

      {selectedContent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedContent(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedContent.title}</h2>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-slate-400">{selectedContent.category.replace(/_/g, ' ')}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedContent.difficulty_level === 'BEGINNER' ? 'bg-emerald-900/50 text-emerald-300' :
                      selectedContent.difficulty_level === 'INTERMEDIATE' ? 'bg-amber-900/50 text-amber-300' :
                      'bg-rose-900/50 text-rose-300'
                    }`}>
                      {selectedContent.difficulty_level}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl font-bold ml-4"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedContent.content}</div>
              </div>

              {selectedContent.key_takeaways.length > 0 && (
                <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3">Key Takeaways</h3>
                  <ul className="space-y-2">
                    {selectedContent.key_takeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedContent.common_mistakes.length > 0 && (
                <div className="bg-rose-900/20 border border-rose-700/50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-rose-400 mb-3">Common Mistakes to Avoid</h3>
                  <ul className="space-y-2">
                    {selectedContent.common_mistakes.map((mistake, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start">
                        <span className="text-rose-400 mr-2">✗</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
