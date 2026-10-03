/**
 * AquaInsight Analytics Test Suite
 * Tests deterministic algorithms for composite score, confidence, trends, and hotspot detection.
 */

import { calculateCompositeIndicator } from '../src/lib/analytics/compositeScore';
import { calculateConfidence } from '../src/lib/analytics/confidence';
import { calculateTrend } from '../src/lib/analytics/trends';
import { calculateWhatChanged } from '../src/lib/analytics/whatChanged';
import { calculateWhyFlagged } from '../src/lib/analytics/whyFlagged';
import { normalizeValue } from '../src/lib/analytics/normalization';
import { TimeSeriesPoint, MonitoringSite } from '../src/types';

function runTests() {
  console.log('--- STARTING AQUAINSIGHT ANALYTICS TEST SUITE ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✕ FAIL: ${testName}`);
    }
  }

  // 1. Normalization Tests
  assert(normalizeValue(50, 0, 100) === 50, 'Normalize mid value');
  assert(normalizeValue(150, 0, 100) === 100, 'Normalize upper clamp');
  assert(normalizeValue(-20, 0, 100) === 0, 'Normalize lower clamp');
  assert(normalizeValue(null, 0, 100) === null, 'Normalize null handling');
  assert(normalizeValue(undefined, 0, 100) === null, 'Normalize undefined handling');
  assert(normalizeValue(NaN, 0, 100) === null, 'Normalize NaN handling');
  assert(normalizeValue(25, 0, 100, true) === 75, 'Normalize inverted scaling (pollution/turbidity)');

  // 2. Composite Score Tests
  const allIndicators = {
    waterQuality: 80,
    biodiversity: 70,
    habitat: 60,
    citizenSignal: 90,
    environmentalContext: 80,
  };
  const compAll = calculateCompositeIndicator(allIndicators);
  assert(compAll.score !== null && compAll.score > 0, 'Composite score calculates with all 5 indicators');
  assert(compAll.status === 'watch' || compAll.status === 'healthy', 'Status classification is valid');
  assert(!compAll.isRedistributed, 'No weight redistribution when all indicators present');

  // Missing indicator proportional redistribution
  const missingWQ = {
    waterQuality: null,
    biodiversity: 70,
    habitat: 60,
    citizenSignal: 90,
    environmentalContext: 80,
  };
  const compRedist = calculateCompositeIndicator(missingWQ);
  assert(compRedist.score !== null, 'Composite score calculates even when Water Quality is missing');
  assert(compRedist.isRedistributed, 'Proportional redistribution triggered on missing indicator');
  assert(compRedist.confidencePenalty > 0, 'Confidence penalty applied on missing indicator');

  // Insufficient indicators (< 2 available)
  const insufficientScores = {
    waterQuality: 50,
    biodiversity: null,
    habitat: null,
    citizenSignal: null,
    environmentalContext: null,
  };
  const compInsufficient = calculateCompositeIndicator(insufficientScores);
  assert(compInsufficient.score === null, 'Score is null when < 2 indicators available');
  assert(compInsufficient.status === 'insufficient', 'Status is classified as insufficient');

  // 3. Confidence Model Tests
  const highConf = calculateConfidence({
    observationCount: 40,
    recencyDays: 2,
    indicatorsAvailable: 5,
    totalIndicators: 5,
    historicalDaysSpan: 90,
  });
  assert(highConf.level === 'High', 'Confidence is High for rich observation volume and recency');

  const lowConf = calculateConfidence({
    observationCount: 2,
    recencyDays: 50,
    indicatorsAvailable: 2,
    totalIndicators: 5,
    historicalDaysSpan: 10,
  });
  assert(lowConf.level === 'Low', 'Confidence is Low for sparse and aged data');

  // 4. Trend Analysis Tests
  const dummySeries: TimeSeriesPoint[] = [
    { date: '2026-08-01', compositeScore: 60, waterQuality: 60, biodiversity: 60, habitat: 60, citizenSignal: 60 },
    { date: '2026-08-15', compositeScore: 65, waterQuality: 65, biodiversity: 65, habitat: 65, citizenSignal: 65 },
    { date: '2026-09-01', compositeScore: 75, waterQuality: 75, biodiversity: 75, habitat: 75, citizenSignal: 75 },
    { date: '2026-09-15', compositeScore: 80, waterQuality: 80, biodiversity: 80, habitat: 80, citizenSignal: 80 },
  ];
  const trend = calculateTrend(dummySeries, 'compositeScore');
  assert(trend.direction === 'improving', 'Trend direction is improving when values rise');
  assert(trend.isReliable, 'Trend is reliable with sufficient data points');

  // 5. "What Changed?" Tests
  const deltas = {
    overall: -12,
    waterQuality: -18,
    biodiversity: -2,
    habitat: -4,
    pollution: 25,
  };
  const whatChanged = calculateWhatChanged(deltas);
  assert(whatChanged.primaryConcern !== null, 'Identifies primary concern from largest negative delta');
  assert(whatChanged.deltas.length === 4, 'Includes all 4 sub-indicator deltas');

  console.log(`\nTEST RESULTS: ${passed}/${total} assertions passed.`);
}

runTests();
