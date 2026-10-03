import React from 'react';
import { HealthStatus, ConfidenceLevel } from '../../types';

interface HealthBadgeProps {
  status: HealthStatus;
  score?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  status,
  score,
  size = 'md',
  showScore = true,
}) => {
  const getLabel = () => {
    switch (status) {
      case 'healthy':
        return 'Healthy / Stable';
      case 'watch':
        return 'Watch';
      case 'attention':
        return 'Attention';
      case 'insufficient':
        return 'Insufficient Data';
    }
  };

  const getStyles = () => {
    switch (status) {
      case 'healthy':
        return {
          dot: 'bg-emerald-500',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          bg: 'bg-emerald-50/70',
        };
      case 'watch':
        return {
          dot: 'bg-amber-500',
          text: 'text-amber-800',
          border: 'border-amber-200',
          bg: 'bg-amber-50/70',
        };
      case 'attention':
        return {
          dot: 'bg-rose-500',
          text: 'text-rose-800',
          border: 'border-rose-200',
          bg: 'bg-rose-50/70',
        };
      case 'insufficient':
        return {
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          border: 'border-slate-200',
          bg: 'bg-slate-100',
        };
    }
  };

  const s = getStyles();
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1.5'
      : size === 'lg'
      ? 'text-sm px-3 py-1 gap-2'
      : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${s.bg} ${s.border} ${s.text} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} aria-hidden="true" />
      <span>{getLabel()}</span>
      {showScore && score !== null && score !== undefined && (
        <>
          <span className="text-slate-300 font-light" aria-hidden="true">·</span>
          <span className="font-mono tabular-nums font-semibold">{score}</span>
        </>
      )}
    </span>
  );
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  score?: number;
  reasons?: string[];
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, score, reasons }) => {
  const getStyles = () => {
    switch (level) {
      case 'High':
        return {
          text: 'text-teal-800',
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          dot: 'bg-teal-600',
        };
      case 'Medium':
        return {
          text: 'text-amber-800',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'Low':
        return {
          text: 'text-slate-600',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const s = getStyles();

  return (
    <span
      title={reasons ? reasons.join('\n') : undefined}
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${s.bg} ${s.border} ${s.text} gap-1.5 whitespace-nowrap cursor-help`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      <span>{level} Confidence</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] opacity-75 tabular-nums">({score}%)</span>
      )}
    </span>
  );
};
