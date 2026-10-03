import React, { useState, useEffect } from 'react';
import {
  MonitoringSite,
  CitizenObservation,
  TimeSeriesPoint,
} from '../../types';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { TimeSeriesChart } from '../charts/SparklineChart';
import { CompletenessBar } from '../charts/CompletenessBar';
import { calculateWhatChanged } from '../../lib/analytics/whatChanged';
import { calculateWhyFlagged } from '../../lib/analytics/whyFlagged';
import { calculateSpatialComparison } from '../../lib/analytics/spatial';
import { getTimeSeries, getObservations } from '../../lib/data/dataLayer';
import { summarizeSiteTelemetry } from '../../lib/ai/aiService';
import {
  ArrowLeft,
  Calendar,
  Layers,
  MapPin,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  FileText,
  Share2,
  CheckCircle2,
  Info,
  Clock,
  Compass,
  Camera,
} from 'lucide-react';
import { NavRoute } from '../layout/Navbar';

interface SiteDetailViewProps {
  site: MonitoringSite;
  allSites: MonitoringSite[];
  onBack: () => void;
  onRouteChange: (route: NavRoute) => void;
  onOpenAddObservation: () => void;
}

export const SiteDetailView: React.FC<SiteDetailViewProps> = ({
  site,
  allSites,
  onBack,
  onRouteChange,
  onOpenAddObservation,
}) => {
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('90d');
  const [activeChartMetric, setActiveChartMetric] = useState<
    'compositeScore' | 'waterQuality' | 'biodiversity' | 'habitat' | 'citizenSignal'
  >('compositeScore');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);

  // Analytics derived dynamically from site data
  const whatChanged = calculateWhatChanged(site.deltas30d, 'Last 30 Days');
  const whyFlagged = calculateWhyFlagged(site);
  const spatial = calculateSpatialComparison(site, allSites);
  const timeSeries = getTimeSeries(site.id, selectedRange);
  const siteObservations = getObservations({ siteId: site.id });

  // Reset AI summary when site changes
  useEffect(() => {
    setAiSummary(null);
    setAiSource(null);
  }, [site.id]);

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await summarizeSiteTelemetry(site);
      setAiSummary(res.summary);
      setAiSource(res.source);
    } catch (err) {
      console.error('Failed to summarize:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reaches</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRouteChange('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate Executive Report</span>
          </button>
          <button
            onClick={onOpenAddObservation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span>Log Field Observation</span>
          </button>
        </div>
      </div>

      {/* Main Reach Header Block */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-teal-700 font-semibold">{site.code}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium">
                {site.city}, {site.country}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">{site.landUse}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-400">
                {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°W
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {site.name}
            </h1>
            <div className="text-sm font-semibold text-teal-700">{site.streamName}</div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{site.description}</p>
          </div>

          {/* Composite Score Lockup */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl min-w-[220px] text-right md:text-right space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              AquaLens Composite Indicator
            </div>
            <div className="flex items-baseline justify-end gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 tabular-nums">
                {site.scores.composite !== null ? site.scores.composite : '—'}
              </span>
              <span className="text-slate-400 text-sm font-mono">/ 100</span>
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1">
              <HealthBadge status={site.status} showScore={false} />
              <ConfidenceBadge level={site.confidence} score={site.confidenceDetails.score} />
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              Updated {site.lastObservationDate} · {site.observationCount} observations logged
            </div>
          </div>
        </div>

        {/* 5 Core Indicator Quick Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Water Quality (30%)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {site.scores.waterQuality ?? '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              30d Δ:{' '}
              <span
                className={site.deltas30d.waterQuality < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}
              >
                {site.deltas30d.waterQuality > 0 ? '+' : ''}
                {site.deltas30d.waterQuality}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Biodiversity (25%)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {site.scores.biodiversity ?? '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              30d Δ:{' '}
              <span
                className={site.deltas30d.biodiversity < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}
              >
                {site.deltas30d.biodiversity > 0 ? '+' : ''}
                {site.deltas30d.biodiversity}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Habitat Condition (20%)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {site.scores.habitat ?? '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              30d Δ:{' '}
              <span
                className={site.deltas30d.habitat < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}
              >
                {site.deltas30d.habitat > 0 ? '+' : ''}
                {site.deltas30d.habitat}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Citizen Signal (15%)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {site.scores.citizenSignal ?? '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
              Incidents:{' '}
              <span
                className={site.deltas30d.pollution > 10 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}
              >
                {site.deltas30d.pollution > 0 ? '+' : ''}
                {site.deltas30d.pollution}%
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-lg">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Environmental Context (10%)
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {site.scores.environmentalContext ?? '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-0.5">Catchment Buffer</div>
          </div>
        </div>
      </div>

      {/* Feature 1: "What Changed?" & "Why is this site flagged?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* "What Changed?" Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-teal-700 uppercase tracking-wider font-semibold">
                Temporal Shift Analysis
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">What Changed?</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Comparing last 30d</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
            <div className="font-semibold text-slate-900 mb-1">Key Observed Shift:</div>
            {whatChanged.keyDriver}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{whatChanged.summary}</p>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {whatChanged.deltas.map((d) => (
              <div key={d.indicator} className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="font-medium text-slate-700">{d.indicator}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 truncate max-w-[200px] hidden sm:inline">
                    {d.explanation}
                  </span>
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      d.nature === 'negative'
                        ? 'text-rose-600'
                        : d.nature === 'positive'
                        ? 'text-emerald-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {d.change > 0 ? '+' : ''}
                    {d.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "Why is this site flagged?" Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <div className="text-xs font-mono text-rose-600 uppercase tracking-wider font-semibold">
              Root-Cause Attribution
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Why is this site flagged?
            </h2>
          </div>

          {whyFlagged.isFlagged ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <div className="font-semibold">{whyFlagged.headline}</div>
              </div>

              <div className="space-y-2.5">
                {whyFlagged.factors.map((f, i) => (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {i + 1}. {f.factor}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{f.metric}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{f.evidence}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-teal-900">Recommended Action:</div>
                <div className="text-teal-800">{whyFlagged.recommendedAction}</div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-2 bg-emerald-50/40 border border-emerald-200 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-semibold text-slate-900 text-sm">Site Not Currently Flagged</div>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Indicators are currently within normal baseline thresholds (Score: {site.scores.composite}/100).
                Continue routine seasonal monitoring.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature 2: Time-Series Trend Exploration */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Historical Telemetry Trajectory</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Inspect multi-parameter temporal trends across seasonal sampling cycles
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {[
              { key: 'compositeScore', label: 'Composite' },
              { key: 'waterQuality', label: 'Water Quality' },
              { key: 'biodiversity', label: 'Biodiversity' },
              { key: 'habitat', label: 'Habitat' },
              { key: 'citizenSignal', label: 'Citizen Signal' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveChartMetric(m.key as any)}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                  activeChartMetric === m.key
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 pt-2 text-xs">
          <span className="text-slate-400 font-medium">Window:</span>
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRange(r)}
              className={`px-2 py-0.5 font-mono rounded text-[11px] cursor-pointer ${
                selectedRange === r ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="pt-4">
          <TimeSeriesChart
            data={timeSeries}
            height={240}
            metricKey={activeChartMetric}
            metricLabel={activeChartMetric}
            color="#0d9488"
          />
        </div>
      </div>

      {/* Feature 3: Spatial Context & Data Confidence Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Spatial Comparison */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Spatial Comparison</h2>
            <span className="text-[11px] font-mono text-slate-400">Catchment Analysis</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase">Site Score</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {spatial.siteScore ?? '—'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase">Nearby Reaches</div>
              <div className="text-xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
                {spatial.nearbyAverage ?? '—'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ({spatial.nearbySitesCount} sites &lt;15km)
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] text-slate-400 uppercase">Stream Basin Avg</div>
              <div className="text-xl font-bold font-mono text-slate-700 mt-1 tabular-nums">
                {spatial.streamAverage ?? '—'}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">{spatial.narrative}</p>

          {spatial.spatialOutlier && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <span className="font-semibold">Spatial Divergence Notice: </span>
              This reach scores {spatial.deltaVsNearby ? Math.abs(spatial.deltaVsNearby) : 0} points
              away from surrounding reaches, indicating localized catchment pressures rather than a
              basin-wide issue.
            </div>
          )}
        </div>

        {/* Data Confidence & Completeness Model */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Data Confidence & Completeness</h2>
            <ConfidenceBadge level={site.confidence} score={site.confidenceDetails.score} />
          </div>

          {/* Completeness Bar */}
          <CompletenessBar completeness={site.completeness} />

          {/* Evidence Criteria Checklist */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
              Confidence Model Criteria:
            </div>
            {site.confidenceDetails.reasons.map((r, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 text-xs ${
                  r.startsWith('✓')
                    ? 'text-teal-800'
                    : r.startsWith('~')
                    ? 'text-amber-800'
                    : 'text-slate-500'
                }`}
              >
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 4: One Health Insight & Modular AI Engine */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">
              One Health Context & Automated Insights
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Ecosystem & Community Well-Being Synthesis
            </h2>
          </div>

          <button
            onClick={handleGenerateAiSummary}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiLoading ? 'Synthesizing...' : 'Generate Natural Language Summary'}</span>
          </button>
        </div>

        {/* Narrative / AI Box */}
        {aiSummary ? (
          <div className="p-4 bg-slate-950/80 border border-teal-500/40 rounded-lg space-y-2 text-xs leading-relaxed">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-teal-300">Generated Synthesis:</span>
              <span className="font-mono text-slate-400">Engine: {aiSource}</span>
            </div>
            <p className="text-slate-200">{aiSummary}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            In urban freshwater reaches, changes in dissolved oxygen, sediment accumulation, and street
            runoff directly influence benthic macroinvertebrate food webs, riparian bird perches, and
            potential mosquito vector breeding. Environmental evidence should be interpreted alongside
            municipal infrastructure plans. Click the button above to generate a concise structured synthesis.
          </p>
        )}

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Deterministic AI Architecture: Database → Analytics Engine → Structured Telemetry → LLM</span>
          <span className="text-teal-400 font-mono">No medical claims · Fully verified numbers</span>
        </div>
      </div>

      {/* Feature 5: Recent Citizen Observations for this Reach */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Citizen Field Observations ({siteObservations.length})
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Verified ground-truth reports logged by volunteers and local monitors
            </div>
          </div>
          <button
            onClick={onOpenAddObservation}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            + Add New Observation
          </button>
        </div>

        {siteObservations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteObservations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {obs.authorName} ({obs.authorRole})
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {obs.timestamp.split('T')[0]}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                  <span>Water: <strong>{obs.waterAppearance}</strong></span>
                  <span>·</span>
                  <span>Odor: <strong>{obs.odor}</strong></span>
                  <span>·</span>
                  <span>Flow: <strong>{obs.flowCondition}</strong></span>
                </div>

                {obs.notes && (
                  <p className="text-slate-700 leading-relaxed italic bg-white p-2.5 rounded border border-slate-100">
                    "{obs.notes}"
                  </p>
                )}

                {obs.macroinvertebrates && obs.macroinvertebrates.length > 0 && (
                  <div className="text-[11px] text-teal-800">
                    <span className="font-semibold">Bio-signals: </span>
                    {obs.macroinvertebrates.join(', ')}
                  </div>
                )}

                {obs.photoUrl && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      <Camera className="w-3 h-3 text-teal-600" />
                      <span>Stream Field Photo</span>
                    </div>
                    <div className="rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={obs.photoUrl}
                        alt={`Observation field photo for ${obs.siteName}`}
                        className="w-full h-40 sm:h-48 object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
            No citizen observations recorded for this reach yet. Be the first to log a field report!
          </div>
        )}
      </div>
    </div>
  );
};
