import { Deltas30d } from '../../types';

export interface IndicatorDelta {
  indicator: string;
  key: keyof Deltas30d;
  change: number; // percentage change
  direction: 'up' | 'down' | 'flat';
  nature: 'positive' | 'negative' | 'neutral';
  explanation: string;
}

export interface WhatChangedResult {
  periodLabel: string;
  keyDriver: string;
  summary: string;
  deltas: IndicatorDelta[];
  primaryConcern: string | null;
}

/**
 * Calculates deterministic "What Changed?" period-over-period breakdown.
 * Identifies the largest positive and negative shifting factors.
 */
export function calculateWhatChanged(deltas: Deltas30d, periodLabel = 'Last 30 Days'): WhatChangedResult {
  const deltaItems: IndicatorDelta[] = [
    {
      indicator: 'Water Quality',
      key: 'waterQuality',
      change: deltas.waterQuality,
      direction: deltas.waterQuality > 1 ? 'up' : deltas.waterQuality < -1 ? 'down' : 'flat',
      nature: deltas.waterQuality > 1 ? 'positive' : deltas.waterQuality < -1 ? 'negative' : 'neutral',
      explanation:
        deltas.waterQuality < -5
          ? `Significant decline in physicochemical parameters (dissolved oxygen / turbidity)`
          : deltas.waterQuality > 5
          ? `Observed physicochemical recovery with stabilized dissolved oxygen`
          : `Water quality parameters remained within seasonal baseline bounds`,
    },
    {
      indicator: 'Biodiversity Signal',
      key: 'biodiversity',
      change: deltas.biodiversity,
      direction: deltas.biodiversity > 1 ? 'up' : deltas.biodiversity < -1 ? 'down' : 'flat',
      nature: deltas.biodiversity > 1 ? 'positive' : deltas.biodiversity < -1 ? 'negative' : 'neutral',
      explanation:
        deltas.biodiversity < -5
          ? `Reduced sightings of sensitive benthic taxa (e.g. Ephemeroptera/Trichoptera)`
          : deltas.biodiversity > 5
          ? `Increase in verified macroinvertebrate and riparian bird diversity`
          : `Biological taxa richness steady across sampling events`,
    },
    {
      indicator: 'Habitat Condition',
      key: 'habitat',
      change: deltas.habitat,
      direction: deltas.habitat > 1 ? 'up' : deltas.habitat < -1 ? 'down' : 'flat',
      nature: deltas.habitat > 1 ? 'positive' : deltas.habitat < -1 ? 'negative' : 'neutral',
      explanation:
        deltas.habitat < -5
          ? `Degradation in riparian canopy buffer and sediment accumulation along banks`
          : deltas.habitat > 5
          ? `Improved bank stabilization and vegetative vegetative cover noted`
          : `Physical riparian corridor characteristics remain unchanged`,
    },
    {
      indicator: 'Pollution Incidents',
      key: 'pollution',
      change: deltas.pollution,
      // For pollution, an increase is negative!
      direction: deltas.pollution > 1 ? 'up' : deltas.pollution < -1 ? 'down' : 'flat',
      nature: deltas.pollution > 1 ? 'negative' : deltas.pollution < -1 ? 'positive' : 'neutral',
      explanation:
        deltas.pollution > 10
          ? `Marked spike in citizen-reported trash, oily sheens, or stormwater discharge`
          : deltas.pollution < -10
          ? `Fewer pollution debris and stormwater discharge reports logged`
          : `Incidental pollution reports remained near baseline levels`,
    },
  ];

  // Identify the largest magnitude shifts
  const sortedByMagnitude = [...deltaItems].sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const largest = sortedByMagnitude[0];

  let keyDriver = 'No substantial indicator changes detected across the comparison window.';
  let primaryConcern: string | null = null;

  if (largest && Math.abs(largest.change) >= 4) {
    if (largest.nature === 'negative') {
      keyDriver = `The primary negative shift was a ${Math.abs(largest.change)}% ${
        largest.key === 'pollution' ? 'increase in pollution reports' : 'drop in ' + largest.indicator
      }.`;
      primaryConcern = largest.indicator;
    } else if (largest.nature === 'positive') {
      keyDriver = `The primary positive development was a ${largest.change}% improvement in ${largest.indicator}.`;
    }
  }

  // Generate scientific narrative
  const deteriorating = deltaItems.filter((d) => d.nature === 'negative');
  const improving = deltaItems.filter((d) => d.nature === 'positive');

  let summary = `Over the ${periodLabel}, indicator stability is consistent with baseline monitoring.`;
  if (deteriorating.length > 0 && improving.length === 0) {
    summary = `Over the ${periodLabel}, ${deteriorating
      .map((d) => `${d.indicator} (${d.change > 0 ? '+' : ''}${d.change}%)`)
      .join(' and ')} drove overall condition lower.`;
  } else if (improving.length > 0 && deteriorating.length === 0) {
    summary = `Over the ${periodLabel}, positive gains in ${improving
      .map((d) => `${d.indicator} (+${d.change}%)`)
      .join(' and ')} contributed to ecosystem recovery.`;
  } else if (improving.length > 0 && deteriorating.length > 0) {
    summary = `Mixed trajectory: Improvements in ${improving.map((d) => d.indicator).join(', ')} were offset by declines in ${deteriorating
      .map((d) => d.indicator)
      .join(', ')}.`;
  }

  return {
    periodLabel,
    keyDriver,
    summary,
    deltas: deltaItems,
    primaryConcern,
  };
}
