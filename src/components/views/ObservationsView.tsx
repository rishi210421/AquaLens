import React, { useState } from 'react';
import { CitizenObservation, MonitoringSite } from '../../types';
import { PlusCircle, Search, Filter, CheckCircle2, AlertTriangle, ShieldAlert, Camera, MapPin, Maximize2, X } from 'lucide-react';
import { getContextualStreamPhoto } from '../../lib/data/streamImageLibrary';

interface ObservationsViewProps {
  observations: CitizenObservation[];
  sites: MonitoringSite[];
  onOpenAddObservation: () => void;
  onSelectSite: (site: MonitoringSite) => void;
  onViewSite: (siteId: string) => void;
}

export const ObservationsView: React.FC<ObservationsViewProps> = ({
  observations,
  sites,
  onOpenAddObservation,
  onViewSite,
}) => {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [validationFilter, setValidationFilter] = useState('all');
  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; title: string; subtitle: string } | null>(null);

  const filteredObservations = observations.filter((obs) => {
    if (cityFilter !== 'all' && obs.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (validationFilter !== 'all' && obs.validationStatus !== validationFilter) return false;
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      const match =
        obs.siteName.toLowerCase().includes(q) ||
        obs.streamName.toLowerCase().includes(q) ||
        obs.authorName.toLowerCase().includes(q) ||
        (obs.notes && obs.notes.toLowerCase().includes(q)) ||
        obs.waterAppearance.toLowerCase().includes(q) ||
        obs.pollution.toLowerCase().includes(q);
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
            Citizen Science Observation Feed
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time sensory field telemetry, biological logs, and pollution reports screened via automated validation
          </p>
        </div>

        <button
          onClick={onOpenAddObservation}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Observation</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search notes, observer, reach, or appearance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-xs text-slate-800 placeholder:text-slate-400 min-w-[240px] focus:ring-1 focus:ring-teal-500 outline-hidden"
          />

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

          <select
            value={validationFilter}
            onChange={(e) => setValidationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-2.5 text-xs text-slate-800 outline-hidden"
          >
            <option value="all">All Validation States</option>
            <option value="Validated">Validated</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Incomplete">Incomplete</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Showing {filteredObservations.length} of {observations.length} observations
        </div>
      </div>

      {/* Observation Cards Feed */}
      <div className="space-y-4">
        {filteredObservations.map((obs) => (
          <div
            key={obs.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewSite(obs.siteId)}
                  className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-sm text-left cursor-pointer"
                >
                  {obs.siteName}
                </button>
                <span className="text-slate-300">·</span>
                <span className="text-teal-700 font-medium">{obs.streamName} ({obs.city})</span>
              </div>

              {/* Validation Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    obs.validationStatus === 'Validated'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : obs.validationStatus === 'Needs Review'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {obs.validationStatus === 'Validated' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  {obs.validationStatus === 'Needs Review' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                  {obs.validationStatus === 'Incomplete' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                  <span>{obs.validationStatus}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {obs.timestamp.replace('T', ' ').slice(0, 16)}
                </span>
              </div>
            </div>

            {/* Author info */}
            <div className="text-[11px] text-slate-500">
              Reported by <strong className="text-slate-700">{obs.authorName}</strong> ({obs.authorRole})
            </div>

            {/* Stream health parameter tags */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-2 bg-slate-50 rounded-lg p-2.5 text-[11px] text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Water Appearance</span>
                <span className="font-semibold text-slate-900">{obs.waterAppearance}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Odor</span>
                <span className="font-semibold text-slate-900">{obs.odor}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Flow Velocity</span>
                <span className="font-semibold text-slate-900">{obs.flowCondition}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Observed Influx</span>
                <span
                  className={`font-semibold ${
                    obs.pollution !== 'None' ? 'text-rose-700' : 'text-emerald-700'
                  }`}
                >
                  {obs.pollution}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Stream Bank / Riparian</span>
                <span className="font-semibold text-slate-900">{obs.riparianCondition || 'Native Buffer'}</span>
              </div>
            </div>

            {/* Notes */}
            {obs.notes && (
              <p className="text-slate-700 italic bg-white p-3 rounded border border-slate-100 leading-relaxed">
                "{obs.notes}"
              </p>
            )}

            {/* Bio signals */}
            {((obs.macroinvertebrates && obs.macroinvertebrates.length > 0) || (obs.wildlife && obs.wildlife.length > 0)) && (
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px]">
                {obs.macroinvertebrates && obs.macroinvertebrates.length > 0 && (
                  <div className="text-teal-800">
                    <span className="font-semibold">Macroinvertebrates: </span>
                    {obs.macroinvertebrates.join(', ')}
                  </div>
                )}
                {obs.wildlife && obs.wildlife.length > 0 && (
                  <div className="text-slate-600">
                    <span className="font-semibold">Wildlife: </span>
                    {obs.wildlife.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Inline Stream Field Photo */}
            {(() => {
              const streamPhoto = getContextualStreamPhoto(obs);
              if (!streamPhoto) return null;
              return (
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                      <Camera className="w-3.5 h-3.5 text-teal-600" />
                      <span>Stream Field Photo</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ground-truth visual evidence
                    </span>
                  </div>

                  <div
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-2xs"
                    onClick={() =>
                      setActivePhotoModal({
                        url: streamPhoto,
                        title: `${obs.siteName} · ${obs.streamName}`,
                        subtitle: `Observed by ${obs.authorName} (${obs.authorRole}) · ${obs.timestamp.replace('T', ' ').slice(0, 16)}`,
                      })
                    }
                    title="Click to inspect full photo"
                  >
                    <img
                      src={streamPhoto}
                      alt={`Stream field observation photo for ${obs.siteName}`}
                      className="w-full h-56 sm:h-64 md:h-72 object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect High-Res Photo</span>
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-slate-900/75 backdrop-blur-xs text-[10px] font-mono text-white rounded">
                      {obs.streamName} · {obs.waterAppearance}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Validation Flags if any */}
            {obs.validationFlags.length > 0 && (
              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Validation Flags: {obs.validationFlags.join('; ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredObservations.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
          No observations match the filter criteria.
        </div>
      )}

      {/* High-Resolution Photo Lightbox Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-400" />
                  <span>{activePhotoModal.title}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{activePhotoModal.subtitle}</div>
              </div>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-slate-950 flex items-center justify-center max-h-[75vh]">
              <img
                src={activePhotoModal.url}
                alt={activePhotoModal.title}
                className="max-h-[70vh] max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
