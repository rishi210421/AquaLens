import React from 'react';
import { MonitoringSite } from '../../types';

interface ComparisonBarChartProps {
  sites: MonitoringSite[];
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({ sites }) => {
  if (!sites || sites.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        Select at least 2 sites to inspect multi-reach comparisons.
      </div>
    );
  }

  const siteColors = ['#0d9488', '#0284c7', '#8b5cf6', '#d97706', '#ec4899'];

  const categories = [
    { label: 'Composite Health', key: 'composite' },
    { label: 'Water Quality', key: 'waterQuality' },
    { label: 'Biodiversity', key: 'biodiversity' },
    { label: 'Habitat Condition', key: 'habitat' },
    { label: 'Citizen Signal', key: 'citizenSignal' },
  ];

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {sites.map((site, idx) => (
          <div key={site.id} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: siteColors[idx % siteColors.length] }}
            />
            <span className="font-medium text-slate-800">{site.name}</span>
            <span className="text-slate-400 text-[11px]">({site.city})</span>
          </div>
        ))}
      </div>

      {/* Grouped Bar Visualizations */}
      <div className="space-y-5">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{cat.label}</span>
              <span className="text-slate-400 text-[11px]">Score (0–100)</span>
            </div>

            <div className="space-y-1 bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
              {sites.map((site, idx) => {
                const val = site.scores[cat.key as keyof typeof site.scores];
                const displayVal = val !== null && val !== undefined ? val : null;
                const pct = displayVal !== null ? Math.min(100, Math.max(0, displayVal)) : 0;
                const color = siteColors[idx % siteColors.length];

                return (
                  <div key={site.id} className="flex items-center gap-2 text-xs">
                    <span className="w-28 text-slate-500 truncate text-[11px] font-medium">
                      {site.code}
                    </span>
                    <div className="flex-1 h-3.5 bg-slate-200/60 rounded overflow-hidden">
                      {displayVal !== null ? (
                        <div
                          className="h-full rounded transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: color,
                          }}
                        />
                      ) : (
                        <div className="h-full bg-slate-300/40 italic flex items-center px-1 text-[9px] text-slate-500">
                          Unavailable
                        </div>
                      )}
                    </div>
                    <span className="w-12 text-right font-mono text-[11px] font-semibold tabular-nums text-slate-700">
                      {displayVal !== null ? `${displayVal}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
