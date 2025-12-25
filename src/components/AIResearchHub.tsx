import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AIChat from './AIChat';

type Assistant = {
  id: string;
  name: string;
  description: string;
  avatar_emoji: string;
  specialization: string;
};

export default function AIResearchHub() {
  const [selectedAssistant, setSelectedAssistant] = useState<string | null>(null);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    loadAssistants();
  }, []);

  async function loadAssistants() {
    const { data } = await supabase
      .from('ai_assistants')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data && data.length > 0) {
      setAssistants(data);
      setSelectedAssistant(data[0].id);
    }
  }

  function handleSelectAssistant(assistantId: string) {
    setSelectedAssistant(assistantId);
    setConversationId(null);
  }

  function handleNewConversation(convId: string) {
    setConversationId(convId);
  }

  const currentAssistant = assistants.find(a => a.id === selectedAssistant);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <h1 className="text-lg font-semibold text-white">AI Research Hub</h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!selectedAssistant ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md p-6">
              <div className="text-6xl mb-6">🤖</div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Loading AI Assistants...
              </h2>
              <p className="text-slate-400">
                Please wait while we initialize your AI research hub.
              </p>
            </div>
          </div>
        ) : (
          <AIChat
            conversationId={conversationId}
            assistantId={selectedAssistant}
            onNewConversation={handleNewConversation}
            assistants={assistants}
            onSelectAssistant={handleSelectAssistant}
          />
        )}
      </div>
    </div>
  );
}
