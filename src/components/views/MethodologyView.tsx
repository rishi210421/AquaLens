import React from 'react';
import { DATA_SOURCES } from '../../data/dataSources';
import { ShieldCheck, Info, BookOpen, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-teal-700 uppercase tracking-wider font-semibold">
          Scientific Transparency & Mathematical Foundations
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          AquaLens Methodology & Governance
        </h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          Full documentation of indicator weighting, normalization equations, confidence scoring,
          hotspot algorithms, and synthetic dataset disclosures for Data-to-Insight intelligence.
        </p>
      </div>

      {/* 1. Challenge Alignment */}
      <section className="bg-teal-50/70 p-6 rounded-xl border border-teal-200 space-y-3 text-xs leading-relaxed text-teal-950">
        <div className="font-bold text-sm text-teal-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-700" />
          <span>Alignment with One Health Stream Objectives</span>
        </div>
        <p>
          <strong>Core Objective:</strong> <em>"Turn citizen-collected data into actionable stream health and One Health insights."</em>
        </p>
        <p>
          Raw citizen and sensor observations are notoriously difficult for non-specialists to interpret.
          AquaLens addresses this directly by turning fragmented field records into confidence-aware,
          spatial and temporal intelligence that clearly answers <strong>What changed?</strong>,{' '}
          <strong>Why is this reach flagged?</strong>, and <strong>What are the One Health implications?</strong>
        </p>
      </section>

      {/* 2. Official OneAquaHealth Concepts vs Prototype Formula */}
      <section className="bg-amber-50/60 p-6 rounded-xl border border-amber-200 space-y-3 text-xs text-amber-950">
        <div className="font-bold text-sm text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          <span>Crucial Methodological Distinction: Official Framework vs Prototype Scoring</span>
        </div>
        <p>
          The <strong>OneAquaHealth Health Assessment Framework</strong> defines core ecological, biological,
          and health-related indicators (including benthic macroinvertebrates, water quality, riparian habitat,
          birds, amphibians, and mosquitoes).
        </p>
        <p>
          <strong>Notice:</strong> The composite score implemented in this application is designated as the{' '}
          <strong>"AquaLens Composite Stream Health Indicator"</strong>. It represents a transparent
          algorithmic prototype engineered for demonstration and decision support. It is <strong>not</strong> an
          official regulatory standard established by the OneAquaHealth consortium or European environmental
          agencies.
        </p>
      </section>

      {/* 3. Indicator Weights & Proportional Redistribution */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <h2 className="text-lg font-bold text-slate-900">
          Composite Stream Health Indicator Formulation
        </h2>
        <p className="text-slate-600 leading-relaxed">
          The prototype composite indicator is computed from five normalized sub-indicators (each on a 0–100 scale):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="font-bold text-slate-900">Water Quality</div>
            <div className="text-xl font-mono font-bold text-teal-700 mt-1">30%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Physicochemical probes</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="font-bold text-slate-900">Biodiversity</div>
            <div className="text-xl font-mono font-bold text-teal-700 mt-1">25%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Benthic macroinvertebrates</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="font-bold text-slate-900">Habitat Condition</div>
            <div className="text-xl font-mono font-bold text-teal-700 mt-1">20%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Riparian tree canopy</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="font-bold text-slate-900">Citizen Signal</div>
            <div className="text-xl font-mono font-bold text-teal-700 mt-1">15%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Litter & sensory reports</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="font-bold text-slate-900">Environmental Context</div>
            <div className="text-xl font-mono font-bold text-teal-700 mt-1">10%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Land use & weather buffer</div>
          </div>
        </div>

        {/* Handling Missing Data Rule */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-slate-700">
          <div className="font-semibold text-slate-900">Handling Missing Telemetry Streams:</div>
          <p>
            When a reach lacks data for an indicator (e.g. water quality laboratory sampling is unavailable for
            the current window), AquaLens does <strong>not</strong> blindly treat the missing component as
            zero. Instead, available weights are <strong>proportionally redistributed</strong> to sum to 100%,
            and an associated confidence penalty is applied:
          </p>
          <div className="p-2.5 bg-slate-900 text-teal-300 font-mono text-[11px] rounded">
            Weight_active = (Weight_raw / Σ Weight_available) × 100%
          </div>
        </div>

        {/* Status Thresholds */}
        <div className="pt-2 space-y-2">
          <div className="font-semibold text-slate-800">Status Classification Bands:</div>
          <ul className="space-y-1 list-disc list-inside text-slate-600">
            <li><strong>80–100: Healthy / Stable</strong> — Balanced dissolved oxygen, high biological richness.</li>
            <li><strong>60–79: Watch</strong> — Mild stress, seasonal fluctuations, or localized stormwater impact.</li>
            <li><strong>0–59: Attention</strong> — Multi-stressor degradation, hypoxia, or elevated pollution logs.</li>
            <li><strong>Insufficient Data</strong> — When fewer than 2 active indicators exist.</li>
          </ul>
        </div>
      </section>

      {/* 4. Evidence-Based Confidence Engine */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <h2 className="text-lg font-bold text-slate-900">Data Confidence Model</h2>
        <p className="text-slate-600 leading-relaxed">
          Confidence is never concealed. It is explicitly scored from 0 to 100 and classified into High,
          Medium, or Low based on four verified criteria:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="font-bold text-slate-900">1. Observation Density (35%)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              &gt;25 observations earns maximum score; &lt;4 observations triggers sparse penalty.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="font-bold text-slate-900">2. Temporal Recency (25%)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Field observations within 7 days earn top marks; records older than 45 days are penalized.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="font-bold text-slate-900">3. Multi-Indicator Coverage (25%)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Evaluates whether all 5 physical, biological, and citizen channels are actively logging.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="font-bold text-slate-900">4. Temporal Baseline Depth (15%)</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Requires at least a 90-day historical time-series baseline to reliably establish trends.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Hotspot & Anomaly Detection */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs leading-relaxed text-slate-700">
        <h2 className="text-lg font-bold text-slate-900">Potential Monitoring Hotspot Detection</h2>
        <p>
          A reach is flagged as a <strong>"Potential Monitoring Hotspot"</strong> (never an unverified "confirmed
          pollution zone") when multi-stressor conditions converge:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
          <li>Composite score deviates ≥12 points below the local catchment average (&lt;15 km radius).</li>
          <li>Physicochemical water quality deteriorated ≥10% over the last 30 days.</li>
          <li>Citizen-reported pollution reports surged ≥15%.</li>
          <li>Riparian canopy degradation or bank erosion is noted in field records.</li>
        </ul>
      </section>

      {/* 6. AI Grounding & Responsible Use */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs leading-relaxed text-slate-700">
        <h2 className="text-lg font-bold text-slate-900">Responsible AI Architecture</h2>
        <p>
          AquaLens uses a strict <strong>Database → Analytics Engine → Structured JSON → LLM</strong>{' '}
          pipeline:
        </p>
        <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-600 font-mono text-[11px]">
          Raw Telemetry → Cleaned / Normalized Metrics → Period Deltas & Confidence → Structured Context → Gemini 3.8 Flash
        </div>
        <p>
          The LLM never queries databases directly, never invents numerical values, never diagnoses human diseases,
          and always mentions data confidence and uncertainty. If no API key is provided, the platform seamlessly
          runs its deterministic insight template engine.
        </p>
      </section>

      {/* 7. Data Sources & Licenses Registry */}
      <section className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
        <h2 className="text-lg font-bold text-slate-900">Data Sources & Licenses</h2>
        <div className="space-y-3">
          {DATA_SOURCES.map((ds) => (
            <div key={ds.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{ds.name}</span>
                <span className="font-mono text-[11px] text-teal-700 font-medium">{ds.license}</span>
              </div>
              <p className="text-slate-600">{ds.description}</p>
              <div className="text-[11px] text-slate-500 pt-1 font-mono">
                Citation: {ds.citation} · Retrieved: {ds.retrievedAt}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
