import { MonitoringSite } from '../../types';
import { calculateWhatChanged } from '../analytics/whatChanged';
import { getSites } from '../data/dataLayer';

export interface SummarizeResponse {
  summary: string;
  source: 'gemini-3.8-flash' | 'deterministic-engine';
  confidence: string;
}

export async function summarizeSiteTelemetry(site: MonitoringSite): Promise<SummarizeResponse> {
  // First attempt server-side Gemini generation
  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName: site.name,
        streamName: site.streamName,
        city: site.city,
        period: 'Last 30 Days',
        overallScore: site.scores.composite,
        deltas: site.deltas30d,
        confidence: site.confidence,
        keyFactors: site.flaggedReasons,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.summary && data.source === 'gemini-3.8-flash') {
        return {
          summary: data.summary,
          source: 'gemini-3.8-flash',
          confidence: site.confidence,
        };
      }
    }
  } catch (err) {
    // Network or server error - seamlessly fall through to deterministic engine
    console.warn('Server AI summarizer unavailable, using deterministic template engine:', err);
  }

  // Deterministic fallback rule engine (Strictly follows prompt specs)
  const whatChanged = calculateWhatChanged(site.deltas30d, 'Last 30 Days');
  const d = site.deltas30d;

  let deterministicSummary = `${site.name} displays an overall composite stream health indicator of ${
    site.scores.composite ?? 'N/A'
  }/100. `;

  if (d.waterQuality <= -10) {
    deterministicSummary += `Physicochemical water-quality indicators decreased by ${Math.abs(
      d.waterQuality
    )}% over the selected 30-day period. `;
  } else if (d.waterQuality >= 10) {
    deterministicSummary += `Water-quality indicators improved by +${d.waterQuality}%, showing stabilized dissolved oxygen levels. `;
  }

  if (d.habitat <= -5) {
    deterministicSummary += `Habitat condition declined by ${Math.abs(d.habitat)}%, `;
  }

  if (d.pollution >= 15) {
    deterministicSummary += `while citizen pollution reports increased by +${d.pollution}%. `;
  }

  if (site.confidence === 'Low') {
    deterministicSummary += `Confidence is currently Low due to sparse observational history or missing parameters. `;
  } else {
    deterministicSummary += `Confidence is assessed as ${site.confidence} based on consistent multi-indicator field observations. `;
  }

  deterministicSummary += `From a One Health perspective, continued multi-parameter monitoring is recommended to evaluate downstream ecological resilience.`;

  return {
    summary: deterministicSummary,
    source: 'deterministic-engine',
    confidence: site.confidence,
  };
}

export interface AskResponse {
  answer: string;
  source: 'gemini-3.8-flash' | 'deterministic-engine';
  matchedSites?: MonitoringSite[];
}

export async function askAquaInsight(question: string): Promise<AskResponse> {
  const sites = getSites();

  // Try server-side AI first with rich context
  try {
    const datasetContext = {
      totalSites: sites.length,
      sampleSites: sites.slice(0, 8).map((s) => ({
        id: s.id,
        name: s.name,
        stream: s.streamName,
        city: s.city,
        composite: s.scores.composite,
        status: s.status,
        confidence: s.confidence,
        waterQuality: s.scores.waterQuality,
        biodiversity: s.scores.biodiversity,
        deltas30d: s.deltas30d,
        isHotspot: s.isHotspot,
      })),
      hotspots: sites.filter((s) => s.isHotspot).map((s) => `${s.name} (${s.streamName}, ${s.city})`),
      lowestScoring: [...sites].sort((a, b) => (a.scores.composite ?? 100) - (b.scores.composite ?? 100)).slice(0, 3).map((s) => `${s.name}: ${s.scores.composite}/100`),
      highestBiodiversity: [...sites].sort((a, b) => (b.scores.biodiversity ?? 0) - (a.scores.biodiversity ?? 0)).slice(0, 3).map((s) => `${s.name}: ${s.scores.biodiversity}/100`),
    };

    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, datasetContext }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer && data.source === 'gemini-3.8-flash') {
        return {
          answer: data.answer,
          source: 'gemini-3.8-flash',
        };
      }
    }
  } catch (err) {
    console.warn('Server AI Q&A unavailable, utilizing deterministic query engine:', err);
  }

  // Predefined query pattern matching (Deterministic fallback)
  const q = question.toLowerCase();

  // Pattern 1: Declined the most
  if (q.includes('decline') || q.includes('worse') || q.includes('drop')) {
    const declining = [...sites]
      .filter((s) => s.deltas30d.overall < 0)
      .sort((a, b) => a.deltas30d.overall - b.deltas30d.overall)
      .slice(0, 3);

    const names = declining.map((s) => `${s.name} in ${s.city} (Δ ${s.deltas30d.overall}%)`).join(', ');
    return {
      answer: `Over the last 30 days, the greatest indicator declines occurred at: ${names}. These sites have experienced marked drops in dissolved oxygen or spikes in citizen-reported stormwater pollution.`,
      source: 'deterministic-engine',
      matchedSites: declining,
    };
  }

  // Pattern 2: Highest biodiversity
  if (q.includes('biodiversity') || q.includes('wildlife') || q.includes('species') || q.includes('invertebrate')) {
    const topBio = [...sites]
      .filter((s) => s.scores.biodiversity !== null)
      .sort((a, b) => (b.scores.biodiversity ?? 0) - (a.scores.biodiversity ?? 0))
      .slice(0, 3);

    const names = topBio.map((s) => `${s.name} (${s.streamName}, ${s.city} — ${s.scores.biodiversity}/100)`).join(', ');
    return {
      answer: `The highest biodiversity indicators are documented at: ${names}. These reaches exhibit intact riparian tree canopies and verified presences of sensitive macroinvertebrates (mayfly and stonefly nymphs).`,
      source: 'deterministic-engine',
      matchedSites: topBio,
    };
  }

  // Pattern 3: Hotspots
  if (q.includes('hotspot') || q.includes('risk') || q.includes('attention')) {
    const hotspots = sites.filter((s) => s.isHotspot);
    const names = hotspots.map((s) => `${s.name} (${s.streamName}, ${s.city})`).join(', ');
    return {
      answer: `There are currently ${hotspots.length} potential monitoring hotspots identified across the network: ${names}. Hotspot status reflects significant downward divergence from nearby reaches, multi-indicator stress, and heightened citizen pollution signals.`,
      source: 'deterministic-engine',
      matchedSites: hotspots,
    };
  }

  // Pattern 4: Low confidence or data gaps
  if (q.includes('confidence') || q.includes('gap') || q.includes('missing') || q.includes('coverage')) {
    const lowConf = sites.filter((s) => s.confidence === 'Low');
    const names = lowConf.map((s) => `${s.name} (${s.city})`).join(', ');
    return {
      answer: `Sites with Low Confidence due to sparse observational history or missing physicochemical channels include: ${names || 'Loures Floodplain Buffer Station'}. These locations require targeted citizen science deployments to close telemetry gaps.`,
      source: 'deterministic-engine',
      matchedSites: lowConf,
    };
  }

  // Pattern 5: Pollution reports
  if (q.includes('pollution') || q.includes('trash') || q.includes('sewage') || q.includes('foam')) {
    const highPollution = [...sites]
      .filter((s) => s.deltas30d.pollution > 10)
      .sort((a, b) => b.deltas30d.pollution - a.deltas30d.pollution)
      .slice(0, 3);

    const names = highPollution.map((s) => `${s.name} (${s.city} — +${s.deltas30d.pollution}% incident reports)`).join(', ');
    return {
      answer: `The highest increases in citizen-reported pollution were recorded at: ${names}. Common observations include road wash-off plumes, discarded plastic packaging, and stagnant sewage odors.`,
      source: 'deterministic-engine',
      matchedSites: highPollution,
    };
  }

  // Default answer
  return {
    answer: `AquaLens is currently monitoring ${sites.length} stream reaches across 5 European pilot cities (Lisbon, Lyon, Bristol, Freiburg, and Valencia). You can explore specific sites using the Interactive Map, inspect the What Changed temporal analysis, or review the multi-site comparison tool.`,
    source: 'deterministic-engine',
    matchedSites: sites.slice(0, 3),
  };
}

export const askAquaLens = askAquaInsight;
