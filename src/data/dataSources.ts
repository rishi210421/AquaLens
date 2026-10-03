import { DataSourceMeta } from '../types';

export const DATA_SOURCES: DataSourceMeta[] = [
  {
    id: 'oa-framework-2026',
    name: 'OneAquaHealth Indicator Reference Framework',
    url: 'https://oneaquahealth.eu',
    license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    retrievedAt: '2026-09-15',
    description:
      'Conceptual taxonomy of ecological, biological, and health-related stream indicators (benthic macroinvertebrates, water quality, habitat condition, and citizen science telemetry).',
    isSynthetic: false,
    dataType: 'Methodology Framework',
    citation: 'OneAquaHealth Consortium (2024-2026). Health Assessment Framework for Urban Streams and Ecosystems.',
  },
  {
    id: 'aquainsight-synthetic-seed',
    name: 'AquaLens Deterministic Demonstration Dataset (2025–2026)',
    url: 'https://github.com/aquainsight/aquainsight-demo-data',
    license: 'Open Data Commons Public Domain Dedication (CC0)',
    retrievedAt: '2026-10-01',
    description:
      'Synthetic time-series dataset engineered to simulate multi-parameter stream telemetry, citizen sensory reports, and benthic macroinvertebrate distributions across 5 European pilot cities.',
    isSynthetic: true,
    dataType: 'Simulated Field Telemetry & Observations',
    citation:
      'AquaLens Engineering Team (2026). Synthetic Calibration Stream Data for Prototyping.',
  },
  {
    id: 'osm-carto-tiles',
    name: 'OpenStreetMap Cartographic Infrastructure',
    url: 'https://www.openstreetmap.org/copyright',
    license: 'Open Database License (ODbL) / CC BY-SA 2.0',
    retrievedAt: '2026-10-01',
    description: 'Basemap cartography and geospatial tiles for urban freshwater reaches and catchment topography.',
    isSynthetic: false,
    dataType: 'Geographic Geospatial Tiles',
    citation: '© OpenStreetMap contributors (2026). Tile Server Infrastructure.',
  },
  {
    id: 'eea-waterbase-standards',
    name: 'European Environment Agency (EEA) Waterbase Reference Ranges',
    url: 'https://www.eea.europa.eu/data-and-maps/data/waterbase-rivers-14',
    license: 'EEA Standard Re-use Policy',
    retrievedAt: '2026-08-20',
    description:
      'Physicochemical benchmark thresholds for dissolved oxygen, electrical conductivity, nitrates, and urban runoff impacts in temperate and Mediterranean streams.',
    isSynthetic: false,
    dataType: 'Ecological Threshold Benchmarks',
    citation: 'European Environment Agency (2024). European Freshwater Quality and Ecological Status Standards.',
  },
];
