import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bot, BookOpen, Tag, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

type Assistant = {
  id: string;
  name: string;
  description: string;
  avatar_emoji: string;
  specialization: string;
  system_prompt: string;
};

type KnowledgeSource = {
  id: string;
  title: string;
  content: string;
  source_type: string;
  tags: string[];
};

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
  total_messages: number;
};

type Props = {
  onSelectAssistant: (assistantId: string) => void;
  selectedAssistantId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

export default function AssistantSelector({ onSelectAssistant, selectedAssistantId, onSelectConversation }: Props) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<Record<string, KnowledgeSource[]>>({});
  const [expandedAssistant, setExpandedAssistant] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);

  useEffect(() => {
    loadAssistants();
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedAssistantId) {
      loadKnowledgeBase(selectedAssistantId);
    }
  }, [selectedAssistantId]);

  async function loadAssistants() {
    const { data } = await supabase
      .from('ai_assistants')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setAssistants(data);
      data.forEach((assistant) => loadKnowledgeBase(assistant.id));
    }
  }

  async function loadKnowledgeBase(assistantId: string) {
    const { data } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('assistant_id', assistantId)
      .eq('is_active', true);

    if (data) {
      setKnowledgeBases((prev) => ({ ...prev, [assistantId]: data }));
    }
  }

  async function loadConversations() {
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (data) setConversations(data);
  }

  function toggleExpanded(assistantId: string) {
    setExpandedAssistant(expandedAssistant === assistantId ? null : assistantId);
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

  return (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <span>AI Assistants</span>
        </h2>
        <p className="text-xs text-slate-400">
          Select an expert assistant for your needs
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          {assistants.map((assistant) => {
            const knowledge = knowledgeBases[assistant.id] || [];
            const isSelected = selectedAssistantId === assistant.id;
            const isExpanded = expandedAssistant === assistant.id;

            return (
              <div
                key={assistant.id}
                className={`border rounded-lg transition-all ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-600'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <button
                  onClick={() => onSelectAssistant(assistant.id)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{assistant.avatar_emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-white text-sm">{assistant.name}</h3>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                        {assistant.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded">
                          {assistant.specialization}
                        </span>
                        {knowledge.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <BookOpen className="w-3 h-3" />
                            <span>{knowledge.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {knowledge.length > 0 && (
                  <div className="border-t border-slate-700">
                    <button
                      onClick={() => toggleExpanded(assistant.id)}
                      className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      <span>Knowledge Base ({knowledge.length})</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-2">
                        {knowledge.map((source) => (
                          <div
                            key={source.id}
                            className="bg-slate-900/50 border border-slate-700 rounded p-2"
                          >
                            <div className="font-semibold text-xs text-white mb-1">
                              {source.title}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                              {source.content.substring(0, 100)}...
                            </p>
                            {source.tags.length > 0 && (
                              <div className="flex items-center flex-wrap gap-1">
                                {source.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="flex items-center space-x-1 px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded text-xs"
                                  >
                                    <Tag className="w-2 h-2" />
                                    <span>{tag}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {conversations.length > 0 && (
        <div className="border-t border-slate-700">
          <button
            onClick={() => setShowConversations(!showConversations)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm text-white hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Recent Conversations</span>
            </div>
            {showConversations ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showConversations && (
            <div className="max-h-64 overflow-y-auto p-3 space-y-2 bg-slate-950">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="w-full text-left p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded transition-colors"
                >
                  <div className="text-sm text-white font-medium mb-1 line-clamp-1">
                    {conv.title}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{conv.total_messages} messages</span>
                    <span>{getTimeAgo(conv.updated_at)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
