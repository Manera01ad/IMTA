import { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { motion } from 'framer-motion';
import { systemArchitecture, featureMap } from '../config/architecture';
import { FeatureNode } from '../types/system';
import { CheckCircle2, Clock, Circle, ArrowRight, AlertTriangle } from 'lucide-react';

type RoadmapTask = {
  id: string;
  title: string;
  category: 'ui' | 'backend' | 'deployment';
  status: 'completed' | 'in-progress' | 'pending' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  description: string;
  why: string;
  what: string;
  where: string;
  how: string;
  holdReason?: string;
  dependencies?: string[];
};

export default function DevMap() {
  const [selectedFeature, setSelectedFeature] = useState<FeatureNode | null>(null);
  const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'mindmap' | 'userflow' | 'schema' | 'roadmap'>('roadmap');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#60a5fa',
        lineColor: '#64748b',
        secondaryColor: '#8b5cf6',
        tertiaryColor: '#06b6d4',
      }
    });

    mermaid.contentLoaded();
  }, [activeTab]);

  const systemArchitectureDiagram = `
    graph TB
      subgraph Frontend["🎨 Frontend - Lovable/React"]
        React["React 18<br/>Component Library"]
        Router["React Router<br/>Navigation"]
        State["State Management<br/>Hooks + Context"]
        UI["UI Components<br/>Tailwind CSS"]
      end

      subgraph Backend["⚡ Backend - n8n Workflows"]
        Workflows["n8n Workflows<br/>Automation Engine"]
        Webhooks["Webhook Triggers<br/>HTTP Endpoints"]
        DataProcessing["Data Processing<br/>Transform & Route"]
      end

      subgraph Database["💾 Database - Supabase"]
        DB["PostgreSQL<br/>Data Storage"]
        Auth["Supabase Auth<br/>User Management"]
        Functions["Edge Functions<br/>Serverless API"]
        Realtime["Realtime<br/>Live Updates"]
        Storage["Storage<br/>File Management"]
      end

      subgraph External["🌐 External Services"]
        OpenAI["OpenAI API<br/>GPT-4"]
        MarketData["Market Data<br/>Price Feeds"]
        Analytics["Analytics<br/>Tracking"]
      end

      React -->|"User Interactions"| Router
      Router -->|"API Calls"| Functions
      Functions -->|"Query/Update"| DB

      React -->|"Webhooks"| Webhooks
      Webhooks -->|"Trigger"| Workflows
      Workflows -->|"Process"| DataProcessing
      DataProcessing -->|"Store"| DB

      Functions -->|"AI Requests"| OpenAI
      Functions -->|"Price Data"| MarketData
      Workflows -->|"External APIs"| External

      Auth -->|"Secure"| DB
      DB -->|"Real-time"| Realtime
      Realtime -->|"Push Updates"| React

      style Frontend fill:#1e3a8a
      style Backend fill:#581c87
      style Database fill:#064e3b
      style External fill:#7c2d12
  `;

  const userFlowDiagram = `
    graph LR
      Start([User Visits Site]) --> Landing[Landing Page]
      Landing --> Auth{Authenticated?}

      Auth -->|No| Login[Login/Signup]
      Login --> Dashboard

      Auth -->|Yes| Dashboard[Dashboard]
      Dashboard --> Menu{Select Action}

      Menu --> AIChat[AI Chat Assistant]
      Menu --> LiveFeed[Live Market Feed]
      Menu --> Patterns[Pattern Analysis]
      Menu --> Community[Community Insights]

      AIChat --> QuestionBuilder[Question Builder]
      QuestionBuilder --> SelectTemplate[Select Template]
      SelectTemplate --> CustomizeQ[Customize Question]
      CustomizeQ --> SendQuery[Send to AI]
      SendQuery --> AIResponse[AI Response]
      AIResponse --> ViewReasoning[View Reasoning]

      LiveFeed --> SelectMarket[Select Market]
      SelectMarket --> ViewPrices[View Live Prices]
      ViewPrices --> SetAlerts[Set Alerts]

      Patterns --> AnalyzeChart[Analyze Chart]
      AnalyzeChart --> DetectPattern[Pattern Detection]
      DetectPattern --> GetSignal[Trading Signal]

      Community --> ViewInsights[View Community Sentiment]
      ViewInsights --> DiscussionBoard[Join Discussion]

      ViewReasoning --> SaveConversation[Save Conversation]
      GetSignal --> SaveStrategy[Save Strategy]
      DiscussionBoard --> ShareInsight[Share Insight]

      SaveConversation --> End([Continue Research])
      SaveStrategy --> End
      ShareInsight --> End

      style Start fill:#10b981
      style End fill:#3b82f6
      style Dashboard fill:#8b5cf6
      style AIChat fill:#f59e0b
      style LiveFeed fill:#ef4444
      style Patterns fill:#06b6d4
      style Community fill:#ec4899
  `;

  const roadmapTasks: RoadmapTask[] = [
    {
      id: 'dynamic-chat',
      title: 'Dynamic Chat Interface',
      category: 'ui',
      status: 'completed',
      priority: 'high',
      description: 'Multiline text composer with keyboard shortcuts (Cmd/Ctrl+Enter to send)',
      why: 'Essential for user interaction with AI agents. Keyboard-first design improves user experience and efficiency.',
      what: 'A chat interface with composer, message history, and keyboard shortcuts',
      where: 'src/components/AIChat.tsx',
      how: 'Built using React with textarea, keyboard event handlers, and message state management',
      dependencies: []
    },
    {
      id: 'streaming-renderer',
      title: 'Real-Time Streaming Renderer',
      category: 'ui',
      status: 'completed',
      priority: 'high',
      description: 'Token-by-token output with thinking states',
      why: 'Shows AI reasoning process and provides real-time feedback, improving transparency and trust',
      what: 'Streaming component that displays partial responses as they arrive',
      where: 'src/components/AIChat.tsx (message streaming logic)',
      how: 'Using Server-Sent Events (SSE) to receive chunks from Edge Function and progressively render',
      dependencies: ['dynamic-chat']
    },
    {
      id: 'agent-status-panel',
      title: 'Agent Status Panel',
      category: 'ui',
      status: 'in-progress',
      priority: 'high',
      description: 'Overview panel showing agent state (Idle, Running, Paused) with controls',
      why: 'Users need visibility into agent state and ability to control execution flow',
      what: 'Status indicator panel with play/pause/stop controls and state visualization',
      where: 'src/components/AgentStatusPanel.tsx (to be created)',
      how: 'Create new component with state machine pattern, connected to agent execution context',
      dependencies: ['dynamic-chat']
    },
    {
      id: 'hitl-triggers',
      title: 'Human-in-the-Loop (HITL) Triggers',
      category: 'ui',
      status: 'pending',
      priority: 'high',
      description: 'Pending Actions section for missions requiring human oversight',
      why: 'Critical for safety and control - some decisions require human approval before execution',
      what: 'UI panel showing pending actions with approve/reject/modify controls',
      where: 'src/components/HITLPanel.tsx (to be created)',
      how: 'Build approval workflow UI with action queue, notification system, and database integration',
      dependencies: ['agent-status-panel', 'data-model']
    },
    {
      id: 'data-model',
      title: 'Minimal Data Model',
      category: 'backend',
      status: 'completed',
      priority: 'high',
      description: 'Schema for messages tracking status, role, and content',
      why: 'Foundation for all data operations - must be robust and scalable',
      what: 'Database tables: chat_messages, chat_conversations, ai_assistants with proper relationships',
      where: 'supabase/migrations/*.sql',
      how: 'PostgreSQL tables with RLS policies, foreign key constraints, and indexes',
      dependencies: []
    },
    {
      id: 'n8n-webhook',
      title: 'n8n Webhook Integration Layer',
      category: 'backend',
      status: 'pending',
      priority: 'high',
      description: 'Modular API route as middleman to n8n workflows',
      why: 'Enables agentic workflows and automation without tightly coupling frontend to n8n',
      what: 'Edge Function that accepts user input, forwards to n8n, handles async responses',
      where: 'supabase/functions/n8n-webhook/index.ts (to be created)',
      how: 'Create Supabase Edge Function with webhook endpoint, request forwarding, and response handling',
      dependencies: ['data-model']
    },
    {
      id: 'context-management',
      title: 'Context Management System',
      category: 'backend',
      status: 'completed',
      priority: 'high',
      description: 'State management for user context and session history',
      why: 'AI needs conversation context to provide relevant responses',
      what: 'Session state management with conversation history and user preferences',
      where: 'src/lib/supabase.ts and database tables',
      how: 'Using Supabase real-time subscriptions and React Context API for state',
      dependencies: ['data-model']
    },
    {
      id: 'sse-streaming',
      title: 'Server-Sent Events (SSE) Support',
      category: 'deployment',
      status: 'completed',
      priority: 'high',
      description: 'Backend configured for SSE to stream text chunks',
      why: 'Essential for real-time AI response streaming and better UX',
      what: 'SSE endpoint that forwards AI-generated tokens progressively',
      where: 'supabase/functions/ai-chat/index.ts',
      how: 'Implemented using Deno Response with readable streams',
      dependencies: ['streaming-renderer']
    },
    {
      id: 'error-guardrails',
      title: 'Error & Guardrail UX',
      category: 'deployment',
      status: 'in-progress',
      priority: 'high',
      description: 'Safe failure modes that preserve state and escalate issues',
      why: 'Prevents data loss and provides recovery path when AI fails',
      what: 'Error boundaries, retry logic, and human escalation workflow',
      where: 'src/components/* (error boundaries) and Edge Functions',
      how: 'React error boundaries, try-catch with state preservation, fallback UI',
      dependencies: ['hitl-triggers']
    },
    {
      id: 'deployment-scripts',
      title: 'Deployment Scripting',
      category: 'deployment',
      status: 'on-hold',
      priority: 'medium',
      description: 'Instructions for deploying to scalable environment',
      why: 'Ensures consistent, repeatable deployments to production',
      what: 'Deployment scripts and CI/CD configuration',
      where: 'Root directory - deploy.sh, .github/workflows',
      how: 'Create shell scripts and GitHub Actions for automated deployment',
      holdReason: 'Waiting for n8n integration completion before finalizing deployment pipeline',
      dependencies: ['n8n-webhook', 'sse-streaming']
    },
    {
      id: 'question-builder',
      title: 'Question Builder Templates',
      category: 'ui',
      status: 'completed',
      priority: 'medium',
      description: 'Pre-built expert question templates for different scenarios',
      why: 'Helps users ask better questions and get more relevant AI responses',
      what: 'Template library with categories and one-click insertion',
      where: 'src/components/QuestionBuilder.tsx',
      how: 'Built with React, categorized templates, dynamic insertion into chat',
      dependencies: ['dynamic-chat']
    },
    {
      id: 'real-time-data',
      title: 'Real-Time Market Data Integration',
      category: 'backend',
      status: 'completed',
      priority: 'medium',
      description: 'Live price feeds and updates',
      why: 'Provides current market data for informed decision-making',
      what: 'Edge Function that fetches and caches live market prices',
      where: 'supabase/functions/fetch-live-prices/index.ts',
      how: 'Scheduled function with external API integration and database updates',
      dependencies: ['data-model']
    },
    {
      id: 'lovable-migration',
      title: 'Migration to Lovable Platform',
      category: 'deployment',
      status: 'on-hold',
      priority: 'low',
      description: 'Transfer codebase to Lovable for advanced design features',
      why: 'Lovable provides enhanced design tools and collaboration features',
      what: 'Complete project migration with all components, styles, and logic',
      where: 'Entire project structure',
      how: 'Export current build, import to Lovable, verify functionality, update environment',
      holdReason: 'Current platform (Bolt) provides sufficient functionality. Will migrate when advanced design features are required',
      dependencies: ['deployment-scripts']
    }
  ];

  const dataSchemaDigram = `
    erDiagram
      USERS ||--o{ CHAT_CONVERSATIONS : creates
      USERS ||--o{ COMMUNITY_POSTS : writes
      USERS ||--o{ PRICE_ALERTS : sets
      USERS {
        uuid id PK
        string email
        string full_name
        timestamp created_at
        jsonb preferences
      }

      AI_ASSISTANTS ||--o{ CHAT_CONVERSATIONS : handles
      AI_ASSISTANTS {
        uuid id PK
        string name
        string avatar_emoji
        string specialization
        boolean is_active
      }

      CHAT_CONVERSATIONS ||--o{ CHAT_MESSAGES : contains
      CHAT_CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        uuid assistant_id FK
        string title
        timestamp created_at
      }

      CHAT_MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid model_id FK
        enum role
        text message
        text reasoning
        timestamp created_at
      }

      AI_MODELS ||--o{ CHAT_MESSAGES : generates
      AI_MODELS {
        uuid id PK
        string name
        string provider
        text description
      }

      LIVE_PRICES {
        uuid id PK
        string symbol
        decimal price
        decimal change_24h
        bigint volume
        timestamp updated_at
      }

      COMMUNITY_INSIGHTS {
        uuid id PK
        string platform
        string symbol
        integer mention_count
        decimal sentiment_score
        timestamp analyzed_at
      }

      COMMUNITY_POSTS {
        uuid id PK
        uuid user_id FK
        string symbol
        text content
        integer likes
        timestamp created_at
      }

      PATTERN_INSIGHTS {
        uuid id PK
        string symbol
        string pattern_type
        decimal confidence_score
        jsonb technical_indicators
        timestamp detected_at
      }

      PRICE_ALERTS {
        uuid id PK
        uuid user_id FK
        string symbol
        decimal target_price
        enum alert_type
        boolean is_triggered
      }

      TRADING_STRATEGIES {
        uuid id PK
        string name
        text description
        boolean is_recommended
        decimal success_rate
        text reasoning
      }
  `;

  const getStatusIcon = (status: FeatureNode['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'planned':
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: FeatureNode['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-950/30';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-950/30';
      case 'planned':
        return 'border-slate-500 bg-slate-950/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white mb-2">System Architecture & Development Map</h1>
          <p className="text-slate-400 text-sm">Interactive visualization of the platform architecture and feature roadmap</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'roadmap'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Implementation Roadmap
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab('userflow')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'userflow'
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            User Flow
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'schema'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Data Schema
          </button>
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'mindmap'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Feature Mind Map
          </button>
        </div>

        {activeTab === 'roadmap' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4">Implementation Roadmap</h2>
                <p className="text-slate-400 mb-6">
                  Complete development plan tracking Core UI Components, Backend & Data Foundation, and Deployment & Production Readiness.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-950/30 border border-green-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {roadmapTasks.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm text-slate-400">Completed</div>
                  </div>
                  <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">
                      {roadmapTasks.filter(t => t.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-slate-400">In Progress</div>
                  </div>
                  <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">
                      {roadmapTasks.filter(t => t.status === 'pending').length}
                    </div>
                    <div className="text-sm text-slate-400">Pending</div>
                  </div>
                  <div className="bg-orange-950/30 border border-orange-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">
                      {roadmapTasks.filter(t => t.status === 'on-hold').length}
                    </div>
                    <div className="text-sm text-slate-400">On Hold</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-white mb-3">✅ Completed Tasks</h3>
                  {roadmapTasks.filter(t => t.status === 'completed').map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] bg-green-950/20 border-green-700/50 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <h4 className="font-bold text-white">{task.title}</h4>
                          </div>
                          <p className="text-sm text-slate-400 ml-8">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.category === 'ui' ? 'bg-blue-900/50 text-blue-300' :
                          task.category === 'backend' ? 'bg-purple-900/50 text-purple-300' :
                          'bg-orange-900/50 text-orange-300'
                        }`}>
                          {task.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-8 text-xs text-slate-500">
                        📍 {task.where}
                      </div>
                    </motion.button>
                  ))}

                  <h3 className="font-bold text-white mb-3 mt-6">🔄 In Progress</h3>
                  {roadmapTasks.filter(t => t.status === 'in-progress').map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] bg-blue-950/20 border-blue-700/50 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                            <h4 className="font-bold text-white">{task.title}</h4>
                          </div>
                          <p className="text-sm text-slate-400 ml-8">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.category === 'ui' ? 'bg-blue-900/50 text-blue-300' :
                          task.category === 'backend' ? 'bg-purple-900/50 text-purple-300' :
                          'bg-orange-900/50 text-orange-300'
                        }`}>
                          {task.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-8 text-xs text-slate-500">
                        📍 {task.where}
                      </div>
                    </motion.button>
                  ))}

                  <h3 className="font-bold text-white mb-3 mt-6">⏳ Pending / To Do</h3>
                  {roadmapTasks.filter(t => t.status === 'pending').map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] bg-yellow-950/20 border-yellow-700/50 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-yellow-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <Circle className="w-5 h-5 text-yellow-400" />
                            <h4 className="font-bold text-white">{task.title}</h4>
                            {task.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded font-bold">
                                HIGH PRIORITY
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 ml-8">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.category === 'ui' ? 'bg-blue-900/50 text-blue-300' :
                          task.category === 'backend' ? 'bg-purple-900/50 text-purple-300' :
                          'bg-orange-900/50 text-orange-300'
                        }`}>
                          {task.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-8 text-xs text-slate-500">
                        📍 {task.where}
                      </div>
                    </motion.button>
                  ))}

                  <h3 className="font-bold text-white mb-3 mt-6">⏸️ On Hold</h3>
                  {roadmapTasks.filter(t => t.status === 'on-hold').map((task) => (
                    <motion.button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:scale-[1.02] bg-orange-950/20 border-orange-700/50 ${
                        selectedTask?.id === task.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                            <h4 className="font-bold text-white">{task.title}</h4>
                          </div>
                          <p className="text-sm text-slate-400 ml-8">{task.description}</p>
                          {task.holdReason && (
                            <div className="ml-8 mt-2 p-2 bg-orange-900/20 border border-orange-700/30 rounded text-xs text-orange-300">
                              <strong>Hold Reason:</strong> {task.holdReason}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          task.category === 'ui' ? 'bg-blue-900/50 text-blue-300' :
                          task.category === 'backend' ? 'bg-purple-900/50 text-purple-300' :
                          'bg-orange-900/50 text-orange-300'
                        }`}>
                          {task.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-8 text-xs text-slate-500">
                        📍 {task.where}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {selectedTask ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 rounded-lg border border-slate-700 p-6 sticky top-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    {selectedTask.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                    {selectedTask.status === 'in-progress' && <Clock className="w-6 h-6 text-blue-400" />}
                    {selectedTask.status === 'pending' && <Circle className="w-6 h-6 text-yellow-400" />}
                    {selectedTask.status === 'on-hold' && <AlertTriangle className="w-6 h-6 text-orange-400" />}
                    <h3 className="text-lg font-bold text-white">{selectedTask.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase font-semibold">Status</label>
                      <p className={`text-white capitalize font-semibold ${
                        selectedTask.status === 'completed' ? 'text-green-400' :
                        selectedTask.status === 'in-progress' ? 'text-blue-400' :
                        selectedTask.status === 'pending' ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {selectedTask.status.replace('-', ' ')}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 uppercase font-semibold">Category</label>
                      <p className="text-white capitalize">{selectedTask.category === 'ui' ? 'Core UI Components' : selectedTask.category === 'backend' ? 'Backend & Data' : 'Deployment'}</p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 uppercase font-semibold">Priority</label>
                      <p className={`capitalize font-semibold ${
                        selectedTask.priority === 'high' ? 'text-red-400' :
                        selectedTask.priority === 'medium' ? 'text-yellow-400' :
                        'text-slate-400'
                      }`}>
                        {selectedTask.priority}
                      </p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <label className="text-xs text-emerald-400 uppercase font-semibold mb-2 block">💡 Why</label>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedTask.why}</p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <label className="text-xs text-blue-400 uppercase font-semibold mb-2 block">📋 What</label>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedTask.what}</p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <label className="text-xs text-purple-400 uppercase font-semibold mb-2 block">📍 Where</label>
                      <p className="text-sm text-slate-300 leading-relaxed font-mono bg-slate-950 p-2 rounded">
                        {selectedTask.where}
                      </p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <label className="text-xs text-orange-400 uppercase font-semibold mb-2 block">🔧 How</label>
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedTask.how}</p>
                    </div>

                    {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
                      <div className="border-t border-slate-700 pt-4">
                        <label className="text-xs text-slate-400 uppercase font-semibold mb-2 block">Dependencies</label>
                        <ul className="space-y-1">
                          {selectedTask.dependencies.map((depId) => {
                            const dep = roadmapTasks.find(t => t.id === depId);
                            return dep ? (
                              <li key={depId} className="text-sm text-slate-300 flex items-center space-x-2">
                                {dep.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                {dep.status === 'in-progress' && <Clock className="w-4 h-4 text-blue-400" />}
                                {dep.status === 'pending' && <Circle className="w-4 h-4 text-yellow-400" />}
                                <span>{dep.title}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 sticky top-6">
                  <p className="text-slate-400 text-center text-sm">
                    Click on a task to see detailed implementation information including why, what, where, and how.
                  </p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300">In Progress</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Circle className="w-5 h-5 text-yellow-400" />
                      <span className="text-slate-300">Pending</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertTriangle className="w-5 h-5 text-orange-400" />
                      <span className="text-slate-300">On Hold</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'architecture' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-lg border border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold mb-4">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-3">Frontend</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• {systemArchitecture.frontend.framework}</li>
                  <li>• {systemArchitecture.frontend.routing}</li>
                  <li>• {systemArchitecture.frontend.stateManagement}</li>
                  <li>• {systemArchitecture.frontend.uiLibrary}</li>
                  <li>• {systemArchitecture.frontend.styling}</li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/30">
                <h3 className="font-bold text-purple-400 mb-3">Backend</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• {systemArchitecture.backend.database}</li>
                  <li>• {systemArchitecture.backend.authentication}</li>
                  <li>• {systemArchitecture.backend.functions}</li>
                  <li>• {systemArchitecture.backend.realtime}</li>
                </ul>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-400 mb-3">APIs</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Internal</p>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {systemArchitecture.apis.internal.map((api, idx) => (
                        <li key={idx} className="text-xs">• {api}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">External</p>
                    <ul className="space-y-1 text-sm text-slate-300">
                      {systemArchitecture.apis.external.map((api, idx) => (
                        <li key={idx} className="text-xs">• {api}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4">System Architecture Diagram</h3>
              <p className="text-sm text-slate-400 mb-4">
                Complete system showing Frontend (Lovable/React), Backend (n8n), and Database (Supabase) connections
              </p>
              <div className="mermaid" key={`arch-${activeTab}`}>
                {systemArchitectureDiagram}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'userflow' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-lg border border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold mb-4">User Journey Flow</h2>
            <p className="text-slate-400 mb-6">
              Interactive mind map showing the complete user journey from landing page through various features to achieving their goals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-950/30 border border-green-700/50 rounded-lg p-4">
                <h3 className="font-bold text-green-400 mb-2">Entry Points</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Landing Page</li>
                  <li>• Authentication</li>
                  <li>• Dashboard</li>
                </ul>
              </div>

              <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">Core Actions</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• AI Chat Queries</li>
                  <li>• Market Analysis</li>
                  <li>• Pattern Detection</li>
                </ul>
              </div>

              <div className="bg-purple-950/30 border border-purple-700/50 rounded-lg p-4">
                <h3 className="font-bold text-purple-400 mb-2">Interactions</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Template Selection</li>
                  <li>• Data Visualization</li>
                  <li>• Community Sharing</li>
                </ul>
              </div>

              <div className="bg-orange-950/30 border border-orange-700/50 rounded-lg p-4">
                <h3 className="font-bold text-orange-400 mb-2">Outcomes</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Save Research</li>
                  <li>• Get Signals</li>
                  <li>• Share Insights</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-950 rounded-lg p-6 border border-slate-700 overflow-x-auto">
              <h3 className="text-lg font-bold mb-4">Complete User Flow Diagram</h3>
              <div className="mermaid" key={`flow-${activeTab}`}>
                {userFlowDiagram}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'schema' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-lg border border-slate-700 p-6"
          >
            <h2 className="text-xl font-bold mb-4">Database Schema</h2>
            <p className="text-slate-400 mb-6">
              Complete entity-relationship diagram showing all database tables, their fields, and relationships in Supabase PostgreSQL.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">Core Tables</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• users</li>
                  <li>• ai_assistants</li>
                  <li>• ai_models</li>
                  <li>• chat_conversations</li>
                  <li>• chat_messages</li>
                </ul>
              </div>

              <div className="bg-purple-950/30 border border-purple-700/50 rounded-lg p-4">
                <h3 className="font-bold text-purple-400 mb-2">Market Data</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• live_prices</li>
                  <li>• pattern_insights</li>
                  <li>• trading_strategies</li>
                  <li>• price_alerts</li>
                </ul>
              </div>

              <div className="bg-green-950/30 border border-green-700/50 rounded-lg p-4">
                <h3 className="font-bold text-green-400 mb-2">Community</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• community_insights</li>
                  <li>• community_posts</li>
                  <li>• user interactions</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-amber-400 mb-2">Security Notes</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• All tables have Row Level Security (RLS) enabled</li>
                <li>• User-specific data requires authentication</li>
                <li>• Foreign key constraints ensure data integrity</li>
                <li>• Timestamps track creation and updates</li>
              </ul>
            </div>

            <div className="bg-slate-950 rounded-lg p-6 border border-slate-700 overflow-x-auto">
              <h3 className="text-lg font-bold mb-4">Entity Relationship Diagram</h3>
              <div className="mermaid" key={`schema-${activeTab}`}>
                {dataSchemaDigram}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mindmap' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4">Feature Roadmap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureMap.map((feature, index) => (
                    <motion.button
                      key={feature.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedFeature(feature)}
                      className={`text-left p-4 rounded-lg border-2 transition-all hover:scale-105 ${getStatusColor(
                        feature.status
                      )} ${selectedFeature?.id === feature.id ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(feature.status)}
                          <h3 className="font-bold text-white">{feature.title}</h3>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{feature.description}</p>
                      <div className="mt-3 flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">
                          {feature.module}
                        </span>
                        <span className="text-xs text-slate-500">
                          {feature.status}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              {selectedFeature ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900 rounded-lg border border-slate-700 p-6 sticky top-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    {getStatusIcon(selectedFeature.status)}
                    <h3 className="text-lg font-bold">{selectedFeature.title}</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase">Status</label>
                      <p className="text-white capitalize">{selectedFeature.status}</p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 uppercase">Module</label>
                      <p className="text-white">{selectedFeature.module}</p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 uppercase">Description</label>
                      <p className="text-slate-300 text-sm">{selectedFeature.description}</p>
                    </div>

                    {selectedFeature.dependencies.length > 0 && (
                      <div>
                        <label className="text-xs text-slate-400 uppercase">Dependencies</label>
                        <ul className="mt-2 space-y-1">
                          {selectedFeature.dependencies.map((dep) => {
                            const depFeature = featureMap.find((f) => f.id === dep);
                            return (
                              <li
                                key={dep}
                                className="text-sm text-slate-300 flex items-center space-x-2"
                              >
                                {depFeature && getStatusIcon(depFeature.status)}
                                <span>{depFeature?.title || dep}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 sticky top-6">
                  <p className="text-slate-400 text-center">
                    Click on a feature node to see details
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
