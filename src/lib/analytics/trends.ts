import { TimeSeriesPoint } from '../../types';

export interface TrendResult {
  currentValue: number | null;
  previousValue: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  direction: 'improving' | 'declining' | 'stable' | 'insufficient';
  isReliable: boolean;
  message: string;
}

/**
 * Calculates dynamic trend between two periods in a time-series.
 * Supports configurable window slices (e.g. 7, 30, 90, 365 days).
 */
export function calculateTrend(
  points: TimeSeriesPoint[],
  indicatorKey: keyof Pick<TimeSeriesPoint, 'compositeScore' | 'waterQuality' | 'biodiversity' | 'habitat' | 'citizenSignal'> = 'compositeScore'
): TrendResult {
  const validPoints = points
    .filter((p) => p[indicatorKey] !== null && p[indicatorKey] !== undefined && !isNaN(p[indicatorKey] as number))
    .map((p) => ({ date: p.date, val: p[indicatorKey] as number }));

  if (validPoints.length < 2) {
    return {
      currentValue: validPoints[0]?.val ?? null,
      previousValue: null,
      absoluteChange: null,
      percentageChange: null,
      direction: 'insufficient',
      isReliable: false,
      message: 'Not enough data points to establish a reliable temporal trend.',
    };
  }

  // Sort chronologically
  validPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const midIndex = Math.floor(validPoints.length / 2);
  const prevHalf = validPoints.slice(0, midIndex);
  const currHalf = validPoints.slice(midIndex);

  const prevAvg = prevHalf.reduce((acc, p) => acc + p.val, 0) / prevHalf.length;
  const currAvg = currHalf.reduce((acc, p) => acc + p.val, 0) / currHalf.length;

  const absoluteChange = Math.round((currAvg - prevAvg) * 10) / 10;
  const percentageChange = prevAvg > 0 ? Math.round(((currAvg - prevAvg) / prevAvg) * 1000) / 10 : 0;

  let direction: 'improving' | 'declining' | 'stable' = 'stable';
  if (percentageChange >= 3) {
    direction = 'improving';
  } else if (percentageChange <= -3) {
    direction = 'declining';
  }

  let message = `Score remains stable (Δ ${percentageChange > 0 ? '+' : ''}${percentageChange}%).`;
  if (direction === 'improving') {
    message = `Improving trend: +${Math.abs(percentageChange)}% over the comparison window.`;
  } else if (direction === 'declining') {
    message = `Declining trend: -${Math.abs(percentageChange)}% over the comparison window.`;
  }

  return {
    currentValue: Math.round(currAvg * 10) / 10,
    previousValue: Math.round(prevAvg * 10) / 10,
    absoluteChange,
    percentageChange,
    direction,
    isReliable: validPoints.length >= 4,
    message,
  };
}
