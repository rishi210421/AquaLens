import { ExecutiveReport, MonitoringSite, CityInfo } from '../../types';
import { calculateWhatChanged } from '../analytics/whatChanged';
import { calculateWhyFlagged } from '../analytics/whyFlagged';

export function generateSiteReport(site: MonitoringSite, dateRange = 'Last 90 Days'): ExecutiveReport {
  const whatChanged = calculateWhatChanged(site.deltas30d, dateRange);
  const whyFlagged = calculateWhyFlagged(site);

  const indicators = [
    {
      name: 'Water Quality',
      score: site.scores.waterQuality,
      trend: `${site.deltas30d.waterQuality > 0 ? '+' : ''}${site.deltas30d.waterQuality}%`,
      delta: site.deltas30d.waterQuality,
    },
    {
      name: 'Biodiversity',
      score: site.scores.biodiversity,
      trend: `${site.deltas30d.biodiversity > 0 ? '+' : ''}${site.deltas30d.biodiversity}%`,
      delta: site.deltas30d.biodiversity,
    },
    {
      name: 'Habitat Condition',
      score: site.scores.habitat,
      trend: `${site.deltas30d.habitat > 0 ? '+' : ''}${site.deltas30d.habitat}%`,
      delta: site.deltas30d.habitat,
    },
    {
      name: 'Citizen Signal',
      score: site.scores.citizenSignal,
      trend: `${site.deltas30d.pollution > 0 ? '+' : ''}${site.deltas30d.pollution}% (Incidents)`,
      delta: site.deltas30d.pollution,
    },
    {
      name: 'Environmental Context',
      score: site.scores.environmentalContext,
      trend: 'Stable',
      delta: 0,
    },
  ];

  return {
    title: `Stream Health Assessment: ${site.name}`,
    generatedAt: new Date().toISOString().split('T')[0],
    targetType: 'site',
    targetName: `${site.name} (${site.streamName}, ${site.city})`,
    dateRange,
    overallScore: site.scores.composite,
    status: site.status,
    confidence: site.confidence,
    dataCompleteness: site.completeness.overall,
    keyChanges: [whatChanged.keyDriver, whatChanged.summary],
    flaggedFactors: whyFlagged.factors.map((f) => `${f.factor}: ${f.evidence}`),
    indicators,
    oneHealthSummary: `Urban stream condition directly interfaces with surrounding biodiversity corridors and human residential spaces. At this reach (${site.landUse}), observed shifts in dissolved oxygen and stormwater runoff can cascade into altered benthic insect richness and altered vector ecology. Environmental evidence should be interpreted alongside municipal catchment data.`,
    actionableRecommendations: [
      whyFlagged.recommendedAction,
      'Maintain bi-weekly citizen science visual clarity and macroinvertebrate sampling.',
      'Correlate upcoming storm event hydrographs with catchment turbidity spikes.',
    ],
    dataSources: [
      'OneAquaHealth Health Assessment Framework (2026)',
      'AquaLens Citizen Science Stream Telemetry',
      'European Environment Agency (EEA) Freshwater Benchmark Ranges',
    ],
    limitations: [
      'Indicator weights are based on the AquaLens prototype composite methodology and are not official regulatory thresholds.',
      'Field data includes citizen observations that are verified through automated sensory consistency heuristics.',
      'Chemical analysis does not encompass micro-pollutants or heavy metals unless explicitly sampled by certified laboratories.',
    ],
    syntheticDataDisclosure:
      'Notice: This prototype demonstration uses simulated/synthetic environmental time-series data.',
  };
}

export function generateCityReport(city: CityInfo, sites: MonitoringSite[], dateRange = 'Last 90 Days'): ExecutiveReport {
  const citySites = sites.filter((s) => s.city.toLowerCase() === city.name.toLowerCase());
  const validScores = citySites.filter((s) => s.scores.composite !== null).map((s) => s.scores.composite!);
  const avgScore = validScores.length > 0 ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 : 0;
  const avgCompleteness = Math.round(citySites.reduce((sum, s) => sum + s.completeness.overall, 0) / (citySites.length || 1));

  const hotspots = citySites.filter((s) => s.isHotspot);

  return {
    title: `Municipal Catchment Health Overview: ${city.name}`,
    generatedAt: new Date().toISOString().split('T')[0],
    targetType: 'city',
    targetName: `${city.name}, ${city.country}`,
    dateRange,
    overallScore: avgScore,
    status: avgScore >= 80 ? 'healthy' : avgScore >= 60 ? 'watch' : 'attention',
    confidence: 'High',
    dataCompleteness: avgCompleteness,
    keyChanges: [
      `${city.name} urban stream network spans ${city.streamCount} primary waterways across ${citySites.length} active monitoring sites.`,
      `${citySites.filter((s) => s.status === 'healthy').length} sites classified as Healthy, ${citySites.filter((s) => s.status === 'watch').length} in Watch band, and ${citySites.filter((s) => s.status === 'attention').length} in Attention tier.`,
    ],
    flaggedFactors: hotspots.map((h) => `${h.name} (${h.streamName}): ${h.hotspotReason || 'Identified as spatial anomaly'}`),
    indicators: [
      { name: 'Catchment Average Score', score: avgScore, trend: 'Evaluated across all streams', delta: 0 },
      { name: 'Active Monitoring Reaches', score: citySites.length, trend: `${city.streamCount} streams monitored`, delta: 0 },
      { name: 'Identified Monitoring Hotspots', score: hotspots.length, trend: 'Requires targeted field audit', delta: hotspots.length },
    ],
    oneHealthSummary: `Municipal freshwater networks across ${city.name} are critical for urban heat mitigation, biodiversity corridors, and public psychological well-being. Preserving stream ecological integrity prevents urban waterways from degenerating into polluted channels or vector hotspots.`,
    actionableRecommendations: [
      'Prioritize infrastructure maintenance and outfall inspection at identified monitoring hotspots.',
      'Sustain municipal citizen science partnerships to expand coverage in suburban headwater tributaries.',
      'Implement nature-based solutions (riparian buffer planting, daylighted swales) to absorb urban stormwater surges.',
    ],
    dataSources: [
      'OneAquaHealth Citizen Science Network',
      'Municipal Open Geospatial and Catchment Infrastructure',
    ],
    limitations: [
      'Aggregated city scores represent mean indicators across diverse stream orders and cannot replace reach-specific assessments.',
      'Weather variability significantly influences seasonal turbidity and nutrient transport.',
    ],
    syntheticDataDisclosure:
      'Notice: This prototype demonstration uses simulated/synthetic environmental data.',
  };
}

/**
 * Downloads a structured array as a clean CSV file in the browser.
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
