import { CitizenObservation, ValidationStatus } from '../../types';

export interface ValidationReport {
  status: ValidationStatus;
  flags: string[];
  isValid: boolean;
  score: number; // 0-100 quality confidence
}

/**
 * Validates a citizen or field observation against observational consistency rules.
 * Does not discard data; flags records transparently for quality scoring.
 */
export function validateObservation(obs: Partial<CitizenObservation>): ValidationReport {
  const flags: string[] = [];
  let score = 100;

  // 1. Mandatory identifiers
  if (!obs.siteId) {
    flags.push('Missing associated monitoring site identifier');
    score -= 30;
  }

  if (!obs.timestamp) {
    flags.push('Missing observation timestamp');
    score -= 25;
  } else {
    const obsTime = new Date(obs.timestamp).getTime();
    const now = Date.now() + 60000; // allow 1 min clock skew
    if (isNaN(obsTime)) {
      flags.push('Invalid timestamp format');
      score -= 20;
    } else if (obsTime > now) {
      flags.push('Timestamp cannot be in the future');
      score -= 25;
    }
  }

  if (!obs.authorName || obs.authorName.trim().length < 2) {
    flags.push('Author name or observer ID omitted');
    score -= 10;
  }

  // 2. Physical sensory consistency
  if (!obs.waterAppearance) {
    flags.push('Water appearance not recorded');
    score -= 15;
  }

  if (!obs.flowCondition) {
    flags.push('Flow condition not recorded');
    score -= 15;
  }

  // 3. Cross-field consistency checks
  if (obs.waterAppearance === 'Crystal Clear' && obs.pollution === 'Industrial Effluent') {
    flags.push('Contradictory sensory report: "Crystal Clear" appearance with "Industrial Effluent"');
    score -= 20;
  }

  if (obs.waterAppearance === 'Crystal Clear' && obs.odor === 'Sewage / Stagnant') {
    flags.push('Unusual combination: "Crystal Clear" appearance with strong sewage odor');
    score -= 10;
  }

  if (obs.flowCondition === 'Dry / No Flow' && obs.waterAppearance === 'Foamy') {
    flags.push('Potential anomaly: Dry bed reported alongside foamy surface');
    score -= 15;
  }

  // Determine status
  let status: ValidationStatus = 'Validated';
  if (score < 50 || !obs.siteId || !obs.timestamp) {
    status = 'Incomplete';
  } else if (score < 80 || flags.length > 0) {
    status = 'Needs Review';
  }

  return {
    status,
    flags,
    isValid: status !== 'Incomplete',
    score: Math.max(0, score),
  };
}
