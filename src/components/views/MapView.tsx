import React, { useState } from 'react';
import { StreamMap } from '../map/StreamMap';
import { MonitoringSite } from '../../types';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';
import { ArrowRight, AlertTriangle, Info, Layers, Eye } from 'lucide-react';
import { NavRoute } from '../layout/Navbar';

interface MapViewProps {
  sites: MonitoringSite[];
  selectedSite: MonitoringSite | null;
  onSelectSite: (site: MonitoringSite) => void;
  onRouteChange: (route: NavRoute) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  sites,
  selectedSite,
  onSelectSite,
  onRouteChange,
}) => {
  const currentSite = selectedSite || sites[0];

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Geospatial Stream Reach Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spatial monitoring markers across European pilot cities with real-time status classifications
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Healthy</span>
            <span className="text-slate-300">·</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Watch</span>
            <span className="text-slate-300">·</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-medium">Attention</span>
          </div>
        </div>
      </div>

      {/* Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Interactive Map (3 cols) */}
        <div className="lg:col-span-3">
          <StreamMap
            sites={sites}
            selectedSiteId={currentSite?.id}
            onSelectSite={onSelectSite}
            height="620px"
          />
        </div>

        {/* Selected Reach Quick Inspector (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
          <div>
            <div className="text-[11px] font-mono text-teal-700">
              {currentSite.code} · {currentSite.city}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
              {currentSite.name}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">{currentSite.streamName}</div>
          </div>

          {/* Composite Score Card */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="text-[11px] text-slate-500 font-medium">Composite Health Indicator</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
                {currentSite.scores.composite ?? '—'}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <HealthBadge status={currentSite.status} showScore={false} />
              <ConfidenceBadge level={currentSite.confidence} />
            </div>
          </div>

          {/* Quick Indicators */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Water Quality:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentSite.scores.waterQuality ?? '—'}/100
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Biodiversity Taxa:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentSite.scores.biodiversity ?? '—'}/100
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Habitat Condition:</span>
              <span className="font-mono font-semibold text-slate-800">
                {currentSite.scores.habitat ?? '—'}/100
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">30-day Shift:</span>
              <span
                className={`font-mono font-semibold ${
                  currentSite.deltas30d.overall < 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {currentSite.deltas30d.overall > 0 ? '+' : ''}
                {currentSite.deltas30d.overall}%
              </span>
            </div>
          </div>

          {/* Hotspot warning if applicable */}
          {currentSite.isHotspot && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Monitoring Hotspot Alert</span>
              </div>
              <p>{currentSite.hotspotReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={() => {
                onSelectSite(currentSite);
                onRouteChange('sites');
              }}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Inspect Full Site Telemetry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
