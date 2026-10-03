import { MonitoringSite } from '../../types';

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface SpatialComparison {
  siteScore: number | null;
  nearbyAverage: number | null;
  streamAverage: number | null;
  cityAverage: number | null;
  deltaVsNearby: number | null;
  deltaVsStream: number | null;
  nearbySitesCount: number;
  spatialOutlier: boolean;
  narrative: string;
}

/**
 * Compares a site against its geographic neighbors (within 15km) and parent stream.
 */
export function calculateSpatialComparison(
  targetSite: MonitoringSite,
  allSites: MonitoringSite[],
  maxRadiusKm = 15
): SpatialComparison {
  const currentScore = targetSite.scores.composite;

  // Nearby sites
  const nearby = allSites.filter(
    (s) => s.id !== targetSite.id && calculateDistanceKm(targetSite.lat, targetSite.lng, s.lat, s.lng) <= maxRadiusKm
  );

  const nearbyWithScores = nearby.filter((s) => s.scores.composite !== null);
  const nearbyAverage =
    nearbyWithScores.length > 0
      ? Math.round(
          (nearbyWithScores.reduce((acc, s) => acc + (s.scores.composite || 0), 0) / nearbyWithScores.length) * 10
        ) / 10
      : null;

  // Same stream sites
  const streamSites = allSites.filter((s) => s.streamId === targetSite.streamId && s.scores.composite !== null);
  const streamAverage =
    streamSites.length > 0
      ? Math.round((streamSites.reduce((acc, s) => acc + (s.scores.composite || 0), 0) / streamSites.length) * 10) / 10
      : null;

  // Same city sites
  const citySites = allSites.filter((s) => s.city === targetSite.city && s.scores.composite !== null);
  const cityAverage =
    citySites.length > 0
      ? Math.round((citySites.reduce((acc, s) => acc + (s.scores.composite || 0), 0) / citySites.length) * 10) / 10
      : null;

  const deltaVsNearby =
    currentScore !== null && nearbyAverage !== null ? Math.round((currentScore - nearbyAverage) * 10) / 10 : null;

  const deltaVsStream =
    currentScore !== null && streamAverage !== null ? Math.round((currentScore - streamAverage) * 10) / 10 : null;

  const spatialOutlier = deltaVsNearby !== null && Math.abs(deltaVsNearby) >= 12;

  let narrative = 'Composite indicator aligns within normal bounds of surrounding stream reaches.';
  if (deltaVsNearby !== null) {
    if (deltaVsNearby <= -12) {
      narrative = `This site scores ${Math.abs(deltaVsNearby)} points lower than nearby monitored reaches (${nearbyAverage}/100), identifying it as a localized spatial low-point.`;
    } else if (deltaVsNearby >= 12) {
      narrative = `This site scores ${deltaVsNearby} points higher than surrounding reaches (${nearbyAverage}/100), indicating a well-buffered ecological refuge.`;
    }
  }

  return {
    siteScore: currentScore,
    nearbyAverage,
    streamAverage,
    cityAverage,
    deltaVsNearby,
    deltaVsStream,
    nearbySitesCount: nearbyWithScores.length,
    spatialOutlier,
    narrative,
  };
}
