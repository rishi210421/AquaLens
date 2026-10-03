import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MonitoringSite, HealthStatus } from '../../types';
import { HealthBadge, ConfidenceBadge } from '../common/HealthBadge';

interface StreamMapProps {
  sites: MonitoringSite[];
  selectedSiteId?: string | null;
  onSelectSite: (site: MonitoringSite) => void;
  height?: string | number;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const StreamMap: React.FC<StreamMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  height = '560px',
  initialCenter = [45.0, 3.0], // Center of Western Europe covering Lisbon, Lyon, Bristol, Freiburg, Valencia
  initialZoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  const [activeLayer, setActiveLayer] = useState<'all' | 'hotspots' | 'healthy' | 'attention'>('all');
  const [activeCity, setActiveCity] = useState<string>('all');
  const [mapSearch, setMapSearch] = useState<string>('');

  // Filter sites based on map controls
  const filteredSites = sites.filter((site) => {
    if (activeCity !== 'all' && site.city.toLowerCase() !== activeCity.toLowerCase()) {
      return false;
    }
    if (activeLayer === 'hotspots' && !site.isHotspot) {
      return false;
    }
    if (activeLayer === 'healthy' && site.status !== 'healthy') {
      return false;
    }
    if (activeLayer === 'attention' && site.status !== 'attention') {
      return false;
    }
    if (mapSearch.trim().length > 0) {
      const q = mapSearch.toLowerCase();
      const match =
        site.name.toLowerCase().includes(q) ||
        site.code.toLowerCase().includes(q) ||
        site.streamName.toLowerCase().includes(q) ||
        site.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
    });

    // Clean OpenStreetMap Carto tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors | OneAquaHealth',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredSites.forEach((site) => {
      const isSelected = selectedSiteId === site.id;

      // Color mapping
      let markerColor = '#10b981'; // emerald
      let borderColor = '#059669';
      if (site.status === 'watch') {
        markerColor = '#f59e0b'; // amber
        borderColor = '#d97706';
      } else if (site.status === 'attention') {
        markerColor = '#f43f5e'; // rose
        borderColor = '#e11d48';
      } else if (site.status === 'insufficient') {
        markerColor = '#94a3b8'; // slate
        borderColor = '#64748b';
      }

      const scoreText = site.scores.composite !== null ? Math.round(site.scores.composite) : '—';

      const customIcon = L.divIcon({
        className: 'custom-stream-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            border: 2px solid ${isSelected ? '#0f172a' : '#ffffff'};
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            font-family: ui-monospace, monospace;
            cursor: pointer;
            transition: transform 0.15s ease;
          " class="hover:scale-110">
            ${scoreText}
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
      });

      const marker = L.marker([site.lat, site.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif; padding: 2px;">
          <div style="font-size: 11px; color: #64748b; font-weight: 500;">
            ${site.code} · ${site.city}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; line-height: 1.2;">
            ${site.name}
          </div>
          <div style="font-size: 12px; color: #0d9488; margin-top: 2px;">
            ${site.streamName}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #475569;">Health Indicator:</span>
            <span style="font-size: 13px; font-weight: 700; font-family: monospace;">
              ${site.scores.composite !== null ? site.scores.composite + ' / 100' : 'Insufficient'}
            </span>
          </div>

          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Confidence: <strong>${site.confidence}</strong> · 30d Δ: <strong>${site.deltas30d.overall > 0 ? '+' : ''}${site.deltas30d.overall}%</strong>
          </div>

          <button id="view-site-btn-${site.id}" style="
            width: 100%;
            margin-top: 8px;
            background-color: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">
            Inspect Site Telemetry →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-site-btn-${site.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectSite(site);
          };
        }
      });

      marker.on('click', () => {
        onSelectSite(site);
      });

      markersRef.current[site.id] = marker;
    });

    // If a site is selected, center on it
    if (selectedSiteId && markersRef.current[selectedSiteId]) {
      const selectedSite = sites.find((s) => s.id === selectedSiteId);
      if (selectedSite) {
        map.setView([selectedSite.lat, selectedSite.lng], 13, { animate: true });
        markersRef.current[selectedSiteId].openPopup();
      }
    }
  }, [filteredSites, selectedSiteId]);

  // Fit bounds helper
  const handleFitBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || filteredSites.length === 0) return;
    const group = L.featureGroup(Object.values(markersRef.current));
    map.fitBounds(group.getBounds().pad(0.15));
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs flex flex-col">
      {/* Top Map Filter Toolbar */}
      <div className="bg-white/95 backdrop-blur-xs border-b border-slate-200 p-3 z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Layer Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sites ({sites.length})
          </button>
          <button
            onClick={() => setActiveLayer('hotspots')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'hotspots'
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            Hotspots ({sites.filter((s) => s.isHotspot).length})
          </button>
          <button
            onClick={() => setActiveLayer('attention')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'attention'
                ? 'bg-amber-500 text-white font-semibold shadow-xs'
                : 'text-amber-700 hover:text-amber-900'
            }`}
          >
            Attention Reaches
          </button>
          <button
            onClick={() => setActiveLayer('healthy')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              activeLayer === 'healthy'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            Healthy / Stable
          </button>
        </div>

        {/* City Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={activeCity}
            onChange={(e) => {
              setActiveCity(e.target.value);
              // Auto pan map to selected city
              const cityMap: Record<string, [number, number]> = {
                lisbon: [38.74, -9.16],
                lyon: [45.76, 4.83],
                bristol: [51.45, -2.58],
                freiburg: [47.99, 7.84],
                valencia: [39.47, -0.38],
              };
              if (cityMap[e.target.value] && mapInstanceRef.current) {
                mapInstanceRef.current.setView(cityMap[e.target.value], 12);
              }
            }}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs focus:ring-1 focus:ring-teal-500 outline-hidden"
          >
            <option value="all">All Pilot Cities (5)</option>
            <option value="lisbon">Lisbon, Portugal</option>
            <option value="lyon">Lyon, France</option>
            <option value="bristol">Bristol, UK</option>
            <option value="freiburg">Freiburg, Germany</option>
            <option value="valencia">Valencia, Spain</option>
          </select>

          <input
            type="text"
            value={mapSearch}
            onChange={(e) => setMapSearch(e.target.value)}
            placeholder="Search stream or site..."
            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs placeholder:text-slate-400 w-36 sm:w-48 outline-hidden focus:border-teal-500"
          />

          <button
            onClick={handleFitBounds}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-medium text-xs whitespace-nowrap"
            title="Fit all markers in view"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="relative z-0" />

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 shadow-md text-xs space-y-1.5 pointer-events-auto max-w-[220px]">
        <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
          Indicator Scale (0–100)
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>80–100 Healthy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span>60–79 Watch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span>0–59 Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <span>Insufficient</span>
          </div>
        </div>
        <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-400">
          Numbers show Composite Health Score
        </div>
      </div>
    </div>
  );
};
