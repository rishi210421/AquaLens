# AquaInsight Architecture Documentation

## Overview
AquaInsight is an environmental data intelligence platform engineered for the **OneAquaHealth IEEE Global Hackathon 2026 (Track 2: Data-to-Insight)**.

Tagline: *"From stream data to actionable One Health intelligence."*

## Architectural Pipeline
```
[ RAW FIELD TELEMETRY & CITIZEN OBSERVATIONS ]
                     ↓
        [ DATA INGESTION & SCREENING ]
   (Automated Validation against Sensory Contradictions)
                     ↓
        [ STANDARDIZED NORMALIZATION ]
   (0–100 Unified Scale, Clamping & Inversions)
                     ↓
             [ ANALYTICS ENGINE ]
   (Temporal Trends, Haversine Spatial Outliers & Hotspots)
                     ↓
      [ COMPOSITE INDICATOR & CONFIDENCE ]
   (Configurable Weights, Proportional Redistribution & Penalties)
                     ↓
         [ EXPLAINABLE ROOT CAUSES ]
   ("What Changed?" Delta Attribution & "Why Flagged?" Rationale)
                     ↓
             [ ONE HEALTH SYNTHESIS ]
   (Evidence-based Ecosystem-to-Community Health Translation)
                     ↓
        [ ACTIONABLE DECISION SUPPORT ]
   (Executive PDF/CSV Reports & Targeted Surveillance Guidance)
```

## Tech Stack
- **Frontend Framework:** React 19 SPA with Vite 8 & TypeScript
- **Styling & Design System:** Tailwind CSS v4 conforming to Universal Frontend Design Constitution (anti-slop restraint, zero-pill metadata discipline, tabular numerals, 60-30-10 color allocation)
- **Data Visualizations:** Responsive SVG TimeSeries & Comparison Charts
- **Cartography:** Leaflet with OpenStreetMap Carto tiles and custom retina HTML status markers
- **Full-Stack Backend:** Node.js Express server (`server.ts`) with Vite middlewares
- **AI Integration:** `@google/genai` TypeScript SDK (`gemini-3.8-flash`) proxying on the server with complete deterministic fallback offline
- **Data Persistence:** In-memory structured repository with session caching and real-time observation ingestion
