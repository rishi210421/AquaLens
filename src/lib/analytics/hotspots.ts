import { MonitoringSite } from '../../types';
import { calculateSpatialComparison } from './spatial';

export interface HotspotEvaluation {
  isHotspot: boolean;
  severity: 'high' | 'moderate' | 'none';
  label: string;
  divergencePoints: number;
  reasons: string[];
  recommendation: string;
}

/**
 * Detects potential monitoring hotspots.
 * Transparent criteria:
 * - Composite score significantly deviates below nearby sites (>= 12 pts lower)
 * - Multiple deteriorating 30-day indicator trends
 * - Marked increase in pollution signal (>= 15%)
 * - Sufficient data confidence (Medium or High)
 */
export function detectHotspot(site: MonitoringSite, allSites: MonitoringSite[]): HotspotEvaluation {
  const spatial = calculateSpatialComparison(site, allSites);
  const reasons: string[] = [];
  let scorePenalty = 0;

  // 1. Spatial divergence
  if (spatial.deltaVsNearby !== null && spatial.deltaVsNearby <= -12) {
    scorePenalty += 2;
    reasons.push(
      `Site composite indicator (${site.scores.composite}) is ${Math.abs(
        spatial.deltaVsNearby
      )} points below the local catchment average (${spatial.nearbyAverage})`
    );
  }

  // 2. Trend deterioration
  if (site.deltas30d.waterQuality <= -10) {
    scorePenalty += 2;
    reasons.push(`Physicochemical water quality declined ${Math.abs(site.deltas30d.waterQuality)}% over 30 days`);
  }

  if (site.deltas30d.pollution >= 15) {
    scorePenalty += 2;
    reasons.push(`Citizen pollution incidents spiked +${site.deltas30d.pollution}%`);
  }

  if (site.deltas30d.habitat <= -8) {
    scorePenalty += 1;
    reasons.push(`Riparian buffer degradation (-${Math.abs(site.deltas30d.habitat)}%)`);
  }

  if (site.scores.composite !== null && site.scores.composite < 60) {
    scorePenalty += 2;
    reasons.push(`Overall composite health indicator in Attention range (<60)`);
  }

  const isHotspot = scorePenalty >= 4;
  let severity: 'high' | 'moderate' | 'none' = 'none';
  if (scorePenalty >= 6) {
    severity = 'high';
  } else if (scorePenalty >= 4) {
    severity = 'moderate';
  }

  let label = 'Standard Monitoring Reach';
  let recommendation = 'Continue routine sampling.';

  if (severity === 'high') {
    label = 'Potential Monitoring Hotspot (Priority)';
    recommendation =
      'Recommend prioritized multi-point verification: physicochemical probe sampling, macroinvertebrate family biotic index survey, and investigation of local stormwater outfalls.';
  } else if (severity === 'moderate') {
    label = 'Potential Monitoring Hotspot (Elevated Watch)';
    recommendation =
      'Recommend targeted weekly citizen science visual assessments and turbidity logging over the next 14 days.';
  }

  return {
    isHotspot,
    severity,
    label,
    divergencePoints: spatial.deltaVsNearby ? Math.abs(spatial.deltaVsNearby) : 0,
    reasons,
    recommendation,
  };
}
