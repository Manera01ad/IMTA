import { SystemArchitecture, FeatureNode } from '../types/system';

export const systemArchitecture: SystemArchitecture = {
  frontend: {
    framework: 'React 18',
    routing: 'React Router',
    stateManagement: 'React Hooks + Context',
    uiLibrary: 'Lucide React Icons',
    styling: 'Tailwind CSS',
  },
  backend: {
    database: 'Supabase PostgreSQL',
    authentication: 'Supabase Auth',
    functions: 'Supabase Edge Functions',
    realtime: 'Supabase Realtime',
  },
  apis: {
    internal: [
      '/functions/v1/ai-chat',
      '/functions/v1/fetch-live-prices',
    ],
    external: [
      'OpenAI GPT-4',
      'Financial Data APIs',
      'Market Data Providers',
    ],
  },
};

export const featureMap: FeatureNode[] = [
  {
    id: 'ai-chat',
    title: 'AI Chat System',
    description: 'Multi-assistant chat interface with reasoning and knowledge base',
    status: 'completed',
    dependencies: [],
    module: 'ai-assistant-hub',
  },
  {
    id: 'question-builder',
    title: 'Question Builder',
    description: 'Expert question templates for different research scenarios',
    status: 'completed',
    dependencies: ['ai-chat'],
    module: 'ai-assistant-hub',
  },
  {
    id: 'community-insights',
    title: 'Community Insights',
    description: 'Aggregated community sentiment and trending discussions',
    status: 'completed',
    dependencies: [],
    module: 'community-center',
  },
  {
    id: 'live-feed',
    title: 'Live Market Feed',
    description: 'Real-time cryptocurrency and stock price updates',
    status: 'completed',
    dependencies: [],
    module: 'live-feed',
  },
  {
    id: 'pattern-identifier',
    title: 'Pattern Recognition',
    description: 'ML-based pattern identification for trading signals',
    status: 'completed',
    dependencies: ['live-feed'],
    module: 'pattern-identifier',
  },
  {
    id: 'strategy-intelligence',
    title: 'Strategy Intelligence',
    description: 'AI-powered trading strategy recommendations',
    status: 'planned',
    dependencies: ['ai-chat', 'pattern-identifier'],
    module: 'strategy-intelligence',
  },
  {
    id: 'ipo-research',
    title: 'IPO Research Hub',
    description: 'Comprehensive IPO analysis and tracking',
    status: 'planned',
    dependencies: ['community-insights'],
    module: 'ipo-research',
  },
  {
    id: 'learning-paths',
    title: 'Learning Paths',
    description: 'Structured learning courses for trading and investment',
    status: 'planned',
    dependencies: [],
    module: 'learning-research',
  },
];
