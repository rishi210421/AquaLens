import React, { useState } from 'react';
import { askAquaLens, AskResponse } from '../../lib/ai/aiService';
import { MonitoringSite } from '../../types';
import { Search, Sparkles, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
import { HealthBadge } from '../common/HealthBadge';

interface AskViewProps {
  sites: MonitoringSite[];
  onSelectSite: (site: MonitoringSite) => void;
  onViewSite: (siteId: string) => void;
}

export const AskView: React.FC<AskViewProps> = ({ sites, onSelectSite, onViewSite }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);

  const sampleQuestions = [
    'Which sites declined the most this month?',
    'Which streams have the highest biodiversity?',
    'Show potential monitoring hotspots',
    'Which sites have low confidence or data gaps?',
    'Which locations have increasing pollution observations?',
  ];

  const handleAsk = async (qText: string) => {
    if (!qText.trim()) return;
    setLoading(true);
    setQuestion(qText);
    try {
      const res = await askAquaLens(qText);
      setResponse(res);
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Grounded Natural-Language Environmental Exploration</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Ask AquaLens
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Explore stream data through natural language queries. All answers are strictly calculated
          and grounded in verified time-series data.
        </p>
      </div>

      {/* Query Input Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Ask about stream trends, hotspots, water quality, or biodiversity..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? 'Evaluating...' : 'Ask Engine'}
          </button>
        </form>

        {/* Sample Question Chips */}
        <div className="space-y-1.5 text-xs">
          <div className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
            Suggested Inquiries:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                className="text-left px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
            <span className="font-semibold text-slate-900">Query Analysis Result</span>
            <span className="font-mono text-[11px] text-slate-400">
              Engine: {response.source}
            </span>
          </div>

          <div className="text-sm leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">
            {response.answer}
          </div>

          {/* Matched Reaches Cards if any */}
          {response.matchedSites && response.matchedSites.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                Referenced Monitoring Reaches:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {response.matchedSites.map((site) => (
                  <div
                    key={site.id}
                    onClick={() => {
                      onSelectSite(site);
                      onViewSite(site.id);
                    }}
                    className="p-3 bg-white border border-slate-200 hover:border-teal-500 rounded-lg transition-colors cursor-pointer group text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-teal-700 font-semibold">
                        {site.code}
                      </span>
                      <HealthBadge status={site.status} showScore={false} size="sm" />
                    </div>
                    <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {site.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{site.streamName} · {site.city}</div>
                    <div className="text-[11px] font-mono text-slate-700 pt-1">
                      Composite Score: <strong>{site.scores.composite ?? '—'}/100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Grounding Guardrail Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Deterministic telemetry query engine · No hallucinations · Transparent data attribution
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
