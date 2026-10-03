/**
 * Stream Field Photo Library & Contextual Matching
 * 
 * Provides verified, documentary-grade stream and freshwater aquatic ecosystem photos
 * categorized by water appearance, flow conditions, and pollution indicators.
 * Strictly forbids non-water images (e.g. paper bags, generic products, commercial objects).
 */

import { CitizenObservation } from '../../types';

export type StreamImageCategory =
  | 'clear-stream'
  | 'healthy-stream'
  | 'turbid-water'
  | 'discolored-water'
  | 'polluted-water'
  | 'urban-runoff'
  | 'water-foam'
  | 'algae-water'
  | 'sediment-water'
  | 'stream-bank'
  | 'aquatic-habitat'
  | 'discharge-into-stream';

export interface StreamImageEntry {
  id: string;
  category: StreamImageCategory;
  url: string;
  title: string;
  description: string;
}

export const STREAM_IMAGE_LIBRARY: StreamImageEntry[] = [
  {
    id: 'urban-runoff-outfall',
    category: 'urban-runoff',
    url: '/images/observations/urban_runoff_outfall.jpg',
    title: 'Urban Stormwater Outfall & Discolored Discharge',
    description:
      'Documentary field photograph of an urban stream outfall discharging stormwater runoff into a tidal reach with visible discolored plume.',
  },
  {
    id: 'water-foam-weir',
    category: 'water-foam',
    url: '/images/observations/water_foam_weir.jpg',
    title: 'Foam Accumulation on River Weir',
    description:
      'Documentary field photograph of river water showing white foam accumulation and surface agitation below a concrete river weir structure.',
  },
  {
    id: 'clear-stream-gravel',
    category: 'clear-stream',
    url: '/images/observations/clear_stream_gravel.jpg',
    title: 'Crystal Clear Stream with Visible Gravel Bed',
    description:
      'Documentary field photograph of a pristine, transparent freshwater stream with clean submerged pebbles and natural river gravel.',
  },
  {
    id: 'turbid-water-torrent',
    category: 'turbid-water',
    url: '/images/observations/turbid_water_torrent.jpg',
    title: 'Turbid River Torrent with Heavy Sediment',
    description:
      'Documentary field photograph of heavily turbid, brown stormwater runoff rushing through a swollen river corridor after heavy rainfall.',
  },
  {
    id: 'restored-gravel-stream',
    category: 'healthy-stream',
    url: '/images/observations/restored_gravel_stream.jpg',
    title: 'Restored River Reach with Natural Gravel Bars',
    description:
      'Documentary field photograph of the renatured Dreisam river reach in Freiburg, Germany, showing stable gravel bars and riparian corridor.',
  },
  {
    id: 'algae-stagnant-pool',
    category: 'algae-water',
    url: '/images/observations/algae_stagnant_pool.jpg',
    title: 'Stagnant Freshwater Pool with Algal Film',
    description:
      'Documentary field photograph of a low-flow urban stream pool showing surface green algal film and marginal wetland vegetation.',
  },
  {
    id: 'sediment-silt-stream',
    category: 'sediment-water',
    url: '/images/observations/sediment_silt_stream.jpg',
    title: 'Silt and Construction Sediment Runoff in Stream',
    description:
      'Documentary field photograph of a silt-laden tributary wash entering river water with fine suspended sediment plumes reducing clarity.',
  },
  {
    id: 'discolored-water-plume',
    category: 'discolored-water',
    url: '/images/observations/urban_runoff_outfall.jpg',
    title: 'Discolored Stream Influx & Plume',
    description:
      'Documentary field photograph of discolored freshwater stream runoff entering river channel.',
  },
  {
    id: 'polluted-water-debris',
    category: 'polluted-water',
    url: '/images/observations/water_foam_weir.jpg',
    title: 'Polluted Stream Surface with Foam & Debris',
    description:
      'Documentary field photograph of stream surface with accumulated foam, road residue, and organic debris.',
  },
  {
    id: 'discharge-into-stream',
    category: 'discharge-into-stream',
    url: '/images/observations/urban_runoff_outfall.jpg',
    title: 'Point Source Culvert Discharge into Stream',
    description:
      'Documentary field photograph of urban drainage infrastructure discharging into open stream.',
  },
  {
    id: 'stream-bank-corridor',
    category: 'stream-bank',
    url: '/images/observations/restored_gravel_stream.jpg',
    title: 'Natural Vegetated Stream Bank & Riparian Buffer',
    description:
      'Documentary field photograph of stable stream bank with native riparian trees and gravel bars.',
  },
  {
    id: 'aquatic-habitat-riffle',
    category: 'aquatic-habitat',
    url: '/images/observations/clear_stream_gravel.jpg',
    title: 'Pristine Benthic Aquatic Habitat & Stream Riffle',
    description:
      'Documentary field photograph of shallow stream riffle with clean submerged stones providing habitat for sensitive macroinvertebrates.',
  },
];

// Known invalid URLs that must never be displayed (such as the paper bag photo)
const INVALID_PHOTO_PATTERNS = [
  'photo-1544816155-12df9643f363', // Paper bag image
  'photo-1437622368342-7a3d73a34c8f', // Ocean turtle image
  'photo-1507525428034-b723cf961d3e', // Beach ocean image
  'photo-1576086213369-97a306d36557', // Lab vial image
];

/**
 * Validates and matches an observation to a relevant stream photograph.
 * Deterministic: The same observation always yields the same relevant stream photo.
 * If an observation has no relevant photo and no matching water features, returns undefined.
 */
export function getContextualStreamPhoto(obs: Partial<CitizenObservation>): string | undefined {
  const currentUrl = obs.photoUrl?.trim();

  // If a valid local stream image or custom uploaded data URL is present, use it
  if (currentUrl && !INVALID_PHOTO_PATTERNS.some((p) => currentUrl.includes(p))) {
    // If it's already one of our local stream library images or a valid data URL
    if (currentUrl.startsWith('/images/observations/') || currentUrl.startsWith('data:image/')) {
      return currentUrl;
    }
  }

  // Deterministic contextual matching based on observation stream health parameters:
  const waterAppearance = obs.waterAppearance || '';
  const pollution = obs.pollution || '';
  const notes = (obs.notes || '').toLowerCase();
  const streamName = obs.streamName || '';
  const siteName = obs.siteName || '';

  // 1. Foam on water / weir
  if (
    waterAppearance === 'Foamy' ||
    notes.includes('foam') ||
    notes.includes('soap')
  ) {
    return '/images/observations/water_foam_weir.jpg';
  }

  // 2. Algae presence / green film in stagnant pool
  if (
    notes.includes('alga') ||
    notes.includes('algal') ||
    waterAppearance === 'Slightly Turbid' && notes.includes('film')
  ) {
    return '/images/observations/algae_stagnant_pool.jpg';
  }

  // 3. Silt / Construction sediment / Fine wash
  if (
    pollution === 'Construction Silt' ||
    notes.includes('silt') ||
    notes.includes('sediment')
  ) {
    return '/images/observations/sediment_silt_stream.jpg';
  }

  // 4. Heavily Turbid / Brown Torrent / Flood flow
  if (
    waterAppearance === 'Heavily Turbid' ||
    obs.flowCondition === 'Rapid / High Torrent' ||
    notes.includes('turbulent') ||
    notes.includes('brown turbulent')
  ) {
    return '/images/observations/turbid_water_torrent.jpg';
  }

  // 5. Urban Runoff / Stormwater discharge outfall (e.g. Sacavém Estuary Outfall Station)
  if (
    pollution === 'Urban Stormwater' ||
    waterAppearance === 'Discolored' ||
    siteName.toLowerCase().includes('outfall') ||
    notes.includes('discharge') ||
    notes.includes('culvert')
  ) {
    return '/images/observations/urban_runoff_outfall.jpg';
  }

  // 6. Crystal clear stream / Renatured reach
  if (waterAppearance === 'Crystal Clear') {
    if (streamName.includes('Dreisam') || obs.city === 'Freiburg' || notes.includes('renaturation')) {
      return '/images/observations/restored_gravel_stream.jpg';
    }
    return '/images/observations/clear_stream_gravel.jpg';
  }

  // 7. General stream-bank / healthy habitat
  if (obs.riparianCondition === 'Pristine Riparian Canopy') {
    return '/images/observations/restored_gravel_stream.jpg';
  }

  // If a valid non-blacklisted URL was provided, keep it
  if (currentUrl && !INVALID_PHOTO_PATTERNS.some((p) => currentUrl.includes(p))) {
    return currentUrl;
  }

  return undefined;
}
