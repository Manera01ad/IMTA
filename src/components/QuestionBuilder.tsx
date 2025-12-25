import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wand2, ArrowRight, Lightbulb, TrendingUp, FileSearch, Target, BarChart } from 'lucide-react';

type QuestionTemplate = {
  id: string;
  category: string;
  title: string;
  template: string;
  placeholders: Array<{ name: string; description: string }>;
  example: string;
  assistant_id: string;
};

type Props = {
  onQuestionGenerated: (question: string, assistantId: string) => void;
};

const categoryIcons: Record<string, any> = {
  RESEARCH: FileSearch,
  ANALYSIS: TrendingUp,
  COMPARISON: BarChart,
  STRATEGY: Target,
  DATA: BarChart,
};

const categoryColors: Record<string, string> = {
  RESEARCH: 'from-blue-600 to-blue-800',
  ANALYSIS: 'from-emerald-600 to-emerald-800',
  COMPARISON: 'from-purple-600 to-purple-800',
  STRATEGY: 'from-amber-600 to-amber-800',
  DATA: 'from-rose-600 to-rose-800',
};

export default function QuestionBuilder({ onQuestionGenerated }: Props) {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const [generatedQuestion, setGeneratedQuestion] = useState('');
  const [showExample, setShowExample] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      generateQuestion();
    }
  }, [placeholderValues, selectedTemplate]);

  async function loadTemplates() {
    const { data } = await supabase
      .from('question_templates')
      .select('*')
      .eq('is_active', true)
      .order('category')
      .order('title');

    if (data) setTemplates(data);
  }

  function selectTemplate(template: QuestionTemplate) {
    setSelectedTemplate(template);
    const initialValues: Record<string, string> = {};
    template.placeholders.forEach((p) => {
      initialValues[p.name] = '';
    });
    setPlaceholderValues(initialValues);
    setShowExample(false);
  }

  function generateQuestion() {
    if (!selectedTemplate) return;

    let question = selectedTemplate.template;
    selectedTemplate.placeholders.forEach((placeholder) => {
      const value = placeholderValues[placeholder.name] || `[${placeholder.name}]`;
      question = question.replace(`{{${placeholder.name}}}`, value);
    });

    setGeneratedQuestion(question);
  }

  function handleSubmit() {
    if (!selectedTemplate) return;

    const allFilled = selectedTemplate.placeholders.every(
      (p) => placeholderValues[p.name]?.trim()
    );

    if (!allFilled) {
      alert('Please fill in all fields');
      return;
    }

    onQuestionGenerated(generatedQuestion, selectedTemplate.assistant_id);
  }

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-700 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <Wand2 className="w-8 h-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Question Builder</h2>
            <p className="text-slate-300 text-sm">
              Build perfect questions using expert templates
            </p>
          </div>
        </div>
      </div>

      {!selectedTemplate ? (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryTemplates = templates.filter((t) => t.category === category);
            const Icon = categoryIcons[category] || Lightbulb;
            const colorClass = categoryColors[category] || 'from-slate-600 to-slate-800';

            return (
              <div key={category} className="space-y-3">
                <div className={`bg-gradient-to-r ${colorClass} border border-white/20 rounded-lg p-3`}>
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-white" />
                    <h3 className="text-lg font-bold text-white">{category}</h3>
                    <span className="text-xs text-white/70">
                      {categoryTemplates.length} templates
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="bg-slate-800/50 border border-slate-700 hover:border-blue-600 rounded-lg p-4 text-left transition-all group"
                    >
                      <h4 className="font-bold text-white mb-2 group-hover:text-blue-400">
                        {template.title}
                      </h4>
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                        {template.template}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <span>{template.placeholders.length} fields</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{selectedTemplate.title}</h3>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to templates
            </button>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="space-y-4">
              {selectedTemplate.placeholders.map((placeholder) => (
                <div key={placeholder.name}>
                  <label className="block text-sm font-semibold text-white mb-2">
                    {placeholder.name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </label>
                  <p className="text-xs text-slate-400 mb-2">{placeholder.description}</p>
                  <input
                    type="text"
                    value={placeholderValues[placeholder.name] || ''}
                    onChange={(e) =>
                      setPlaceholderValues({
                        ...placeholderValues,
                        [placeholder.name]: e.target.value,
                      })
                    }
                    placeholder={`Enter ${placeholder.name}...`}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold text-white">Generated Question</h4>
              </div>
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {showExample ? 'Hide' : 'Show'} Example
              </button>
            </div>

            {showExample && (
              <div className="mb-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
                <p className="text-xs font-semibold text-slate-400 mb-2">EXAMPLE:</p>
                <p className="text-sm text-slate-300">{selectedTemplate.example}</p>
              </div>
            )}

            <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
              <p className="text-white leading-relaxed">{generatedQuestion}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedTemplate.placeholders.every((p) => placeholderValues[p.name]?.trim())}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            <span>Ask This Question</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
