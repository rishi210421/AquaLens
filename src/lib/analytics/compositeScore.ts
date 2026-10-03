import { IndicatorScores, WeightConfig, HealthStatus } from '../../types';

export const DEFAULT_WEIGHTS: WeightConfig = {
  waterQuality: 30,
  biodiversity: 25,
  habitat: 20,
  citizenSignal: 15,
  environmentalContext: 10,
};

export interface CompositeCalculationResult {
  score: number | null;
  status: HealthStatus;
  activeWeights: Record<string, number>;
  availableIndicators: string[];
  missingIndicators: string[];
  isRedistributed: boolean;
  confidencePenalty: number;
  explanation: string;
}

/**
 * Calculates the AquaInsight Composite Stream Health Indicator.
 * Transparent prototype methodology that proportionally redistributes weights
 * if any indicators are missing, rather than penalizing missing data as zero score.
 */
export function calculateCompositeIndicator(
  scores: Partial<IndicatorScores>,
  customWeights: Partial<WeightConfig> = {}
): CompositeCalculationResult {
  const weights: WeightConfig = {
    ...DEFAULT_WEIGHTS,
    ...customWeights,
  };

  const indicatorMap: { key: keyof WeightConfig; name: string; value: number | null | undefined }[] = [
    { key: 'waterQuality', name: 'Water Quality', value: scores.waterQuality },
    { key: 'biodiversity', name: 'Biodiversity', value: scores.biodiversity },
    { key: 'habitat', name: 'Habitat Condition', value: scores.habitat },
    { key: 'citizenSignal', name: 'Citizen Signal', value: scores.citizenSignal },
    { key: 'environmentalContext', name: 'Environmental Context', value: scores.environmentalContext },
  ];

  const available: { name: string; weight: number; value: number }[] = [];
  const missing: string[] = [];

  for (const item of indicatorMap) {
    if (item.value !== null && item.value !== undefined && !isNaN(item.value)) {
      available.push({
        name: item.name,
        weight: weights[item.key],
        value: Math.max(0, Math.min(100, item.value)),
      });
    } else {
      missing.push(item.name);
    }
  }

  // If fewer than 2 indicators exist, data is insufficient to compute a reliable composite
  if (available.length < 2) {
    return {
      score: null,
      status: 'insufficient',
      activeWeights: {},
      availableIndicators: available.map((a) => a.name),
      missingIndicators: missing,
      isRedistributed: false,
      confidencePenalty: 60,
      explanation: 'Insufficient data: At least 2 active health indicators are required to compute a composite score.',
    };
  }

  const rawAvailableWeightTotal = available.reduce((acc, curr) => acc + curr.weight, 0);
  const activeWeights: Record<string, number> = {};

  let weightedSum = 0;
  for (const item of available) {
    // Proportional redistribution: re-normalize active weights so they sum to 100%
    const redistributedWeight = (item.weight / rawAvailableWeightTotal) * 100;
    activeWeights[item.name] = Math.round(redistributedWeight * 10) / 10;
    weightedSum += item.value * (redistributedWeight / 100);
  }

  const compositeScore = Math.round(weightedSum * 10) / 10;
  const isRedistributed = missing.length > 0;
  const confidencePenalty = missing.length * 15;

  // Status classification: 80-100 Healthy, 60-79 Watch, 0-59 Attention
  let status: HealthStatus = 'healthy';
  if (compositeScore < 60) {
    status = 'attention';
  } else if (compositeScore < 80) {
    status = 'watch';
  }

  let explanation = `Calculated across ${available.length} active indicators.`;
  if (isRedistributed) {
    explanation = `${missing.join(', ')} data unavailable. Weights were proportionally redistributed across available indicators with an associated confidence penalty.`;
  }

  return {
    score: compositeScore,
    status,
    activeWeights,
    availableIndicators: available.map((a) => a.name),
    missingIndicators: missing,
    isRedistributed,
    confidencePenalty,
    explanation,
  };
}

export function getStatusLabel(status: HealthStatus): string {
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
}

export function getStatusColors(status: HealthStatus): { text: string; bg: string; border: string; dot: string } {
  switch (status) {
    case 'healthy':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'watch':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'attention':
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'insufficient':
      return {
        text: 'text-slate-600',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}
