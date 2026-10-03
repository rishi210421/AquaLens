export type HealthStatus = 'healthy' | 'watch' | 'attention' | 'insufficient';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type LandUseType =
  | 'Urban Dense'
  | 'Suburban'
  | 'Park / Green Corridor'
  | 'Industrial Fringe'
  | 'Agricultural Buffer';

export interface IndicatorScores {
  composite: number | null;
  waterQuality: number | null;
  biodiversity: number | null;
  habitat: number | null;
  citizenSignal: number | null;
  environmentalContext: number | null;
}

export interface WeightConfig {
  waterQuality: number;
  biodiversity: number;
  habitat: number;
  citizenSignal: number;
  environmentalContext: number;
}

export interface ConfidenceDetails {
  level: ConfidenceLevel;
  score: number; // 0-100
  observationCount: number;
  recencyDays: number;
  indicatorsAvailable: number;
  totalIndicators: number;
  reasons: string[];
}

export interface DataCompleteness {
  overall: number; // 0-100 %
  waterQuality: number;
  biodiversity: number;
  habitat: number;
  citizenObservations: number;
  weather: number;
}

export interface Deltas30d {
  overall: number;
  waterQuality: number;
  biodiversity: number;
  habitat: number;
  pollution: number;
}

export interface MonitoringSite {
  id: string;
  code: string;
  name: string;
  streamId: string;
  streamName: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  altitudeM: number;
  landUse: LandUseType;
  status: HealthStatus;
  scores: IndicatorScores;
  confidence: ConfidenceLevel;
  confidenceDetails: ConfidenceDetails;
  completeness: DataCompleteness;
  lastObservationDate: string;
  observationCount: number;
  isHotspot: boolean;
  hotspotReason?: string;
  deltas30d: Deltas30d;
  flaggedReasons: string[];
  description: string;
}

export interface StreamInfo {
  id: string;
  name: string;
  city: string;
  country: string;
  lengthKm: number;
  basin: string;
  description: string;
  siteCount: number;
  averageScore: number;
}

export interface CityInfo {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  streamCount: number;
  siteCount: number;
  averageScore: number;
  healthySites: number;
  watchSites: number;
  attentionSites: number;
  insufficientSites: number;
}

export type WaterAppearance =
  | 'Crystal Clear'
  | 'Slightly Turbid'
  | 'Heavily Turbid'
  | 'Foamy'
  | 'Oily Sheen'
  | 'Discolored';

export type WaterOdor =
  | 'None'
  | 'Earthy'
  | 'Sewage / Stagnant'
  | 'Chemical'
  | 'Sulfur';

export type FlowCondition =
  | 'Dry / No Flow'
  | 'Trickle'
  | 'Slow Smooth'
  | 'Moderate Stream'
  | 'Rapid / High Torrent';

export type RiparianCondition =
  | 'Pristine Riparian Canopy'
  | 'Moderate Native Buffer'
  | 'Invasive Overgrowth'
  | 'Sparse / Degraded'
  | 'Channelized / Concrete';

export type PollutionType =
  | 'None'
  | 'Plastic / Solid Trash'
  | 'Agricultural Runoff'
  | 'Urban Stormwater'
  | 'Industrial Effluent'
  | 'Construction Silt';

export type ValidationStatus = 'Validated' | 'Needs Review' | 'Incomplete';

export interface CitizenObservation {
  id: string;
  siteId: string;
  siteName: string;
  streamName: string;
  city: string;
  timestamp: string;
  authorName: string;
  authorRole:
    | 'Citizen Scientist'
    | 'Local Monitor'
    | 'University Researcher'
    | 'Municipal Field Agent';
  waterAppearance: WaterAppearance;
  odor: WaterOdor;
  flowCondition: FlowCondition;
  riparianCondition: RiparianCondition;
  pollution: PollutionType;
  macroinvertebrates?: string[];
  wildlife?: string[];
  photoUrl?: string;
  notes?: string;
  validationStatus: ValidationStatus;
  validationFlags: string[];
}

export interface TimeSeriesPoint {
  date: string;
  compositeScore: number | null;
  waterQuality: number | null;
  biodiversity: number | null;
  habitat: number | null;
  citizenSignal: number | null;
  temperatureC?: number;
  rainfallMm?: number;
  dissolvedOxygenMgL?: number;
  pH?: number;
  turbidityNTU?: number;
  conductivityMicroS?: number;
  nitrateMgL?: number;
  observationsCount?: number;
}

export type InsightCategory =
  | 'improving'
  | 'declining'
  | 'stable'
  | 'hotspot'
  | 'data-gap'
  | 'unusual-change';

export type InsightSeverity = 'info' | 'warning' | 'alert' | 'positive';

export interface InsightItem {
  id: string;
  siteId: string;
  siteName: string;
  streamName: string;
  city: string;
  timestamp: string;
  category: InsightCategory;
  severity: InsightSeverity;
  indicator: string;
  changePercent: number;
  confidence: ConfidenceLevel;
  explanation: string;
  actionableNextStep: string;
  oneHealthContext: string;
}

export interface DataSourceMeta {
  id: string;
  name: string;
  url: string;
  license: string;
  retrievedAt: string;
  description: string;
  isSynthetic: boolean;
  dataType: string;
  citation: string;
}

export interface ExecutiveReport {
  title: string;
  generatedAt: string;
  targetType: 'site' | 'city' | 'comparison';
  targetName: string;
  dateRange: string;
  overallScore: number | null;
  status: HealthStatus;
  confidence: ConfidenceLevel;
  dataCompleteness: number;
  keyChanges: string[];
  flaggedFactors: string[];
  indicators: {
    name: string;
    score: number | null;
    trend: string;
    delta: number;
  }[];
  oneHealthSummary: string;
  actionableRecommendations: string[];
  dataSources: string[];
  limitations: string[];
  syntheticDataDisclosure: string;
}
