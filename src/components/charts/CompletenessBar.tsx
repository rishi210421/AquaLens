import React from 'react';
import { DataCompleteness } from '../../types';

interface CompletenessBarProps {
  completeness: DataCompleteness;
  showLabels?: boolean;
}

export const CompletenessBar: React.FC<CompletenessBarProps> = ({ completeness, showLabels = true }) => {
  const items = [
    { label: 'Water Quality', value: completeness.waterQuality, color: 'bg-teal-500' },
    { label: 'Biodiversity', value: completeness.biodiversity, color: 'bg-emerald-500' },
    { label: 'Habitat', value: completeness.habitat, color: 'bg-amber-500' },
    { label: 'Citizen Obs', value: completeness.citizenObservations, color: 'bg-cyan-500' },
    { label: 'Weather', value: completeness.weather, color: 'bg-indigo-400' },
  ];

  return (
    <div className="w-full space-y-2">
      {showLabels && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Data Completeness Baseline</span>
          <span className="font-mono font-semibold text-slate-800 tabular-nums">
            {completeness.overall}% coverage
          </span>
        </div>
      )}

      {/* Progress Bars */}
      <div className="space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 text-slate-500 truncate">{it.label}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${it.color} rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, it.value))}%` }}
              />
            </div>
            <span className="w-10 text-right font-mono text-[11px] text-slate-600 tabular-nums">
              {it.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
