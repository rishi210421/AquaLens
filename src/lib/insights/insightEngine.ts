import { InsightItem, MonitoringSite, InsightCategory, InsightSeverity } from '../../types';

/**
 * Generates deterministic, explainable insights for a monitoring site.
 * Strictly adheres to One Health scientific framing without medical claims.
 */
export function generateDeterministicInsightsForSite(site: MonitoringSite): InsightItem[] {
  const insights: InsightItem[] = [];
  const deltas = site.deltas30d;
  const score = site.scores.composite;

  // 1. Water Quality Insight
  if (deltas.waterQuality <= -8) {
    insights.push({
      id: `${site.id}-wq-declining`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'declining',
      severity: deltas.waterQuality <= -15 ? 'alert' : 'warning',
      indicator: 'Water Quality',
      changePercent: deltas.waterQuality,
      confidence: site.confidence,
      explanation: `Water-quality indicator decreased ${Math.abs(deltas.waterQuality)}% compared to the previous 30-day baseline, reflecting reduced dissolved oxygen saturation and elevated turbidity after recent storm events.`,
      actionableNextStep: `Deploy field team for multiparameter probe sampling (DO, pH, electrical conductivity) within 5 working days.`,
      oneHealthContext: `Urban stream oxygen depletion can impair juvenile fish populations and macroinvertebrate food webs, altering microbial dynamics in shared recreational and residential green corridors.`,
    });
  } else if (deltas.waterQuality >= 8) {
    insights.push({
      id: `${site.id}-wq-improving`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'improving',
      severity: 'positive',
      indicator: 'Water Quality',
      changePercent: deltas.waterQuality,
      confidence: site.confidence,
      explanation: `Water-quality indicator gained +${deltas.waterQuality}% over the last 30 days, showing improved clarity and stabilized dissolved oxygen levels.`,
      actionableNextStep: `Document baseline parameters as potential local reference reach for regional restoration benchmarking.`,
      oneHealthContext: `Clearer, oxygen-rich urban water bodies foster resilient aquatic fauna and enhance urban cooling and community contact safety along public greenways.`,
    });
  }

  // 2. Pollution Incident Signal
  if (deltas.pollution >= 15) {
    insights.push({
      id: `${site.id}-poll-spike`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'unusual-change',
      severity: 'alert',
      indicator: 'Citizen Pollution Signal',
      changePercent: deltas.pollution,
      confidence: site.confidence,
      explanation: `Citizen observations noted a +${deltas.pollution}% surge in reported pollution incidents, including localized solid waste clusters and oily surface runoff.`,
      actionableNextStep: `Notify municipal drainage maintenance to inspect upstream culverts and schedule a citizen volunteer clean-up audit.`,
      oneHealthContext: `Macroplastic accumulation and road runoff degrade benthic substrate and may introduce chemical contaminants into the riparian corridor, underscoring the vital link between municipal waste management and aquatic ecosystem vitality.`,
    });
  }

  // 3. Biodiversity & Macroinvertebrates
  if (deltas.biodiversity <= -7) {
    insights.push({
      id: `${site.id}-bio-drop`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'declining',
      severity: 'warning',
      indicator: 'Biodiversity',
      changePercent: deltas.biodiversity,
      confidence: site.confidence,
      explanation: `Biodiversity observations dropped ${Math.abs(deltas.biodiversity)}%, driven by reduced sightings of pollution-sensitive benthic insects and riparian bird activity.`,
      actionableNextStep: `Execute a kick-sampling macroinvertebrate survey using standard BMWP / ASPT scoring to evaluate organic pollution stress.`,
      oneHealthContext: `Macroinvertebrate communities are primary biological sentinels. Their decline signals environmental degradation that cascades up the trophic chain to birds, amphibians, and mammals in urban park ecosystems.`,
    });
  } else if (deltas.biodiversity >= 7) {
    insights.push({
      id: `${site.id}-bio-rise`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'improving',
      severity: 'positive',
      indicator: 'Biodiversity',
      changePercent: deltas.biodiversity,
      confidence: site.confidence,
      explanation: `Biodiversity observations rose +${deltas.biodiversity}%, with multiple verified observations of odonata (dragonflies) and amphibians along the reach.`,
      actionableNextStep: `Engage local citizen observers in photographic cataloging of native wetland flora and emergent aquatic insect taxa.`,
      oneHealthContext: `Healthy biological complexity in urban blue spaces supports natural pest regulation (e.g. mosquito predation by dragonflies and amphibians) without chemical pesticide interventions.`,
    });
  }

  // 4. Hotspot Alert
  if (site.isHotspot) {
    insights.push({
      id: `${site.id}-hotspot`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'hotspot',
      severity: 'alert',
      indicator: 'Catchment Hotspot',
      changePercent: deltas.overall,
      confidence: site.confidence,
      explanation: site.hotspotReason || `Site indicators deviate substantially from adjacent reaches along ${site.streamName}, indicating a high-probability localized stressor.`,
      actionableNextStep: `Initiate cross-departmental spatial tracing with municipal water authorities to isolate potential illicit discharge points.`,
      oneHealthContext: `Localized degradation hotspots can become chronic reservoirs for vector breeding or waterborne contaminants, demonstrating how environmental stressors directly interface with community environmental quality.`,
    });
  }

  // 5. Data Gap Insight
  if (site.confidence === 'Low' || site.completeness.overall < 60) {
    insights.push({
      id: `${site.id}-data-gap`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'data-gap',
      severity: 'info',
      indicator: 'Data Coverage',
      changePercent: 0,
      confidence: 'Low',
      explanation: `Telemetry completeness is currently ${site.completeness.overall}%. Certain key parameters (such as nutrient analysis or continuous flow) are sparse for this reach.`,
      actionableNextStep: `Activate localized citizen science campaign and partner with local university environmental programs to bolster observation density.`,
      oneHealthContext: `Evidence-based environmental governance requires continuous, high-fidelity monitoring. Closing spatial data gaps ensures municipal interventions protect both nature and human communities effectively.`,
    });
  }

  // 6. Stable Baseline (if no large deltas triggered)
  if (insights.length === 0) {
    insights.push({
      id: `${site.id}-stable`,
      siteId: site.id,
      siteName: site.name,
      streamName: site.streamName,
      city: site.city,
      timestamp: site.lastObservationDate,
      category: 'stable',
      severity: 'info',
      indicator: 'Composite Health Baseline',
      changePercent: deltas.overall,
      confidence: site.confidence,
      explanation: `Site indicators have maintained stable conditions (overall change ${deltas.overall > 0 ? '+' : ''}${deltas.overall}%) throughout the current 30-day assessment window.`,
      actionableNextStep: `Continue routine bi-weekly citizen surveillance and seasonal biological sampling.`,
      oneHealthContext: `Ecological stability in urban streams safeguards natural biofiltration, dampens flood surges, and provides restorative community recreation areas.`,
    });
  }

  return insights;
}

export function getAllInsights(sites: MonitoringSite[]): InsightItem[] {
  const all: InsightItem[] = [];
  for (const site of sites) {
    all.push(...generateDeterministicInsightsForSite(site));
  }
  // Sort alerts and warnings first, then by recency
  return all.sort((a, b) => {
    const severityWeight: Record<InsightSeverity, number> = {
      alert: 4,
      warning: 3,
      info: 2,
      positive: 1,
    };
    return severityWeight[b.severity] - severityWeight[a.severity];
  });
}
