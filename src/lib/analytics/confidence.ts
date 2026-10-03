import { ConfidenceDetails, ConfidenceLevel } from '../../types';

/**
 * Calculates evidence-based data confidence for a monitoring site.
 * Evaluates observation density, temporal recency, and multi-indicator coverage.
 */
export function calculateConfidence(params: {
  observationCount: number;
  recencyDays: number;
  indicatorsAvailable: number;
  totalIndicators?: number;
  historicalDaysSpan?: number;
}): ConfidenceDetails {
  const {
    observationCount,
    recencyDays,
    indicatorsAvailable,
    totalIndicators = 5,
    historicalDaysSpan = 90,
  } = params;

  let score = 0;
  const reasons: string[] = [];

  // 1. Observation sample volume (up to 35 pts)
  if (observationCount >= 25) {
    score += 35;
    reasons.push(`✓ High observation volume (${observationCount} observations recorded)`);
  } else if (observationCount >= 10) {
    score += 24;
    reasons.push(`✓ Moderate observation volume (${observationCount} observations recorded)`);
  } else if (observationCount >= 4) {
    score += 14;
    reasons.push(`~ Limited observation sample (${observationCount} observations recorded)`);
  } else {
    score += 5;
    reasons.push(`✗ Sparse observation data (${observationCount} observations recorded)`);
  }

  // 2. Recency of telemetry/sampling (up to 25 pts)
  if (recencyDays <= 7) {
    score += 25;
    reasons.push(`✓ Very recent field data (${recencyDays} days ago)`);
  } else if (recencyDays <= 21) {
    score += 18;
    reasons.push(`✓ Data updated within last 3 weeks (${recencyDays} days ago)`);
  } else if (recencyDays <= 45) {
    score += 10;
    reasons.push(`~ Moderately aged data (${recencyDays} days since last update)`);
  } else {
    score += 2;
    reasons.push(`✗ Outdated observations (${recencyDays} days since last update)`);
  }

  // 3. Multi-indicator coverage (up to 25 pts)
  const coverageRatio = indicatorsAvailable / totalIndicators;
  if (coverageRatio >= 0.8) {
    score += 25;
    reasons.push(`✓ Comprehensive indicator coverage (${indicatorsAvailable}/${totalIndicators} streams active)`);
  } else if (coverageRatio >= 0.6) {
    score += 16;
    reasons.push(`~ Partial indicator coverage (${indicatorsAvailable}/${totalIndicators} active)`);
  } else {
    score += 6;
    reasons.push(`✗ Limited indicator breadth (${indicatorsAvailable}/${totalIndicators} active)`);
  }

  // 4. Historical coverage depth (up to 15 pts)
  if (historicalDaysSpan >= 90) {
    score += 15;
    reasons.push(`✓ Robust temporal history (>= 90-day time series baseline)`);
  } else if (historicalDaysSpan >= 30) {
    score += 9;
    reasons.push(`~ Short-term temporal history (${historicalDaysSpan} days baseline)`);
  } else {
    score += 3;
    reasons.push(`✗ Insufficient temporal baseline (< 30 days)`);
  }

  let level: ConfidenceLevel = 'High';
  if (score < 45) {
    level = 'Low';
  } else if (score < 75) {
    level = 'Medium';
  }

  return {
    level,
    score: Math.min(100, score),
    observationCount,
    recencyDays,
    indicatorsAvailable,
    totalIndicators,
    reasons,
  };
}

export function getConfidenceBadgeProps(level: ConfidenceLevel): {
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  switch (level) {
    case 'High':
      return {
        label: 'High Confidence',
        badgeClass: 'text-teal-700 bg-teal-50 border-teal-200',
        dotClass: 'bg-teal-500',
      };
    case 'Medium':
      return {
        label: 'Medium Confidence',
        badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'Low':
      return {
        label: 'Low Confidence',
        badgeClass: 'text-slate-600 bg-slate-100 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
}
