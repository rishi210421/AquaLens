# AquaInsight

> **Tagline:** "From stream data to actionable One Health intelligence."  
> **Hackathon:** OneAquaHealth IEEE Global Hackathon 2026  
> **Track:** Track 2 — Data-to-Insight  
> **Challenge:** "Turn citizen-collected data into actionable stream health and One Health insights."

---

## 1. Problem Statement
Urban freshwater streams generate continuous sensory, physical, and citizen science data. However, this raw data is difficult for citizens, educators, and municipal authorities to interpret:
- It fails to clearly demonstrate **what changed** over time.
- It conceals observational uncertainty and missing sensor streams.
- It fails to connect localized environmental degradation to broader **One Health** outcomes.

## 2. The Solution
AquaInsight transforms citizen-collected observations and multi-parameter stream telemetry into understandable, confidence-aware, spatial and temporal intelligence.

```
RAW CITIZEN / ENVIRONMENTAL DATA
        ↓
DATA CLEANING & VALIDATION
        ↓
DATA NORMALIZATION (0–100)
        ↓
ANALYTICS (SPATIAL & TEMPORAL)
        ↓
AQUAINSIGHT COMPOSITE INDICATOR
        ↓
DATA CONFIDENCE & COVERAGE
        ↓
"WHAT CHANGED?" & "WHY FLAGGED?"
        ↓
ONE HEALTH CONTEXT
        ↓
ACTIONABLE SURVEILLANCE RECOMMENDATIONS
```

---

## 3. Key Capabilities
1. **Interactive Cartography:** Full geospatial map of monitoring reaches across 5 European pilot cities with custom retina status markers (Healthy, Watch, Attention, Insufficient).
2. **Dynamic Composite Stream Health Indicator:** 0–100 normalized score balancing Water Quality (30%), Biodiversity (25%), Habitat Condition (20%), Citizen Signals (15%), and Environmental Context (10%).
3. **Proportional Weight Redistribution:** Automatically recalculates composite scores without treating missing parameters as zero score, applying an explicit confidence penalty.
4. **"What Changed?" Period-over-Period Attribution:** Pinpoints the single largest shifting parameter across 7d, 30d, 90d, and 1y windows.
5. **"Why is this site flagged?":** Deterministic root-cause explanations with quantitative evidence.
6. **Evidence-Based Confidence Model:** Evaluates observation density, temporal recency, and multi-indicator coverage into High, Medium, or Low ratings.
7. **Spatial Hotspot Detection:** Flags localized reaches deviating $\ge 12$ points below nearby catchment averages.
8. **Multi-Reach Comparison:** Comparative analytics across 2 to 5 monitoring sites.
9. **Citizen Science Logging & Validation Layer:** Interactive submission form with real-time sensory consistency checks.
10. **Ask AquaInsight:** Grounded natural-language data exploration powered by Gemini 3.8 Flash with deterministic offline fallbacks.
11. **Executive Reporting & Export:** Instant CSV export and printable reach summaries.

---

## 4. Tech Stack & Architecture
- **Frontend:** React 19 SPA with Vite 8 & TypeScript
- **Styling:** Tailwind CSS v4 conforming to Universal Frontend Design Constitution (anti-slop restraint, zero-pill metadata discipline, tabular numerals, 60-30-10 color allocation)
- **Map Infrastructure:** Leaflet with OpenStreetMap Carto tiles
- **Charts:** Lightweight, responsive SVG time-series & grouped bar visualizations
- **Full-Stack Server:** Node.js Express server (`server.ts`) with Vite middlewares
- **AI Integration:** `@google/genai` TypeScript SDK (`gemini-3.8-flash`) proxying on the server with deterministic fallbacks

---

## 5. Demonstration / Synthetic Dataset Disclosure
Because this application is a hackathon prototype, it operates out of the box using a deterministic demonstration dataset spanning:
- **5 European Pilot Cities:** Lisbon (Portugal), Lyon (France), Bristol (UK), Freiburg (Germany), and Valencia (Spain).
- **20 Urban Streams & 60+ Monitoring Reaches:** Across urban dense, suburban, park, industrial, and agricultural land uses.
- **12+ Months Time-Series:** Physicochemical parameters (DO, pH, turbidity, conductivity, nitrates), macroinvertebrate indicators, and citizen logs.

*Note: All prototype data is clearly designated as simulated demonstration data and was not collected from human subjects.*

---

## 6. Installation & Run Instructions

### Prerequisites
- Node.js $\ge 18$
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file (optional, for Gemini AI features):
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
*Note: If no API key is set, AquaInsight runs 100% of features using its deterministic template engine.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Analytics Test Suite
```bash
npx tsx tests/analytics.test.ts
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## 7. Limitations & Future Scope
- The prototype composite score is an algorithmic simulation and does not replace official environmental agency standards.
- Micro-pollutants and heavy metals require certified laboratory chemical assay integration.
- Future work will incorporate IoT sensor streaming and automated LoRaWAN water-quality probe integrations.

---

## 8. License
Developed for the **OneAquaHealth IEEE Global Hackathon 2026**. Code distributed under the Apache-2.0 License.
