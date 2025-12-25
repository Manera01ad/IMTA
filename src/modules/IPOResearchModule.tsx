import { Rocket, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function IPOResearchModule() {
  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Rocket className="w-12 h-12 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">IPO Research Hub</h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive IPO analysis, tracking, and community insights for upcoming and recent public offerings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Upcoming IPOs</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Track upcoming initial public offerings with detailed company profiles and filing information
            </p>
            <div className="bg-slate-800 rounded p-3 border border-purple-500/30">
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-purple-400 font-semibold">Planned</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-bold text-white">Valuation Analysis</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              AI-powered IPO valuation analysis comparing metrics with industry benchmarks
            </p>
            <div className="bg-slate-800 rounded p-3 border border-green-500/30">
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-green-400 font-semibold">Planned</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Performance Tracking</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Monitor post-IPO performance with real-time price tracking and sentiment analysis
            </p>
            <div className="bg-slate-800 rounded p-3 border border-blue-500/30">
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-blue-400 font-semibold">Planned</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">💬</span>
              <h3 className="text-lg font-bold text-white">Community Sentiment</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Aggregate community discussions and sentiment around IPO opportunities
            </p>
            <div className="bg-slate-800 rounded p-3 border border-orange-500/30">
              <p className="text-xs text-slate-400">Status</p>
              <p className="text-orange-400 font-semibold">Planned</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-blue-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            IPO Research Hub will integrate community insights with professional analysis tools to help you
            make informed decisions about new market opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
