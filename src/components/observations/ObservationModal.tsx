import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Camera, Send, Upload, Trash2 } from 'lucide-react';
import { MonitoringSite, CitizenObservation, WaterAppearance, WaterOdor, FlowCondition, RiparianCondition, PollutionType } from '../../types';
import { validateObservation } from '../../lib/analytics/validation';
import { addObservation } from '../../lib/data/dataLayer';
import { useAuth } from '../../context/AuthContext';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: MonitoringSite[];
  onObservationAdded?: (obs: CitizenObservation) => void;
  defaultSiteId?: string;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  sites,
  onObservationAdded,
  defaultSiteId,
}) => {
  const { user } = useAuth();
  const [siteId, setSiteId] = useState<string>(defaultSiteId || (sites[0]?.id ?? ''));
  const [authorName, setAuthorName] = useState<string>(user?.name || '');
  const [authorRole, setAuthorRole] = useState<CitizenObservation['authorRole']>('Citizen Scientist');

  useEffect(() => {
    if (user?.name) {
      setAuthorName(user.name);
      if (user.role?.toLowerCase().includes('admin')) {
        setAuthorRole('Municipal Field Agent');
      }
    }
  }, [user]);
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString().slice(0, 16));
  const [waterAppearance, setWaterAppearance] = useState<WaterAppearance>('Crystal Clear');
  const [odor, setOdor] = useState<WaterOdor>('None');
  const [flowCondition, setFlowCondition] = useState<FlowCondition>('Moderate Stream');
  const [riparianCondition, setRiparianCondition] = useState<RiparianCondition>('Moderate Native Buffer');
  const [pollution, setPollution] = useState<PollutionType>('None');
  const [macroNotes, setMacroNotes] = useState<string>('');
  const [wildlifeNotes, setWildlifeNotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedSite = sites.find((s) => s.id === siteId) || sites[0];

  // Live validation
  const validation = validateObservation({
    siteId,
    timestamp,
    authorName,
    waterAppearance,
    odor,
    flowCondition,
    riparianCondition,
    pollution,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;

    const newObs = addObservation({
      siteId: selectedSite.id,
      siteName: selectedSite.name,
      streamName: selectedSite.streamName,
      city: selectedSite.city,
      timestamp: new Date(timestamp).toISOString(),
      authorName: authorName.trim() || 'Anonymous Observer',
      authorRole,
      waterAppearance,
      odor,
      flowCondition,
      riparianCondition,
      pollution,
      macroinvertebrates: macroNotes ? macroNotes.split(',').map((s) => s.trim()) : [],
      wildlife: wildlifeNotes ? wildlifeNotes.split(',').map((s) => s.trim()) : [],
      notes: notes.trim(),
      photoUrl: photoUrl.trim() || undefined,
    });

    setSubmitted(true);
    if (onObservationAdded) {
      onObservationAdded(newObs.observation);
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden text-slate-800 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-base font-bold">Log Citizen Stream Observation</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Sensory field telemetry directly feeds AquaLens confidence & trend analytics
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <div className="text-base font-bold text-slate-900">Observation Verified & Logged!</div>
            <p className="text-slate-500 max-w-sm mx-auto">
              Telemetry recorded and calibrated into composite stream health and confidence scores for{' '}
              {selectedSite.name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Site & Observer info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monitoring Reach / Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.city}: {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Timestamp</label>
                <input
                  type="datetime-local"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maria Santos"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Affiliation</label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 focus:ring-1 focus:ring-teal-500 outline-hidden"
                >
                  <option value="Citizen Scientist">Citizen Scientist / Community Volunteer</option>
                  <option value="Local Monitor">Local Watershed Monitor</option>
                  <option value="University Researcher">University Researcher / Student</option>
                  <option value="Municipal Field Agent">Municipal Environmental Agent</option>
                </select>
              </div>
            </div>

            {/* Sensory Observations */}
            <div className="pt-3 border-t border-slate-100">
              <div className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
                Physicochemical & Sensory Parameters
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Water Appearance</label>
                  <select
                    value={waterAppearance}
                    onChange={(e) => setWaterAppearance(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="Crystal Clear">Crystal Clear</option>
                    <option value="Slightly Turbid">Slightly Turbid</option>
                    <option value="Heavily Turbid">Heavily Turbid</option>
                    <option value="Foamy">Foamy / White Froth</option>
                    <option value="Oily Sheen">Oily Surface Sheen</option>
                    <option value="Discolored">Discolored / Brown Plume</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Water Odor</label>
                  <select
                    value={odor}
                    onChange={(e) => setOdor(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="None">None / Fresh Water</option>
                    <option value="Earthy">Natural Earthy / Humus</option>
                    <option value="Sewage / Stagnant">Sewage / Stagnant / Septic</option>
                    <option value="Chemical">Chemical / Detergent</option>
                    <option value="Sulfur">Sulfur / Rotten Egg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Flow Velocity</label>
                  <select
                    value={flowCondition}
                    onChange={(e) => setFlowCondition(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="Dry / No Flow">Dry Stream Bed</option>
                    <option value="Trickle">Trickle / Isolated Pools</option>
                    <option value="Slow Smooth">Slow Smooth Flow</option>
                    <option value="Moderate Stream">Moderate Stream (Riffles)</option>
                    <option value="Rapid / High Torrent">Rapid Storm Torrent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Environmental & Biological Indicators */}
            <div className="pt-3 border-t border-slate-100">
              <div className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
                Ecological & Pollution Signals
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Riparian Vegetation Buffer</label>
                  <select
                    value={riparianCondition}
                    onChange={(e) => setRiparianCondition(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="Pristine Riparian Canopy">Pristine Riparian Canopy (Native Trees)</option>
                    <option value="Moderate Native Buffer">Moderate Native Vegetation Buffer</option>
                    <option value="Invasive Overgrowth">Invasive Weed Overgrowth (Arundo/Bramble)</option>
                    <option value="Sparse / Degraded">Sparse / Degraded Soil Banks</option>
                    <option value="Channelized / Concrete">Concrete / Channelized Banks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Observed Pollution / Influx</label>
                  <select
                    value={pollution}
                    onChange={(e) => setPollution(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="None">None Observed</option>
                    <option value="Plastic / Solid Trash">Plastic Bottles & Solid Trash</option>
                    <option value="Agricultural Runoff">Agricultural Runoff / Fertilizer Film</option>
                    <option value="Urban Stormwater">Urban Stormwater / Street Grate Silt</option>
                    <option value="Industrial Effluent">Industrial Chemical Effluent</option>
                    <option value="Construction Silt">Construction Wash / Clay Sediment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-slate-600 mb-1">
                    Macroinvertebrates Noted (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mayfly larvae, Caddisfly cases, Bloodworms"
                    value={macroNotes}
                    onChange={(e) => setMacroNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">
                    Wildlife / Birds / Amphibians (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kingfisher, Iberian Frog, Mallard"
                    value={wildlifeNotes}
                    onChange={(e) => setWildlifeNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-slate-600 mb-1">Field Narrative / Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Describe location details, recent weather, storm discharge, or water clarity..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-xs text-slate-800 outline-hidden"
                />
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Stream Field Photo (Optional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Inline visual ground truth</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Enter image URL (e.g. https://...)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-md p-1.5 text-xs text-slate-800 outline-hidden"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer transition-colors flex items-center gap-1 shrink-0 border border-slate-200">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setPhotoUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Quick Presets for Testing */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('/images/observations/clear_stream_gravel.jpg')}
                    className="text-teal-700 hover:underline cursor-pointer"
                  >
                    Clear Stream
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('/images/observations/water_foam_weir.jpg')}
                    className="text-teal-700 hover:underline cursor-pointer"
                  >
                    Foamy Weir
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('/images/observations/urban_runoff_outfall.jpg')}
                    className="text-teal-700 hover:underline cursor-pointer"
                  >
                    Turbid Runoff
                  </button>
                </div>

                {/* Photo Preview if attached */}
                {photoUrl && (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-36 flex items-center justify-between p-2">
                    <img
                      src={photoUrl}
                      alt="Field photo preview"
                      className="h-28 w-44 object-cover rounded border border-slate-200"
                    />
                    <div className="flex-1 px-3 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800">Photo attached</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {photoUrl.startsWith('data:') ? 'Local file selected' : photoUrl}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="mt-2 text-rose-600 hover:text-rose-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Automated Validation Layer Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Automated Validation Layer:</span>
                <span
                  className={`font-semibold font-mono text-xs px-2 py-0.5 rounded ${
                    validation.status === 'Validated'
                      ? 'bg-emerald-100 text-emerald-800'
                      : validation.status === 'Needs Review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {validation.status} ({validation.score}/100 Quality)
                </span>
              </div>

              {validation.flags.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px] text-amber-700">
                  {validation.flags.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!validation.isValid}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-md transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Field Observation</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
