import React, { useState } from 'react';
import {
  ArrowRight,
  Activity,
  MapPin,
  TrendingDown,
  Layers,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  FileText,
} from 'lucide-react';
import { NavRoute } from '../layout/Navbar';
import { MonitoringSite } from '../../types';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';

interface HomeViewProps {
  onRouteChange: (route: NavRoute) => void;
  featuredSites: MonitoringSite[];
  onSelectSite: (site: MonitoringSite) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onRouteChange,
  featuredSites,
  onSelectSite,
}) => {
  const [selectedPreviewSite, setSelectedPreviewSite] = useState<MonitoringSite>(
    featuredSites[0] || {}
  );

  return (
    <div className="space-y-20 py-6">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Track Kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-mono text-teal-700 bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span>Environmental Intelligence · Data-to-Insight</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
          From stream data to actionable <span className="text-teal-700">One Health intelligence</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
          Transform citizen observations and environmental indicators into understandable maps, trends,
          comparisons, and evidence-based ecosystem insights.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onRouteChange('map')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <span>Explore Stream Health Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onRouteChange('dashboard')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span>View Live Dashboard</span>
          </button>
        </div>

        {/* Quiet Trust Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">5 Pilot Cities</div>
            <div className="text-xs text-slate-500 mt-0.5">Lisbon · Lyon · Bristol · Freiburg · Valencia</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">60+ Reaches</div>
            <div className="text-xs text-slate-500 mt-0.5">Urban, suburban & greenway reaches</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">5 Core Indicators</div>
            <div className="text-xs text-slate-500 mt-0.5">Physicochemical, Benthic, Habitat & Citizen</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-teal-700 tabular-nums">100% Explainable</div>
            <div className="text-xs text-slate-500 mt-0.5">Transparent math, confidence & no black boxes</div>
          </div>
        </div>
      </section>

      {/* 2. Problem & Solution Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Problem Card */}
          <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-rose-400">
                The Freshwater Challenge
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Stream data is hard to interpret and fails to show risks or health impacts.
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">
                Urban freshwater telemetry often sits locked in fragmented spreadsheets, raw physicochemical
                sensor logs, and isolated citizen science apps. Citizens and municipal decision-makers
                struggle to discern what changed, whether a reach is genuinely deteriorating, or how
                localized stream degradation affects community well-being.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-rose-300">
                <span>✕</span> <span>Incomprehensible raw milligram/liter values without ecological context</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>✕</span> <span>Hidden uncertainties: missing indicators masquerading as healthy reaches</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300">
                <span>✕</span> <span>No connection between stream quality and broader One Health outcomes</span>
              </div>
            </div>
          </div>

          {/* Solution Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold">
                The AquaLens Solution
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Data → Pattern → Context → Confidence → Action.
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                AquaLens cleans, normalizes, and integrates multi-stream telemetry with citizen observations.
                It computes deterministic composite health indices, flags spatial anomalies, and translates
                period-over-period deltas into explainable narratives and actionable One Health recommendations.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transparent composite indicators normalized 0–100 with weight redistribution</span>
              </div>
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>"What Changed?" & "Why Flagged?" attribution driven by deterministic math</span>
              </div>
              <div className="flex items-center gap-2 text-teal-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Evidence-based One Health framing connecting ecosystems to community well-being</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Intelligence Pipeline (How It Works) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold mb-2">
            System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How Raw Stream Observations Become Actionable Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Data Ingestion & Cleaning</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Accepts citizen field observations, sensor probes (DO, pH, turbidity), and biological records.
              Automated validation screens for sensory contradictions and missing fields.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Standardized Normalization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standardizes heterogeneous units into unified 0–100 indicators. Inverts pollution and turbidity
              so higher always represents superior ecological status. Clamps out-of-range bounds safely.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Analytics & Confidence Model</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes period deltas, detects spatial hotspot outliers against neighboring reaches, and
              calculates an explicit High / Medium / Low confidence rating based on observation density.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-slate-900 text-base">One Health Insight Translation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates natural-language summaries, identifies the primary shifting driver, and maps
              ecosystem trends to community health and municipal follow-up actions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Live Preview */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 overflow-hidden border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                Live Platform Preview
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                Explore an Active Reach
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-lg">
                Click any reach below to see real-time indicator weighting, confidence calculation, and
                deterministic root-cause explanations.
              </p>
            </div>

            {/* Quick Site Picker */}
            <div className="flex flex-wrap gap-2">
              {featuredSites.slice(0, 4).map((site) => (
                <button
                  key={site.id}
                  onClick={() => setSelectedPreviewSite(site)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedPreviewSite.id === site.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {site.name.split(' ')[0]} ({site.city})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Card */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Header & Composite */}
            <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
              <div>
                <div className="text-[11px] font-mono text-teal-400">
                  {selectedPreviewSite.code} · {selectedPreviewSite.city}, {selectedPreviewSite.country}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">{selectedPreviewSite.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5">{selectedPreviewSite.streamName}</div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Composite Stream Health</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold font-mono text-white tabular-nums">
                    {selectedPreviewSite.scores.composite ?? '—'}
                  </span>
                  <span className="text-slate-400 text-sm font-mono">/ 100</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <HealthBadge status={selectedPreviewSite.status} showScore={false} />
                  <ConfidenceBadge level={selectedPreviewSite.confidence} />
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectSite(selectedPreviewSite);
                  onRouteChange('sites');
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>View Full Telemetry Deep Dive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Col 2: What Changed? */}
            <div className="space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">What Changed? (30-day Delta)</span>
                <span className="text-[11px] font-mono text-slate-400">Period Delta</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Water Quality</span>
                  <span
                    className={`font-mono font-semibold ${
                      selectedPreviewSite.deltas30d.waterQuality < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedPreviewSite.deltas30d.waterQuality > 0 ? '+' : ''}
                    {selectedPreviewSite.deltas30d.waterQuality}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Biodiversity Taxa</span>
                  <span
                    className={`font-mono font-semibold ${
                      selectedPreviewSite.deltas30d.biodiversity < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedPreviewSite.deltas30d.biodiversity > 0 ? '+' : ''}
                    {selectedPreviewSite.deltas30d.biodiversity}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Habitat Riparian Buffer</span>
                  <span
                    className={`font-mono font-semibold ${
                      selectedPreviewSite.deltas30d.habitat < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedPreviewSite.deltas30d.habitat > 0 ? '+' : ''}
                    {selectedPreviewSite.deltas30d.habitat}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Citizen Pollution Reports</span>
                  <span
                    className={`font-mono font-semibold ${
                      selectedPreviewSite.deltas30d.pollution > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {selectedPreviewSite.deltas30d.pollution > 0 ? '+' : ''}
                    {selectedPreviewSite.deltas30d.pollution}%
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900 text-[11px] text-slate-300">
                <span className="font-semibold text-teal-300">Key Driver: </span>
                {selectedPreviewSite.deltas30d.pollution > 15
                  ? `Spike in citizen-reported stormwater runoff and litter incidents.`
                  : selectedPreviewSite.deltas30d.waterQuality < -10
                  ? `Significant drop in dissolved oxygen following seasonal heat & runoff.`
                  : `Stable conditions consistent with baseline multi-parameter monitoring.`}
              </div>
            </div>

            {/* Col 3: One Health Relevance */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-200">One Health Context</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedPreviewSite.landUse === 'Industrial Fringe' ||
                selectedPreviewSite.landUse === 'Urban Dense'
                  ? `Degraded water quality and high urban runoff in this corridor can reduce natural aquatic bio-filtration and increase stagnant pooling, creating potential vector habitat along urban walking corridors.`
                  : `Intact riparian vegetation buffer cools local micro-climates, provides refuge for native macroinvertebrates, and safeguards community recreational spaces along urban greenways.`}
              </p>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  Recommended Action
                </div>
                <div className="text-xs text-teal-300">
                  {selectedPreviewSite.isHotspot
                    ? 'Priority on-site physicochemical verification and stormwater outfall inspection.'
                    : 'Maintain bi-weekly citizen science visual assessments and macroinvertebrate logging.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. One Health Explanation */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="text-xs font-mono uppercase tracking-wider text-teal-700 font-semibold">
          Scientific Framing
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          What is One Health in Freshwater Ecosystems?
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed text-balance">
          One Health recognizes that the well-being of humans, domestic and wild animals, plants, and
          the wider environment are closely linked and interdependent. In urban stream corridors, clean
          water and diverse benthic communities do not merely protect aquatic life—they mitigate urban heat,
          prevent stagnant disease-vector breeding, absorb flood surges, and enrich human psychological
          and physical health in cities.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 text-sm">Environmental Health</div>
            <div className="text-xs text-slate-600">
              Dissolved oxygen, pH balance, unpolluted sediment, and intact riparian canopy.
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 text-sm">Animal & Biological Health</div>
            <div className="text-xs text-slate-600">
              Macroinvertebrate biological richness, fish nurseries, and dragonfly predation on mosquitoes.
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1">
            <div className="font-semibold text-slate-900 text-sm">Human & Community Health</div>
            <div className="text-xs text-slate-600">
              Contact safety along urban greenways, urban cooling, and accessible restorative nature.
            </div>
          </div>
        </div>
      </section>

      {/* 6. Quick CTA Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-teal-700 text-white rounded-2xl p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to explore urban freshwater data?
          </h2>
          <p className="text-teal-100 text-sm max-w-xl mx-auto">
            Access live maps, inspect temporal trends, compare reaches across Europe, or ask natural-language
            questions about stream health.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onRouteChange('dashboard')}
              className="px-5 py-2.5 bg-white text-teal-900 font-semibold rounded-lg text-sm hover:bg-teal-50 transition-colors shadow-xs cursor-pointer"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => onRouteChange('methodology')}
              className="px-5 py-2.5 bg-teal-800 text-white font-semibold rounded-lg text-sm hover:bg-teal-900 transition-colors cursor-pointer"
            >
              Read Methodology
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
