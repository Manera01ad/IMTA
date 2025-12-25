import { NavigationSection } from '../types/system';

export const navigationConfig: NavigationSection[] = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant Hub',
    icon: '🤖',
    path: '/ai-assistant',
    module: 'ai-assistant-hub',
    subSections: [
      { id: 'chat', name: 'Chat Interface', path: '/ai-assistant/chat' },
      { id: 'assistants', name: 'Manage Assistants', path: '/ai-assistant/manage' },
      { id: 'history', name: 'Conversation History', path: '/ai-assistant/history' },
    ],
  },
  {
    id: 'community',
    name: 'Community Center',
    icon: '👥',
    path: '/community',
    module: 'community-center',
    subSections: [
      { id: 'insights', name: 'Community Insights', path: '/community/insights' },
      { id: 'discussions', name: 'Discussions', path: '/community/discussions' },
      { id: 'trending', name: 'Trending Topics', path: '/community/trending' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Research Insights',
    icon: '📚',
    path: '/learning',
    module: 'learning-research',
    subSections: [
      { id: 'library', name: 'Knowledge Library', path: '/learning/library' },
      { id: 'courses', name: 'Learning Paths', path: '/learning/courses' },
      { id: 'research', name: 'Research Papers', path: '/learning/research' },
      { id: 'insights', name: 'Market Insights', path: '/learning/insights' },
    ],
  },
];

export const horizontalNavigationConfig: NavigationSection[] = [
  {
    id: 'live-feed',
    name: 'LIVE Feed',
    icon: '📡',
    path: '/live-feed',
    module: 'live-feed',
  },
  {
    id: 'pattern-identifier',
    name: 'Pattern Identifier',
    icon: '📊',
    path: '/pattern-identifier',
    module: 'pattern-identifier',
  },
  {
    id: 'community-insights',
    name: 'Community Insights',
    icon: '💬',
    path: '/community-insights',
    module: 'community-center',
  },
  {
    id: 'strategy-intelligence',
    name: 'Strategy Intelligence',
    icon: '🎯',
    path: '/strategy-intelligence',
    module: 'strategy-intelligence',
  },
  {
    id: 'ipo-research',
    name: 'IPO Research',
    icon: '📈',
    path: '/ipo-research',
    module: 'ipo-research',
  },
];
