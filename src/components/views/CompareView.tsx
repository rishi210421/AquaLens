import React, { useState } from 'react';
import { MonitoringSite } from '../../types';
import { ComparisonBarChart } from '../charts/ComparisonBarChart';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { NavRoute } from '../layout/Navbar';

interface CompareViewProps {
  sites: MonitoringSite[];
  onRouteChange: (route: NavRoute) => void;
  onSelectSite: (site: MonitoringSite) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  sites,
  onRouteChange,
  onSelectSite,
}) => {
  // Default selected sites for immediate comparison
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([
    sites[0]?.id || 'site-lis-01',
    sites[3]?.id || 'site-lis-04',
    sites[6]?.id || 'site-bri-02',
  ]);

  const selectedSites = sites.filter((s) => selectedSiteIds.includes(s.id));

  const toggleSite = (id: string) => {
    if (selectedSiteIds.includes(id)) {
      if (selectedSiteIds.length > 2) {
        setSelectedSiteIds(selectedSiteIds.filter((sId) => sId !== id));
      }
    } else {
      if (selectedSiteIds.length < 5) {
        setSelectedSiteIds([...selectedSiteIds, id]);
      }
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Multi-Reach Comparative Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Compare 2 to 5 monitoring sites across composite indicators, water quality, biodiversity,
          and citizen signals
        </p>
      </div>

      {/* Reach Selector Chips */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">
            Select Reaches to Compare ({selectedSiteIds.length} / 5 selected):
          </span>
          <span className="text-[11px] text-slate-400">Min 2, Max 5 reaches</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sites.map((site) => {
            const isSelected = selectedSiteIds.includes(site.id);
            return (
              <button
                key={site.id}
                onClick={() => toggleSite(site.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                <span>
                  {site.name} ({site.city})
                </span>
                <span className="font-mono opacity-80 font-bold">
                  {site.scores.composite ?? '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {selectedSites.map((site) => (
          <div
            key={site.id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 text-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-teal-700 font-semibold">{site.code}</span>
                {selectedSiteIds.length > 2 && (
                  <button
                    onClick={() => toggleSite(site.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="font-bold text-slate-900 mt-1 line-clamp-1">{site.name}</div>
              <div className="text-[11px] text-slate-500">{site.streamName} · {site.city}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-center space-y-1">
              <div className="text-[10px] text-slate-400 uppercase">Composite Health</div>
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {site.scores.composite ?? '—'}
              </div>
              <HealthBadge status={site.status} showScore={false} size="sm" />
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Water Quality:</span>
                <span className="font-mono font-semibold">{site.scores.waterQuality ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biodiversity:</span>
                <span className="font-mono font-semibold">{site.scores.biodiversity ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Habitat:</span>
                <span className="font-mono font-semibold">{site.scores.habitat ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Confidence:</span>
                <ConfidenceBadge level={site.confidence} />
              </div>
            </div>

            <button
              onClick={() => {
                onSelectSite(site);
                onRouteChange('sites');
              }}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-center transition-colors cursor-pointer"
            >
              Inspect Site
            </button>
          </div>
        ))}
      </div>

      {/* Grouped Comparison Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Indicator Comparison Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized 0–100 scale across all evaluated core sub-indicators
          </p>
        </div>

        <ComparisonBarChart sites={selectedSites} />
      </div>
    </div>
  );
};
