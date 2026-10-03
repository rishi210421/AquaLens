import React, { useState } from 'react';
import { MonitoringSite, InsightItem, InsightCategory } from '../../types';
import { getAllInsights } from '../../lib/insights/insightEngine';
import { ConfidenceBadge } from '../common/HealthBadge';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NavRoute } from '../layout/Navbar';

interface InsightsViewProps {
  sites: MonitoringSite[];
  onSelectSite: (site: MonitoringSite) => void;
  onRouteChange: (route: NavRoute) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  sites,
  onSelectSite,
  onRouteChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const allInsights = getAllInsights(sites);

  const filteredInsights = allInsights.filter((ins) => {
    if (selectedCategory !== 'all' && ins.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryIcon = (category: InsightCategory) => {
    switch (category) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-rose-600" />;
      case 'hotspot':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'unusual-change':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'data-gap':
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Automated One Health Stream Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Deterministic and evidence-based environmental synthesis across all pilot reaches
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 text-xs">
        {[
          { id: 'all', label: `All Insights (${allInsights.length})` },
          { id: 'declining', label: 'Declining' },
          { id: 'hotspot', label: 'Hotspots' },
          { id: 'unusual-change', label: 'Unusual Shifts' },
          { id: 'improving', label: 'Improving' },
          { id: 'data-gap', label: 'Data Gaps' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-teal-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((ins) => {
          const site = sites.find((s) => s.id === ins.siteId);

          return (
            <div
              key={ins.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    {getCategoryIcon(ins.category)}
                    <span className="capitalize">{ins.indicator}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ins.changePercent !== 0 && (
                      <span
                        className={`font-mono font-bold text-xs ${
                          ins.changePercent < 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {ins.changePercent > 0 ? '+' : ''}
                        {ins.changePercent}%
                      </span>
                    )}
                    <ConfidenceBadge level={ins.confidence} />
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <strong className="text-slate-800">{ins.siteName}</strong> · {ins.streamName} ({ins.city})
                </div>

                <p className="text-slate-700 leading-relaxed pt-1">{ins.explanation}</p>
              </div>

              {/* Actionable & One Health Synthesis */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px]">
                <div className="p-2.5 bg-slate-50 rounded text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                    One Health Framing
                  </div>
                  <p>{ins.oneHealthContext}</p>
                </div>

                <div className="flex items-center justify-between text-teal-800 font-medium pt-1">
                  <span className="truncate max-w-[280px]">
                    Action: {ins.actionableNextStep}
                  </span>
                  {site && (
                    <button
                      onClick={() => {
                        onSelectSite(site);
                        onRouteChange('sites');
                      }}
                      className="font-semibold inline-flex items-center gap-1 hover:text-teal-900 cursor-pointer shrink-0 ml-2"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
