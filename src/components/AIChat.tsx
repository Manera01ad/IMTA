import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Bot, User, Brain, Loader, FileText, Sparkles, Wand2 } from 'lucide-react';
import QuestionBuilder from './QuestionBuilder';

type Message = {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  reasoning: string | null;
  knowledge_used: string[] | null;
  created_at: string;
};

type Assistant = {
  id: string;
  name: string;
  description: string;
  avatar_emoji: string;
  specialization: string;
};

type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

type Props = {
  conversationId: string | null;
  assistantId: string;
  onNewConversation: (id: string, title: string) => void;
  assistants: Assistant[];
  onSelectAssistant: (id: string) => void;
};

export default function AIChat({ conversationId, assistantId, onNewConversation, assistants, onSelectAssistant }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [models, setModels] = useState<AIModel[]>([]);
  const [showReasoning, setShowReasoning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentConvId, setCurrentConvId] = useState(conversationId);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);

  useEffect(() => {
    loadAssistant();
    loadModels();
  }, [assistantId]);

  useEffect(() => {
    if (currentConvId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [currentConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadAssistant() {
    const { data } = await supabase
      .from('ai_assistants')
      .select('*, ai_models!default_model_id(id)')
      .eq('id', assistantId)
      .single();

    if (data) {
      setAssistant(data);
      if (data.ai_models) {
        setSelectedModel(data.ai_models.id);
      }
    }
  }

  async function loadModels() {
    const { data } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) setModels(data);
  }

  async function loadMessages() {
    if (!currentConvId) return;

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', currentConvId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      let convId = currentConvId;

      if (!convId) {
        const title = userMessage.substring(0, 60) + (userMessage.length > 60 ? '...' : '');
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({
            assistant_id: assistantId,
            title,
            model_id: selectedModel,
          })
          .select()
          .single();

        if (newConv) {
          convId = newConv.id;
          setCurrentConvId(convId);
          onNewConversation(convId, title);
        }
      }

      setMessages(prev => [...prev, {
        id: 'temp-user',
        role: 'USER',
        content: userMessage,
        reasoning: null,
        knowledge_used: null,
        created_at: new Date().toISOString(),
      }]);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: convId,
          message: userMessage,
          assistantId,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const result = await response.json();

      if (result.success) {
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleQuestionGenerated(question: string, assistantId: string) {
    onSelectAssistant(assistantId);
    setInput(question);
    setShowQuestionBuilder(false);
  }

  const currentAssistant = assistants.find(a => a.id === assistantId);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !showQuestionBuilder && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">{currentAssistant?.avatar_emoji || '🤖'}</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {currentAssistant?.name || 'AI Assistant'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {currentAssistant?.specialization}
            </p>
            <button
              onClick={() => setShowQuestionBuilder(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Wand2 className="w-4 h-4" />
              <span>Use Question Builder</span>
            </button>
          </div>
        )}

        {showQuestionBuilder && messages.length === 0 && (
          <div>
            <button
              onClick={() => setShowQuestionBuilder(false)}
              className="mb-4 text-sm text-slate-400 hover:text-white"
            >
              ← Back to Chat
            </button>
            <QuestionBuilder onQuestionGenerated={handleQuestionGenerated} />
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl ${
                message.role === 'USER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700'
              } rounded-lg p-4`}
            >
              <div className="flex items-start space-x-3">
                <div className={`${message.role === 'USER' ? 'bg-blue-700' : 'bg-slate-700'} rounded-full p-2`}>
                  {message.role === 'USER' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold mb-2">
                    {message.role === 'USER' ? 'You' : assistant?.name}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {message.role === 'ASSISTANT' && message.reasoning && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowReasoning(showReasoning === message.id ? null : message.id)}
                        className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <Brain className="w-4 h-4" />
                        <span>{showReasoning === message.id ? 'Hide' : 'Show'} Reasoning Process</span>
                      </button>

                      {showReasoning === message.id && (
                        <div className="mt-3 p-3 bg-slate-900/50 border border-slate-700 rounded">
                          <div className="text-xs font-semibold text-blue-400 mb-2">REASONING PROCESS:</div>
                          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {message.reasoning}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {message.role === 'ASSISTANT' && message.knowledge_used && message.knowledge_used.length > 0 && (
                    <div className="mt-3 flex items-center flex-wrap gap-2">
                      <FileText className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-slate-400">Knowledge used:</span>
                      {message.knowledge_used.map((source, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-3xl bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-700 rounded-full p-2">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold mb-2">{assistant?.name}</div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700/50 p-4 bg-slate-900/50">
        <div className="flex items-start space-x-2">
          <div className="flex flex-col space-y-2 pt-2">
            <button
              onClick={() => setShowQuestionBuilder(!showQuestionBuilder)}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-purple-400"
              title="Question Builder"
            >
              <Wand2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${currentAssistant?.name || 'AI'} anything...`}
              rows={3}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <select
                  value={assistantId}
                  onChange={(e) => onSelectAssistant(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {assistants.map((asst) => (
                    <option key={asst.id} value={asst.id}>
                      {asst.avatar_emoji} {asst.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500">
                Press Enter to send
              </div>
            </div>
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="mt-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
