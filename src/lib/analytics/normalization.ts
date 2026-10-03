/**
 * Safe normalization utility for environmental telemetry and citizen science signals.
 * Maps values to a standard 0 - 100 scale.
 * Handles null, undefined, NaN, infinity, and clamps out-of-range bounds safely.
 */
export function normalizeValue(
  value: number | null | undefined,
  minBound: number,
  maxBound: number,
  inverted = false
): number | null {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return null;
  }

  // Prevent divide by zero
  if (minBound === maxBound) {
    return 50;
  }

  // Clamp within bounds
  const clamped = Math.max(minBound, Math.min(maxBound, value));
  let normalized = ((clamped - minBound) / (maxBound - minBound)) * 100;

  if (inverted) {
    normalized = 100 - normalized;
  }

  return Math.round(normalized * 10) / 10;
}

/**
 * Normalizes Dissolved Oxygen (DO mg/L)
 * Typical healthy freshwater streams: 7.0 - 12.0 mg/L (>8 is pristine, <4 is hypoxic/attention)
 */
export function normalizeDissolvedOxygen(mgL: number | null | undefined): number | null {
  return normalizeValue(mgL, 2.0, 11.0, false);
}

/**
 * Normalizes pH (ideal neutral to slightly alkaline 6.5 - 8.5)
 */
export function normalizePH(ph: number | null | undefined): number | null {
  if (ph === null || ph === undefined || isNaN(ph)) return null;
  // Optimal pH around 7.4. Penalize distance from 7.4
  const optimal = 7.4;
  const deviation = Math.abs(ph - optimal);
  const score = Math.max(0, 100 - deviation * 35);
  return Math.round(score * 10) / 10;
}

/**
 * Normalizes Turbidity (NTU) - lower is cleaner (inverted)
 * < 5 NTU crystal clear, > 50 NTU highly turbid
 */
export function normalizeTurbidity(ntu: number | null | undefined): number | null {
  return normalizeValue(ntu, 1.0, 60.0, true);
}

/**
 * Normalizes Nitrate (NO3- mg/L) - lower is cleaner (inverted)
 * < 2 mg/L pristine, > 25 mg/L agricultural/sewage runoff
 */
export function normalizeNitrates(mgL: number | null | undefined): number | null {
  return normalizeValue(mgL, 0.5, 25.0, true);
}

/**
 * Normalizes Electrical Conductivity (µS/cm) - lower is generally cleaner (inverted)
 * 100 - 500 normal freshwater, > 1500 urban runoff/saline influx
 */
export function normalizeConductivity(microS: number | null | undefined): number | null {
  return normalizeValue(microS, 80, 1800, true);
}
