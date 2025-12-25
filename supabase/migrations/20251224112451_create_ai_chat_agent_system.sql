/*
  # AI Chat Agent System with Multi-Model Support

  1. New Tables
    - `ai_models`
      - `id` (uuid, primary key)
      - `name` (text) - Model name like "GPT-4", "Claude Sonnet"
      - `provider` (text) - Provider like "OpenAI", "Anthropic"
      - `model_id` (text) - API model identifier
      - `description` (text) - What this model is good at
      - `supports_reasoning` (boolean) - Whether it can provide detailed reasoning
      - `context_window` (integer) - Token limit
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `ai_assistants`
      - `id` (uuid, primary key)
      - `name` (text) - Assistant name like "Research Expert", "Data Analyst"
      - `description` (text) - What this assistant specializes in
      - `system_prompt` (text) - Base instructions for the assistant
      - `avatar_emoji` (text) - Emoji icon for the assistant
      - `specialization` (text) - Domain expertise
      - `default_model_id` (uuid, foreign key) - Default AI model to use
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `knowledge_sources`
      - `id` (uuid, primary key)
      - `assistant_id` (uuid, foreign key)
      - `title` (text) - Knowledge document title
      - `content` (text) - The actual knowledge/information
      - `source_type` (text) - "DOCUMENT", "URL", "TEXT"
      - `source_url` (text, nullable)
      - `tags` (text[]) - Categorization tags
      - `embedding` (vector, nullable) - For semantic search (future enhancement)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `assistant_id` (uuid, foreign key)
      - `title` (text) - Conversation title
      - `model_id` (uuid, foreign key) - Which model is being used
      - `total_messages` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text) - "USER" or "ASSISTANT"
      - `content` (text) - Message content
      - `reasoning` (text, nullable) - AI's reasoning process
      - `knowledge_used` (text[], nullable) - Which knowledge sources were referenced
      - `model_used` (text) - Model identifier that generated this response
      - `tokens_used` (integer, nullable)
      - `created_at` (timestamptz)
    
    - `question_templates`
      - `id` (uuid, primary key)
      - `category` (text) - "RESEARCH", "ANALYSIS", "COMPARISON", etc.
      - `title` (text) - Template name
      - `template` (text) - Question template with placeholders
      - `placeholders` (jsonb) - Placeholder definitions
      - `example` (text) - Example of filled template
      - `assistant_id` (uuid, foreign key, nullable) - Recommended assistant
      - `is_active` (boolean)
      - `usage_count` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for reference data (models, assistants, templates)
    - Authenticated users can create and manage their own conversations
*/

-- AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  model_id text NOT NULL UNIQUE,
  description text NOT NULL,
  supports_reasoning boolean DEFAULT true,
  context_window integer DEFAULT 4096,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI models are viewable by everyone"
  ON ai_models FOR SELECT
  TO public
  USING (is_active = true);

-- AI Assistants table
CREATE TABLE IF NOT EXISTS ai_assistants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  system_prompt text NOT NULL,
  avatar_emoji text DEFAULT '🤖',
  specialization text NOT NULL,
  default_model_id uuid REFERENCES ai_models(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_assistants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI assistants are viewable by everyone"
  ON ai_assistants FOR SELECT
  TO public
  USING (is_active = true);

-- Knowledge Sources table
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid REFERENCES ai_assistants(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('DOCUMENT', 'URL', 'TEXT')),
  source_url text,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge sources are viewable by everyone"
  ON knowledge_sources FOR SELECT
  TO public
  USING (is_active = true);

-- Chat Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid REFERENCES ai_assistants(id) ON DELETE CASCADE,
  title text NOT NULL,
  model_id uuid REFERENCES ai_models(id),
  total_messages integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all conversations"
  ON chat_conversations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create conversations"
  ON chat_conversations FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update conversations"
  ON chat_conversations FOR UPDATE
  TO public
  USING (true);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
  content text NOT NULL,
  reasoning text,
  knowledge_used text[] DEFAULT '{}',
  model_used text,
  tokens_used integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in conversations"
  ON chat_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Question Templates table
CREATE TABLE IF NOT EXISTS question_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  template text NOT NULL,
  placeholders jsonb DEFAULT '[]'::jsonb,
  example text NOT NULL,
  assistant_id uuid REFERENCES ai_assistants(id),
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Question templates are viewable by everyone"
  ON question_templates FOR SELECT
  TO public
  USING (is_active = true);

-- Insert sample AI models
INSERT INTO ai_models (name, provider, model_id, description, supports_reasoning, context_window) VALUES
  ('GPT-4o', 'OpenAI', 'gpt-4o', 'Most capable OpenAI model with vision and advanced reasoning', true, 128000),
  ('GPT-4 Turbo', 'OpenAI', 'gpt-4-turbo-preview', 'Fast and capable model for complex tasks', true, 128000),
  ('Claude 3.5 Sonnet', 'Anthropic', 'claude-3-5-sonnet-20241022', 'Best balance of intelligence and speed with excellent reasoning', true, 200000),
  ('Claude 3 Opus', 'Anthropic', 'claude-3-opus-20240229', 'Most intelligent Claude model for complex tasks', true, 200000),
  ('Gemini Pro', 'Google', 'gemini-pro', 'Google''s advanced multimodal model', true, 32000)
ON CONFLICT (model_id) DO NOTHING;

-- Insert sample AI assistants
INSERT INTO ai_assistants (name, description, system_prompt, avatar_emoji, specialization, default_model_id) VALUES
  (
    'Research Expert',
    'Specialized in deep research, data analysis, and providing comprehensive insights with detailed reasoning',
    'You are a research expert AI assistant. Your role is to conduct thorough research, analyze information critically, and provide detailed insights. Always explain your reasoning process step-by-step. Use the knowledge base provided to give accurate, well-sourced answers. When uncertain, clearly state assumptions and provide multiple perspectives.',
    '🔬',
    'Research & Analysis',
    (SELECT id FROM ai_models WHERE model_id = 'claude-3-5-sonnet-20241022' LIMIT 1)
  ),
  (
    'Financial Analyst',
    'Expert in market analysis, trading strategies, and financial decision-making with institutional insights',
    'You are a financial analyst AI assistant specializing in market analysis and trading. Provide detailed reasoning for every recommendation. Explain both bullish and bearish scenarios. Always consider risk management and institutional perspectives. Use technical and fundamental analysis from your knowledge base.',
    '💼',
    'Finance & Trading',
    (SELECT id FROM ai_models WHERE model_id = 'gpt-4o' LIMIT 1)
  ),
  (
    'Data Scientist',
    'Specialized in statistical analysis, pattern recognition, and data-driven decision making',
    'You are a data scientist AI assistant. Approach problems analytically using statistical methods. Explain your reasoning with data-driven insights. Identify patterns, correlations, and anomalies. Provide visualizable insights and actionable recommendations based on data analysis principles.',
    '📊',
    'Data Science & Statistics',
    (SELECT id FROM ai_models WHERE model_id = 'gpt-4-turbo-preview' LIMIT 1)
  ),
  (
    'Business Strategist',
    'Expert in business strategy, competitive analysis, and strategic decision-making',
    'You are a business strategy AI assistant. Analyze situations from multiple business perspectives including competitive advantage, market positioning, and operational efficiency. Provide strategic recommendations with clear reasoning. Consider short-term and long-term implications.',
    '🎯',
    'Business Strategy',
    (SELECT id FROM ai_models WHERE model_id = 'claude-3-opus-20240229' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- Insert sample knowledge for Financial Analyst
INSERT INTO knowledge_sources (assistant_id, title, content, source_type, tags) VALUES
  (
    (SELECT id FROM ai_assistants WHERE name = 'Financial Analyst' LIMIT 1),
    'Institutional Trading Patterns',
    'Institutional traders typically accumulate positions slowly to avoid price impact. They use dark pools and algorithmic trading. Key signs include: 1) Volume spikes without significant price movement 2) End-of-day price manipulation 3) Large block trades. Retail traders often react emotionally to news and create short-term volatility.',
    'TEXT',
    ARRAY['trading', 'institutions', 'patterns']
  ),
  (
    (SELECT id FROM ai_assistants WHERE name = 'Financial Analyst' LIMIT 1),
    'Risk Management Principles',
    'Professional risk management requires: 1) Position sizing: Never risk more than 2% per trade 2) Stop-loss placement: Based on technical levels, not arbitrary percentages 3) Risk-reward ratio: Minimum 1:2, preferably 1:3 or better 4) Portfolio diversification: Across sectors and asset classes 5) Correlation analysis: Avoid correlated positions.',
    'TEXT',
    ARRAY['risk', 'money-management', 'trading']
  );

-- Insert sample knowledge for Research Expert
INSERT INTO knowledge_sources (assistant_id, title, content, source_type, tags) VALUES
  (
    (SELECT id FROM ai_assistants WHERE name = 'Research Expert' LIMIT 1),
    'Research Methodology Best Practices',
    'Effective research methodology: 1) Define clear research questions 2) Use multiple reliable sources 3) Cross-verify information 4) Consider potential biases 5) Document sources and methodology 6) Distinguish between correlation and causation 7) Consider alternative explanations 8) Use both qualitative and quantitative approaches.',
    'TEXT',
    ARRAY['research', 'methodology', 'analysis']
  ),
  (
    (SELECT id FROM ai_assistants WHERE name = 'Research Expert' LIMIT 1),
    'Critical Thinking Framework',
    'Critical thinking involves: 1) Identifying assumptions and biases 2) Evaluating evidence quality 3) Considering alternative perspectives 4) Analyzing logical consistency 5) Assessing source credibility 6) Understanding context and limitations 7) Drawing reasoned conclusions 8) Remaining open to new information.',
    'TEXT',
    ARRAY['critical-thinking', 'analysis', 'reasoning']
  );

-- Insert sample question templates
INSERT INTO question_templates (category, title, template, placeholders, example, assistant_id) VALUES
  (
    'RESEARCH',
    'Comprehensive Topic Analysis',
    'Analyze {{topic}} in detail. Consider {{aspects}} and provide insights on {{specific_question}}',
    '[{"name": "topic", "description": "Main subject to research"}, {"name": "aspects", "description": "Specific aspects to focus on"}, {"name": "specific_question", "description": "Particular question to answer"}]'::jsonb,
    'Analyze renewable energy trends in detail. Consider economic viability and environmental impact and provide insights on adoption barriers',
    (SELECT id FROM ai_assistants WHERE name = 'Research Expert' LIMIT 1)
  ),
  (
    'ANALYSIS',
    'Financial Stock Analysis',
    'Analyze {{symbol}} stock. What are the key {{analysis_type}} indicators? Should I {{action}} based on {{timeframe}} outlook?',
    '[{"name": "symbol", "description": "Stock symbol"}, {"name": "analysis_type", "description": "Type of analysis (technical/fundamental)"}, {"name": "action", "description": "Intended action (buy/sell/hold)"}, {"name": "timeframe", "description": "Investment timeframe"}]'::jsonb,
    'Analyze RELIANCE stock. What are the key technical indicators? Should I buy based on short-term outlook?',
    (SELECT id FROM ai_assistants WHERE name = 'Financial Analyst' LIMIT 1)
  ),
  (
    'COMPARISON',
    'Compare and Contrast',
    'Compare {{item1}} vs {{item2}}. Focus on {{criteria}} and recommend which is better for {{use_case}}',
    '[{"name": "item1", "description": "First item to compare"}, {"name": "item2", "description": "Second item to compare"}, {"name": "criteria", "description": "Comparison criteria"}, {"name": "use_case", "description": "Specific use case"}]'::jsonb,
    'Compare swing trading vs day trading. Focus on risk and profitability and recommend which is better for working professionals',
    (SELECT id FROM ai_assistants WHERE name = 'Financial Analyst' LIMIT 1)
  ),
  (
    'STRATEGY',
    'Strategic Decision Making',
    'I need to {{decision}}. Consider {{factors}} and provide a strategic recommendation with reasoning',
    '[{"name": "decision", "description": "Decision to be made"}, {"name": "factors", "description": "Factors to consider"}]'::jsonb,
    'I need to expand my business to a new market. Consider competition and market size and provide a strategic recommendation with reasoning',
    (SELECT id FROM ai_assistants WHERE name = 'Business Strategist' LIMIT 1)
  ),
  (
    'DATA',
    'Pattern Identification',
    'Identify patterns in {{data_description}}. What trends emerge and what do they indicate about {{outcome}}?',
    '[{"name": "data_description", "description": "Description of the data"}, {"name": "outcome", "description": "Expected outcome or prediction"}]'::jsonb,
    'Identify patterns in customer purchase behavior. What trends emerge and what do they indicate about future revenue?',
    (SELECT id FROM ai_assistants WHERE name = 'Data Scientist' LIMIT 1)
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_assistant ON knowledge_sources(assistant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON chat_conversations(updated_at DESC);
