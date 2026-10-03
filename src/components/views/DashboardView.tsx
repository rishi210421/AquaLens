import React, { useState } from 'react';
import {
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle,
  Eye,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { MonitoringSite, CityInfo, StreamInfo, CitizenObservation } from '../../types';
import { getDashboardSummary, getTimeSeries } from '../../lib/data/dataLayer';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { TimeSeriesChart } from '../charts/SparklineChart';
import { NavRoute } from '../layout/Navbar';

interface DashboardViewProps {
  sites: MonitoringSite[];
  cities: CityInfo[];
  streams: StreamInfo[];
  observations: CitizenObservation[];
  onSelectSite: (site: MonitoringSite) => void;
  onRouteChange: (route: NavRoute) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sites,
  cities,
  streams,
  observations,
  onSelectSite,
  onRouteChange,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStream, setSelectedStream] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | '90d' | '1y'>('90d');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter sites dynamically
  const filteredSites = sites.filter((site) => {
    if (selectedCity !== 'all' && site.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (selectedStream !== 'all' && site.streamId !== selectedStream) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const match =
        site.name.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q) ||
        site.streamName.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate dynamic summary metrics from filtered sites
  const summary = getDashboardSummary(selectedCity, selectedStream);

  // Top declining & improving sites
  const topDeclining = [...filteredSites]
    .filter((s) => s.deltas30d.overall < 0)
    .sort((a, b) => a.deltas30d.overall - b.deltas30d.overall)
    .slice(0, 4);

  const topImproving = [...filteredSites]
    .filter((s) => s.deltas30d.overall > 0)
    .sort((a, b) => b.deltas30d.overall - a.deltas30d.overall)
    .slice(0, 4);

  const hotspots = filteredSites.filter((s) => s.isHotspot);

  // Sample aggregate time series (using first site or prominent reach)
  const representativeSiteId = filteredSites[0]?.id || 'site-lis-01';
  const aggregateTimeSeries = getTimeSeries(representativeSiteId, selectedRange);

  return (
    <div className="space-y-8 py-4">
      {/* Top Header & Global Filter Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Stream Health Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Multi-parameter environmental telemetry & citizen observations across urban catchments
            </p>
          </div>

          {/* Range segmented buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto">
            {(['7d', '30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1 font-mono font-medium rounded-md transition-colors uppercase cursor-pointer ${
                  selectedRange === r
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 mb-1 font-medium">Filter by City</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedStream('all');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
            >
              <option value="all">All Pilot Cities (5)</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name.toLowerCase()}>
                  {c.name}, {c.country} ({c.siteCount} sites)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-medium">Filter by Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
            >
              <option value="all">All Streams ({streams.length})</option>
              {streams
                .filter(
                  (s) =>
                    selectedCity === 'all' || s.city.toLowerCase() === selectedCity.toLowerCase()
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1 font-medium">Search Reaches</label>
            <input
              type="text"
              placeholder="Search by code, stream or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
            >
            </input>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedCity('all');
                setSelectedStream('all');
                setSearchQuery('');
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors text-center cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* 6 Summary Cards - Dynamic Calculations */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Monitoring Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Monitored Sites
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {summary.totalSites}
          </div>
          <div className="text-[11px] text-slate-400">Active telemetry reaches</div>
        </div>

        {/* Card 2: Total Observations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Total Observations
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {summary.totalObservations}
          </div>
          <div className="text-[11px] text-teal-600 font-medium">Citizen & Sensor logs</div>
        </div>

        {/* Card 3: Healthy Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Healthy / Stable</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {summary.healthySites}
          </div>
          <div className="text-[11px] text-slate-400">
            {Math.round((summary.healthySites / (summary.totalSites || 1)) * 100)}% of network
          </div>
        </div>

        {/* Card 4: Watch Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Watch Tier</span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {summary.watchSites}
          </div>
          <div className="text-[11px] text-slate-400">Elevated surveillance</div>
        </div>

        {/* Card 5: Attention Sites */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Attention Sites</span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {summary.attentionSites}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">Requires field audit</div>
        </div>

        {/* Card 6: Data Coverage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Data Completeness
          </div>
          <div className="text-2xl font-bold font-mono text-teal-700 tabular-nums">
            {summary.dataCoveragePercent}%
          </div>
          <div className="text-[11px] text-slate-400">
            {summary.highConfidenceSites} High Confidence
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 1: Health Trend Time Series (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Composite Health Trajectory ({selectedRange.toUpperCase()})
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Aggregated trend curve for benchmark monitoring reach
              </div>
            </div>
            <button
              onClick={() => onRouteChange('map')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-2">
            <TimeSeriesChart
              data={aggregateTimeSeries}
              height={220}
              metricKey="compositeScore"
              metricLabel="Health Score"
              color="#0d9488"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span>Thresholds:</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> &gt;80 Healthy
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 60–79 Watch
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> &lt;60 Attention
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">Confidence Penalty Applied to Gaps</span>
          </div>
        </div>

        {/* Visual 2: Health Distribution Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reach Distribution</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Status classification of active filtered reaches
            </div>

            <div className="mt-6 space-y-4 text-xs">
              {/* Healthy Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-800">Healthy / Stable</span>
                  <span className="font-mono tabular-nums">{summary.healthySites} sites</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(summary.healthySites / (summary.totalSites || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Watch Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-amber-800">Watch Tier</span>
                  <span className="font-mono tabular-nums">{summary.watchSites} sites</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(summary.watchSites / (summary.totalSites || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Attention Bar */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-rose-800">Attention Tier</span>
                  <span className="font-mono tabular-nums">{summary.attentionSites} sites</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${(summary.attentionSites / (summary.totalSites || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Insufficient Data */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600">Insufficient Data</span>
                  <span className="font-mono tabular-nums">{summary.insufficientSites} sites</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{
                      width: `${(summary.insufficientSites / (summary.totalSites || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs">
            <span className="font-semibold text-slate-800">Network Average: </span>
            <span className="font-mono font-bold text-slate-900">{summary.averageScore}</span>
            <span className="text-slate-400 font-mono text-[11px]"> / 100</span>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Hotspots, What Changed, and Recent Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspots & Attention Reaches */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h2 className="text-base font-bold text-slate-900">Potential Hotspots ({hotspots.length})</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Spatial Anomalies</span>
          </div>

          <div className="space-y-3">
            {hotspots.map((site) => (
              <div
                key={site.id}
                onClick={() => onSelectSite(site)}
                className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {site.name}
                  </span>
                  <span className="font-mono font-bold text-rose-700 tabular-nums">
                    {site.scores.composite}/100
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {site.streamName} · {site.city}
                </div>
                <div className="text-[11px] text-rose-800 leading-tight">
                  {site.hotspotReason || 'High divergence from neighboring catchment reaches.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Shifting Sites ("What Changed?") */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Top 30-Day Shifts</h2>
            <span className="text-[11px] font-mono text-slate-400">Period Deltas</span>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              <span>Greatest Declines</span>
            </div>
            {topDeclining.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSite(s)}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-slate-100 text-xs cursor-pointer"
              >
                <div>
                  <div className="font-medium text-slate-900 truncate max-w-[170px]">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.city}</div>
                </div>
                <span className="font-mono font-bold text-rose-600 tabular-nums">
                  {s.deltas30d.overall}%
                </span>
              </div>
            ))}

            <div className="pt-2 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Greatest Improvements</span>
            </div>
            {topImproving.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectSite(s)}
                className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-slate-100 text-xs cursor-pointer"
              >
                <div>
                  <div className="font-medium text-slate-900 truncate max-w-[170px]">{s.name}</div>
                  <div className="text-[10px] text-slate-400">{s.city}</div>
                </div>
                <span className="font-mono font-bold text-emerald-600 tabular-nums">
                  +{s.deltas30d.overall}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Citizen Observations Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Latest Citizen Signals</h2>
            <button
              onClick={() => onRouteChange('observations')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              View Feed ({observations.length})
            </button>
          </div>

          <div className="space-y-3">
            {observations.slice(0, 3).map((obs) => (
              <div
                key={obs.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                    {obs.siteName}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {obs.timestamp.split('T')[0]}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {obs.waterAppearance} · {obs.flowCondition} · {obs.authorName} ({obs.authorRole})
                </div>
                {obs.notes && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-2 mt-1">
                    "{obs.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
