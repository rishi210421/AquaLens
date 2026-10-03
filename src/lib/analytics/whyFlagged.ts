import { MonitoringSite } from '../../types';

export interface FlaggedFactor {
  id: string;
  factor: string;
  category: 'Water Quality' | 'Habitat' | 'Biodiversity' | 'Citizen Reports' | 'Data Gap';
  severity: 'alert' | 'warning' | 'info';
  metric: string;
  evidence: string;
}

export interface WhyFlaggedResult {
  isFlagged: boolean;
  status: MonitoringSite['status'];
  headline: string;
  confidence: MonitoringSite['confidence'];
  factors: FlaggedFactor[];
  recommendedAction: string;
}

/**
 * Deterministically explains why a site has been classified as Watch or Attention.
 * Provides transparent ecological and observational rationale.
 */
export function calculateWhyFlagged(site: MonitoringSite): WhyFlaggedResult {
  const isFlagged = site.status === 'watch' || site.status === 'attention' || site.isHotspot;
  const factors: FlaggedFactor[] = [];

  // Check 1: Composite score range
  if (site.scores.composite !== null) {
    if (site.scores.composite < 60) {
      factors.push({
        id: 'composite-low',
        factor: 'Composite Health Score below Attention threshold',
        category: 'Water Quality',
        severity: 'alert',
        metric: `${site.scores.composite} / 100`,
        evidence: `Score is in the lowest tier (<60), indicating multi-stressor pressure on the stream stretch.`,
      });
    } else if (site.scores.composite < 80) {
      factors.push({
        id: 'composite-watch',
        factor: 'Composite Health Score in Watch band',
        category: 'Water Quality',
        severity: 'warning',
        metric: `${site.scores.composite} / 100`,
        evidence: `Ecosystem indicators show mild stress and require heightened temporal surveillance.`,
      });
    }
  }

  // Check 2: Water Quality decline
  if (site.deltas30d.waterQuality <= -8) {
    factors.push({
      id: 'water-decline',
      factor: 'Marked Water Quality Degradation',
      category: 'Water Quality',
      severity: site.deltas30d.waterQuality <= -15 ? 'alert' : 'warning',
      metric: `${site.deltas30d.waterQuality}% (30-day delta)`,
      evidence: `Drop in dissolved oxygen saturation, elevated turbidity, or nutrient enrichment observed.`,
    });
  }

  // Check 3: Pollution reports spike
  if (site.deltas30d.pollution >= 15) {
    factors.push({
      id: 'pollution-spike',
      factor: 'Surge in Citizen-Reported Pollution Incidents',
      category: 'Citizen Reports',
      severity: 'alert',
      metric: `+${site.deltas30d.pollution}% reports`,
      evidence: `Multiple recent observations logged solid plastics, wastewater odors, or urban runoff plumes.`,
    });
  }

  // Check 4: Habitat condition drop
  if (site.deltas30d.habitat <= -7) {
    factors.push({
      id: 'habitat-drop',
      factor: 'Riparian Buffer or Bank Erosion',
      category: 'Habitat',
      severity: 'warning',
      metric: `${site.deltas30d.habitat}% delta`,
      evidence: `Observations indicate loss of riparian shading, bank destabilization, or channel siltation.`,
    });
  }

  // Check 5: Biodiversity decline
  if (site.deltas30d.biodiversity <= -6) {
    factors.push({
      id: 'bio-decline',
      factor: 'Macroinvertebrate Taxa Depletion',
      category: 'Biodiversity',
      severity: 'warning',
      metric: `${site.deltas30d.biodiversity}% delta`,
      evidence: `Absence of pollution-sensitive benthic macroinvertebrates (mayflies, caddisflies) noted during surveys.`,
    });
  }

  // Check 6: Spatial Hotspot status
  if (site.isHotspot) {
    factors.push({
      id: 'hotspot-outlier',
      factor: 'Spatial Anomaly vs. Upstream/Downstream Basin',
      category: 'Water Quality',
      severity: 'alert',
      metric: 'Spatial Outlier',
      evidence: site.hotspotReason || `Site indicators diverge significantly from the surrounding catchment average.`,
    });
  }

  // Fallback if flagged reasons were already specified on site record
  if (factors.length === 0 && site.flaggedReasons && site.flaggedReasons.length > 0) {
    site.flaggedReasons.forEach((reason, idx) => {
      factors.push({
        id: `custom-flag-${idx}`,
        factor: reason,
        category: 'Water Quality',
        severity: 'warning',
        metric: 'Field Assessment',
        evidence: `Documented during municipal stream survey.`,
      });
    });
  }

  let headline = 'Site meets standard baseline criteria.';
  let recommendedAction = 'Maintain standard quarterly citizen science and sensory monitoring.';

  if (site.status === 'attention') {
    headline = 'Site requires immediate monitoring attention and multi-parameter field validation.';
    recommendedAction =
      'Schedule on-site physicochemical verification within 7 days, survey benthic macroinvertebrates, and inspect potential stormwater outfalls.';
  } else if (site.status === 'watch') {
    headline = 'Site is under active observation due to borderline indicators or recent downward variance.';
    recommendedAction =
      'Increase citizen observation frequency to weekly and cross-reference with municipal rainfall telemetry.';
  }

  return {
    isFlagged,
    status: site.status,
    headline,
    confidence: site.confidence,
    factors,
    recommendedAction,
  };
}
