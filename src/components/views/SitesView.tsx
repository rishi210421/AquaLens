import React, { useState } from 'react';
import { MonitoringSite, HealthStatus, ConfidenceLevel } from '../../types';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { Search, Filter, LayoutGrid, List, ArrowRight, Flame } from 'lucide-react';
import { NavRoute } from '../layout/Navbar';

interface SitesViewProps {
  sites: MonitoringSite[];
  selectedSite: MonitoringSite | null;
  onSelectSite: (site: MonitoringSite) => void;
  onRouteChange: (route: NavRoute) => void;
}

export const SitesView: React.FC<SitesViewProps> = ({
  sites,
  selectedSite,
  onSelectSite,
  onRouteChange,
}) => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [hotspotsOnly, setHotspotsOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredSites = sites.filter((site) => {
    if (cityFilter !== 'all' && site.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && site.status !== statusFilter) return false;
    if (confidenceFilter !== 'all' && site.confidence !== confidenceFilter) return false;
    if (hotspotsOnly && !site.isHotspot) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const match =
        site.name.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q) ||
        site.streamName.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q) ||
        site.landUse.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Monitoring Sites Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and inspect calibrated telemetry records across all {sites.length} urban stream reaches
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search by code, stream or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-3 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-teal-500 outline-hidden"
            />
          </div>

          {/* City Filter */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 outline-hidden"
          >
            <option value="all">All Cities</option>
            <option value="lisbon">Lisbon</option>
            <option value="lyon">Lyon</option>
            <option value="bristol">Bristol</option>
            <option value="freiburg">Freiburg</option>
            <option value="valencia">Valencia</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="healthy">Healthy / Stable</option>
            <option value="watch">Watch</option>
            <option value="attention">Attention</option>
            <option value="insufficient">Insufficient Data</option>
          </select>

          {/* Confidence Filter */}
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 outline-hidden"
          >
            <option value="all">All Confidence</option>
            <option value="High">High Confidence</option>
            <option value="Medium">Medium Confidence</option>
            <option value="Low">Low Confidence</option>
          </select>

          {/* Hotspot Checkbox */}
          <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hotspotsOnly}
              onChange={(e) => setHotspotsOnly(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              <span>Hotspots Only</span>
            </span>
          </label>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Showing {filteredSites.length} of {sites.length} reaches
        </div>
      </div>

      {/* Grid or Table Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              onClick={() => onSelectSite(site)}
              className="bg-white rounded-xl border border-slate-200 hover:border-teal-500/80 p-5 shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-teal-700 font-medium">
                    {site.code} · {site.city}
                  </span>
                  <HealthBadge status={site.status} score={site.scores.composite} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors mt-2 leading-snug">
                  {site.name}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">{site.streamName}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{site.landUse}</div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                  {site.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center py-1 bg-slate-50 rounded">
                  <div>
                    <div className="text-[10px] text-slate-400">Water Quality</div>
                    <div className="font-mono font-bold text-slate-800">
                      {site.scores.waterQuality ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Biodiversity</div>
                    <div className="font-mono font-bold text-slate-800">
                      {site.scores.biodiversity ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Habitat</div>
                    <div className="font-mono font-bold text-slate-800">
                      {site.scores.habitat ?? '—'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <ConfidenceBadge level={site.confidence} />
                  <span className="font-mono">
                    30d Δ:{' '}
                    <strong
                      className={site.deltas30d.overall < 0 ? 'text-rose-600' : 'text-emerald-600'}
                    >
                      {site.deltas30d.overall > 0 ? '+' : ''}
                      {site.deltas30d.overall}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reach Code / Name</th>
                  <th className="py-3 px-3">City & Stream</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 font-mono text-right">Composite</th>
                  <th className="py-3 px-3 font-mono text-right">Water Qual</th>
                  <th className="py-3 px-3 font-mono text-right">Biodiversity</th>
                  <th className="py-3 px-3 font-mono text-right">30-day Shift</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSites.map((site) => (
                  <tr
                    key={site.id}
                    onClick={() => onSelectSite(site)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{site.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{site.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{site.streamName}</div>
                      <div className="text-[11px] text-slate-500">{site.city}</div>
                    </td>
                    <td className="py-3 px-3">
                      <HealthBadge status={site.status} showScore={false} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-right tabular-nums text-slate-900">
                      {site.scores.composite !== null ? site.scores.composite : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-right tabular-nums text-slate-700">
                      {site.scores.waterQuality ?? '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-right tabular-nums text-slate-700">
                      {site.scores.biodiversity ?? '—'}
                    </td>
                    <td className="py-3 px-3 font-mono text-right tabular-nums">
                      <span
                        className={site.deltas30d.overall < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}
                      >
                        {site.deltas30d.overall > 0 ? '+' : ''}
                        {site.deltas30d.overall}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <ConfidenceBadge level={site.confidence} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-teal-700 hover:text-teal-800 font-semibold inline-flex items-center gap-1">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredSites.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No reaches match the selected filter criteria. Try adjusting the search or city filter.
        </div>
      )}
    </div>
  );
};
