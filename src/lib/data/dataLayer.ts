import {
  MonitoringSite,
  CitizenObservation,
  StreamInfo,
  CityInfo,
  TimeSeriesPoint,
  HealthStatus,
  ConfidenceLevel,
} from '../../types';
import {
  CITIES,
  STREAMS,
  INITIAL_SITES,
  INITIAL_OBSERVATIONS,
  generateTimeSeriesForSite,
} from '../../data/mockDatabase';
import { validateObservation } from '../analytics/validation';
import { calculateCompositeIndicator } from '../analytics/compositeScore';
import { calculateConfidence } from '../analytics/confidence';

// In-memory persistent state for the session
let sitesState: MonitoringSite[] = [...INITIAL_SITES];
let observationsState: CitizenObservation[] = [...INITIAL_OBSERVATIONS];
const timeSeriesCache = new Map<string, TimeSeriesPoint[]>();

export function getCities(): CityInfo[] {
  return CITIES.map((city) => {
    const citySites = sitesState.filter((s) => s.city === city.name);
    const validScores = citySites.filter((s) => s.scores.composite !== null).map((s) => s.scores.composite!);
    const avg = validScores.length > 0 ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 : 0;
    return {
      ...city,
      siteCount: citySites.length,
      averageScore: avg,
      healthySites: citySites.filter((s) => s.status === 'healthy').length,
      watchSites: citySites.filter((s) => s.status === 'watch').length,
      attentionSites: citySites.filter((s) => s.status === 'attention').length,
      insufficientSites: citySites.filter((s) => s.status === 'insufficient').length,
    };
  });
}

export function getStreams(city?: string): StreamInfo[] {
  if (!city || city === 'all') return STREAMS;
  return STREAMS.filter((s) => s.city.toLowerCase() === city.toLowerCase());
}

export interface SiteFilters {
  city?: string;
  streamId?: string;
  status?: string;
  search?: string;
  confidence?: string;
  hotspotsOnly?: boolean;
}

export function getSites(filters: SiteFilters = {}): MonitoringSite[] {
  return sitesState.filter((site) => {
    if (filters.city && filters.city !== 'all' && site.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.streamId && filters.streamId !== 'all' && site.streamId !== filters.streamId) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && site.status !== filters.status) {
      return false;
    }
    if (filters.confidence && filters.confidence !== 'all' && site.confidence !== filters.confidence) {
      return false;
    }
    if (filters.hotspotsOnly && !site.isHotspot) {
      return false;
    }
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase();
      const match =
        site.name.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q) ||
        site.streamName.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.landUse.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function getSiteById(id: string): MonitoringSite | undefined {
  return sitesState.find((s) => s.id === id);
}

export function getObservations(filters: {
  city?: string;
  siteId?: string;
  validationStatus?: string;
  search?: string;
} = {}): CitizenObservation[] {
  return observationsState.filter((obs) => {
    if (filters.city && filters.city !== 'all' && obs.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    if (filters.siteId && filters.siteId !== 'all' && obs.siteId !== filters.siteId) {
      return false;
    }
    if (
      filters.validationStatus &&
      filters.validationStatus !== 'all' &&
      obs.validationStatus !== filters.validationStatus
    ) {
      return false;
    }
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase();
      const match =
        obs.siteName.toLowerCase().includes(q) ||
        obs.streamName.toLowerCase().includes(q) ||
        obs.authorName.toLowerCase().includes(q) ||
        (obs.notes && obs.notes.toLowerCase().includes(q)) ||
        obs.waterAppearance.toLowerCase().includes(q) ||
        obs.pollution.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function getTimeSeries(siteId: string, range: '7d' | '30d' | '90d' | '1y' = '90d'): TimeSeriesPoint[] {
  if (!timeSeriesCache.has(siteId)) {
    timeSeriesCache.set(siteId, generateTimeSeriesForSite(siteId));
  }
  const series = timeSeriesCache.get(siteId)!;
  const countMap: Record<string, number> = {
    '7d': 3,
    '30d': 6,
    '90d': 12,
    '1y': 24,
  };
  const count = countMap[range] || 12;
  return series.slice(-count);
}

export function addObservation(
  newObsData: Omit<CitizenObservation, 'id' | 'validationStatus' | 'validationFlags'>
): { observation: CitizenObservation; validation: ReturnType<typeof validateObservation> } {
  const validation = validateObservation(newObsData);

  const observation: CitizenObservation = {
    ...newObsData,
    id: `obs-user-${Date.now()}`,
    validationStatus: validation.status,
    validationFlags: validation.flags,
  };

  // Prepend to observations list
  observationsState = [observation, ...observationsState];

  // Update associated site's observation count and recency
  const siteIndex = sitesState.findIndex((s) => s.id === observation.siteId);
  if (siteIndex >= 0) {
    const site = sitesState[siteIndex];
    const newCount = site.observationCount + 1;
    const newRecencyDays = 0;
    const conf = calculateConfidence({
      observationCount: newCount,
      recencyDays: newRecencyDays,
      indicatorsAvailable: site.confidenceDetails.indicatorsAvailable,
      totalIndicators: 5,
    });

    sitesState[siteIndex] = {
      ...site,
      observationCount: newCount,
      lastObservationDate: new Date().toISOString().split('T')[0],
      confidence: conf.level,
      confidenceDetails: conf,
    };
  }

  return { observation, validation };
}

export interface DashboardSummary {
  totalSites: number;
  totalObservations: number;
  healthySites: number;
  watchSites: number;
  attentionSites: number;
  insufficientSites: number;
  averageScore: number;
  dataCoveragePercent: number;
  hotspotsCount: number;
  highConfidenceSites: number;
}

export function getDashboardSummary(city?: string, streamId?: string): DashboardSummary {
  const filteredSites = getSites({ city, streamId });
  const validScores = filteredSites.filter((s) => s.scores.composite !== null).map((s) => s.scores.composite!);
  const avg = validScores.length > 0 ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10 : 0;

  const totalObs = filteredSites.reduce((sum, s) => sum + s.observationCount, 0);
  const avgCoverage =
    filteredSites.length > 0
      ? Math.round(filteredSites.reduce((sum, s) => sum + s.completeness.overall, 0) / filteredSites.length)
      : 0;

  return {
    totalSites: filteredSites.length,
    totalObservations: totalObs,
    healthySites: filteredSites.filter((s) => s.status === 'healthy').length,
    watchSites: filteredSites.filter((s) => s.status === 'watch').length,
    attentionSites: filteredSites.filter((s) => s.status === 'attention').length,
    insufficientSites: filteredSites.filter((s) => s.status === 'insufficient').length,
    averageScore: avg,
    dataCoveragePercent: avgCoverage,
    hotspotsCount: filteredSites.filter((s) => s.isHotspot).length,
    highConfidenceSites: filteredSites.filter((s) => s.confidence === 'High').length,
  };
}
