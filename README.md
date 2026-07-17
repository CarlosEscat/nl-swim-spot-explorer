# NL Swim Spot Explorer

Interactive map of all ~744 **official Dutch outdoor swimming locations** —
plus a hand-curated set of **widely-used unofficial spots**, clearly flagged —
with:

- **"Best right now" ranking** — scores every spot on live water temp, weather,
  quality and (client-side) distance to you; powered by `GET /api/live`, one
  CDN-cacheable batch snapshot for all spots
- **Water quality** — official status from zwemwater.nl advisories (+ last-measured
  date), plus a **season timeline** of this year's monthly readings per spot
- **Blue-green algae (blauwalg) front and center** — advisory reasons are parsed
  out of the raw zwemwater.nl codes (`lib/quality.ts parseAdvisory`); algae gets
  its own violet badge, a violet map-pin ring and a "hide algae warnings"
  filter, and a distinct caution in the ranking
- **EU bathing-water classification** — the annual excellent/good/sufficient/poor
  rating from the EEA dataset (the blue signs at the water), shown with its year
  next to the advisory badge (`ingest:eu`, yearly cron)
- **Water temperature** — latest reading from the nearest *live* Rijkswaterstaat
  sensor, plus a **14-day sparkline** with a "warmed X°C this week" delta
  (RWS period endpoint, fetched on demand, 6 h cache)
- **Dutch-first, English toggle** — Dutch is served on the unprefixed URLs
  (`/`, `/spots/[slug]`), English under `/en/...`; locale routing in `proxy.ts`,
  dictionaries in `dictionaries/{nl,en}.json`, hreflang/canonical/sitemap
  alternates wired for SEO
- **Weather** — current conditions per exact coordinates (Open-Meteo)
- **Aerial photos** — PDOK Luchtfoto (25 cm orthophoto) hero/thumbnail/OG image
  per spot, generated deterministically from coordinates (`lib/aerial.ts`)
- **Facilities** — toilets/food/parking auto-detected from OpenStreetMap for all
  spots (`ingest:facilities`); hand-curated data for eight city regions
  (`lib/ingest/curated/`) always wins. Spots
  without curated notes get a localized description generated from structured
  data (`lib/describe.ts`)
- **Unofficial spots** — hand-curated, widely-known swim spots that aren't
  officially designated (`seed:unofficial`, list in
  `lib/ingest/unofficial-spots.ts`); flagged everywhere with an amber pin ring,
  an "Unofficial spot" badge and a swim-at-your-own-risk note, and excluded
  from the zwemwater.nl all-clear (they show "No data / not monitored")
- **SEO pages** — two static pages per spot (`/spots/[slug]` Dutch,
  `/en/spots/[slug]` English), sitemap with language alternates, OG images

Built with Next.js (App Router) + TypeScript, Tailwind, MapLibre GL JS + MapTiler vector tiles (3D-capable map), Supabase, Vercel Cron.

## Quick start (no database needed)

The repo ships with a pre-ingested snapshot in `data/local/`. When Supabase env
vars are absent, the app and all scripts transparently read/write those JSON
files instead. The map does need a (free) [MapTiler API key](https://cloud.maptiler.com/account/keys):

```bash
npm install
echo "NEXT_PUBLIC_MAPTILER_KEY=<your key>" > .env.local
npm run dev        # → http://localhost:3000, fully working
```

## Production setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) and run the files
   in `supabase/migrations/` (0001 init, 0002 facilities, 0003 EU
   classification, 0004 water-type categories) in order in the SQL editor.
2. `cp .env.example .env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (scripts/cron only — never shipped to the client)
   - `CRON_SECRET` (any random string; set the same value in Vercel env vars)
   - `NEXT_PUBLIC_SITE_URL` (production URL, for sitemap/metadata)
   - `NEXT_PUBLIC_MAPTILER_KEY` (map tiles; restrict it to your domain in the
     [MapTiler dashboard](https://cloud.maptiler.com/account/keys) since it ships in the client bundle)
3. Ingest everything:

```bash
npm run ingest:all
```

which runs, in order:

| Script | What it does |
|---|---|
| `ingest:locations` | Pulls the PDOK *Zwemwaterlocaties* INSPIRE dataset (GML), converts polygon centroids EPSG:3035 → WGS84, reverse-geocodes province/municipality via PDOK Locatieserver, upserts `swim_spots` |
| `seed:unofficial` | Hand-curated, widely-used **unofficial** swim spots (`official_status: "unofficial"`) with access notes; not quality-monitored, flagged as swim-at-your-own-risk in the UI. Add new ones in `lib/ingest/unofficial-spots.ts` |
| `seed:stations` | Pulls the RWS WaterWebservices catalog (~1080 stations measuring surface-water temp), probes them in batches and keeps only the ~116 with a reading in the last 7 days, then links every spot to its nearest live station (≤ 25 km) |
| `ingest:quality` | Downloads the monthly zwemwater.nl advisory XLSX, maps active advisories (warning / negative advice / ban) onto spots by normalized name, snapshots a status per spot into `water_quality_readings` |
| `seed:details` | Hand-curated facilities/hours for the Amsterdam, Utrecht, Rotterdam, Den Haag, Eindhoven, Alkmaar, Haarlem and Groningen regions (~83 spots; one seed module per city in `lib/ingest/curated/`) |
| `ingest:facilities` | Downloads toilets/parking/food/lifeguard POIs for all of NL from OSM Overpass (one country-wide dump per category — spatially-scoped queries time out at 744 spots), matches them to spots via a grid index (300–400 m radius), fills only fields the curated seeds left null |
| `ingest:eu` | Pulls the latest-season EU bathing-water classifications + registry coordinates from EEA DISCODATA, joins them to official spots by proximity (0.5 km cap, normalized-name fallback; ~98% matched), stores `eu_bw_id` / `eu_classification` / `eu_classification_year` and the water category (`water_type`: sea/lake/river/transitional) on `swim_spots` |
| `compute:featured` | Re-derives the featured set from data: official spots rated "excellent" (EU) ranked by facility count, top 5 per province, plus the hand-picked list in `lib/ingest/featured-spots.ts` |

## Scheduled refresh (Vercel Cron)

`vercel.json` defines five jobs (all authorized via the `CRON_SECRET` bearer
token Vercel sends automatically):

- `/api/cron/refresh-quality` — monthly (2nd, 06:00 UTC): re-ingests the advisory
  XLSX; readings are append-only per `(spot_id, measured_at, source)`, so this
  builds the per-spot quality history the season timeline renders
- `/api/cron/refresh-locations` — weekly (Mon, 05:00 UTC): re-pulls PDOK **and**
  re-probes live stations / re-links nearest stations
- `/api/cron/refresh-facilities` — monthly (3rd, 06:00 UTC): re-runs the OSM
  facilities backfill
- `/api/cron/refresh-eu-classification` — yearly (June 20, 06:00 UTC, after the
  EEA publishes): re-ingests the annual EU classification + water categories
- `/api/cron/refresh-featured` — monthly (3rd, 07:00 UTC, after the facilities
  refresh): re-derives the data-driven featured set

Live data (weather + water temp) is deliberately **not** cron-ingested: the
`/api/spot/[slug]/live` route fetches it on request with a 30-minute cache, and
`/api/live` returns a batch snapshot for all spots at once (RWS stations
batched 60/request; weather fetched per ~11 km grid cell to stay inside
Open-Meteo's burst limits) behind the same 30-minute CDN cache. Water-temp
*history* (`/api/spot/[slug]/water-history`) is likewise fetched on demand from
RWS's period endpoint, aggregated to daily min/avg/max, behind a 6-hour cache;
`/api/spot/[slug]/quality-history` serves the stored season readings with a
1-day cache.

## Architecture

Two views: how data gets **into** the store, and how it flows **out** to the
browser at runtime.

### Ingestion pipeline (CLI scripts + Vercel Cron)

Every ingest lives in `lib/ingest/` and is shared by a thin CLI wrapper in
`scripts/` and (where scheduled) a cron route in `app/api/cron/`. All writes go
through the `DataStore` interface, which picks Supabase or local JSON at
runtime based on env vars.

```mermaid
flowchart LR
  subgraph ext["External sources"]
    SRC1["PDOK Zwemwaterlocaties GML<br/>+ Locatieserver geocoding"]
    SRC2["zwemwater.nl<br/>advisory XLSX"]
    SRC3["Rijkswaterstaat<br/>WaterWebservices 2.0"]
    SRC4["OSM Overpass<br/>(country-wide POI dumps)"]
    SRC5["EEA DISCODATA<br/>(EU bathing-water classification)"]
  end

  subgraph ds["lib/data-sources/"]
    A1["pdok.ts"]
    A2["zwemwater.ts"]
    A3["rws-ddl.ts"]
    A4["overpass.ts"]
    A5["eea-bwd.ts"]
  end

  subgraph ing["lib/ingest/  (scripts/*.ts CLI = app/api/cron/* routes)"]
    I1["locations.ts"]
    I2["quality.ts"]
    I3["stations.ts<br/>+ nearest-station links"]
    I4["facilities.ts<br/>(grid-index matching)"]
    I5["curated-details.ts + curated/*<br/>(hand-curated, always wins)"]
    I6["eu-classification.ts<br/>(proximity join, yearly)<br/>+ water categories"]
    I7["featured.ts<br/>(derived: EU rating + facilities)"]
  end

  STORE["lib/db/store.ts<br/>DataStore interface"]
  LOCAL["local-store.ts<br/>data/local/*.json"]
  SUPA["supabase-store.ts<br/>Supabase (Postgres)"]

  SRC1 --> A1 --> I1
  SRC2 --> A2 --> I2
  SRC3 --> A3 --> I3
  SRC4 --> A4 --> I4
  SRC5 --> A5 --> I6
  I1 --> STORE
  I2 --> STORE
  I3 --> STORE
  I4 --> STORE
  I5 --> STORE
  I6 --> STORE
  I7 --> STORE
  STORE --> LOCAL
  STORE --> SUPA
```

### Runtime request flow

Live data (water temp, weather) is never stored — it's fetched on request with
a 30-minute cache. Aerial imagery is never stored either: `lib/aerial.ts`
builds a deterministic PDOK WMS URL from each spot's coordinates.

Locale routing happens in `proxy.ts` (Next 16's middleware convention): Dutch
is an invisible rewrite of unprefixed URLs to `/nl/...`, English is a real
`/en` segment; both render from `app/[lang]/`, with the dictionary threaded
into the client tree via `I18nProvider`.

```mermaid
flowchart LR
  subgraph pages["Server-rendered pages (app/(lang)/, nl + en)"]
    HOME["page.tsx<br/>(map, hourly ISR)"]
    SPOT["spots/(slug)/page.tsx<br/>(744 spots × 2 locales)"]
    OG["opengraph-image.tsx"]
  end

  subgraph client["Client components"]
    EXP["Explorer.tsx<br/>(filters incl. hide-algae)"]
    MAP["SwimMap.tsx<br/>(MapLibre GL + clustering + 3D<br/>+ algae pin ring)"]
    RANK["RankedList.tsx<br/>lib/score.ts + geolocation"]
    PANEL["SpotPanel.tsx"]
    LIVEC["SpotLiveClient.tsx"]
    WHIST["WaterHistory.tsx<br/>(sparkline + week delta)"]
    QHIST["QualityHistoryClient.tsx<br/>(season timeline)"]
  end

  subgraph api["API routes"]
    LIVEALL["GET /api/live<br/>batch snapshot, all spots"]
    LIVEONE["GET /api/spot/(id)/live<br/>one spot"]
    WH["GET /api/spot/(id)/water-history<br/>daily temps, 14 d"]
    QH["GET /api/spot/(id)/quality-history<br/>stored season readings"]
  end

  STORE["DataStore"]
  RWS["rws-ddl.ts → RWS<br/>(latest batched 60/req;<br/>history via period endpoint)"]
  METEO["open-meteo.ts → Open-Meteo<br/>(one call per ~11 km grid cell)"]
  FOTO["lib/aerial.ts → PDOK Luchtfoto WMS"]

  STORE --> HOME --> EXP
  EXP --> MAP
  EXP --> RANK
  EXP --> PANEL
  PANEL --> WHIST
  PANEL --> QHIST
  STORE --> SPOT --> LIVEC --> WHIST
  STORE --> OG
  RANK -- "fetch" --> LIVEALL
  PANEL -- "fetch" --> LIVEONE
  LIVEC -- "fetch" --> LIVEONE
  WHIST -- "fetch" --> WH
  QHIST -- "fetch" --> QH
  LIVEALL --> RWS
  LIVEALL --> METEO
  LIVEALL --> STORE
  LIVEONE --> RWS
  LIVEONE --> METEO
  WH --> RWS
  QH --> STORE
  FOTO --> SPOT
  FOTO --> PANEL
  FOTO --> OG
```

### Directory map

```text
proxy.ts                    # locale routing: nl unprefixed (rewrite), /en real segment
dictionaries/               # nl.json + en.json (all UI strings, weather codes, labels)
app/
  [lang]/page.tsx           # map home (ISR 1h) → I18nProvider → Explorer
  [lang]/layout.tsx         # <html lang>, header, NL|EN switcher, per-locale metadata
  [lang]/spots/[slug]/      # static page per spot per locale + opengraph-image.tsx
  api/live/route.ts         # batch live snapshot (CDN-cached 30 min)
  api/spot/[id]/live/       # per-spot live data
  api/spot/[id]/water-history/    # daily water temps (14 d) + week delta (6 h cache)
  api/spot/[id]/quality-history/  # stored season readings (1 d cache)
  api/cron/refresh-*        # quality / locations / facilities / eu-classification
components/
  Explorer.tsx              # client state hub: map + ranked list + panel + filters
  SwimMap.tsx  RankedList.tsx  SpotPanel.tsx  SpotLiveClient.tsx
  I18nProvider.tsx  LanguageSwitcher.tsx
  WaterHistory.tsx  TempSparkline.tsx  QualityHistoryClient.tsx  QualityTimeline.tsx
  EuClassBadge.tsx
lib/
  i18n.ts                   # Locale, getDictionary, t(), formatDate, pathFor
  db/store.ts               # DataStore interface → supabase-store | local-store
  data-sources/             # one adapter per external API (incl. eea-bwd.ts)
  ingest/                   # write pipelines (shared by scripts/ and cron)
  aerial.ts  score.ts  geo.ts  quality.ts  slug.ts  types.ts  cron-auth.ts
scripts/                    # CLI wrappers: ingest:*, seed:* (npm run)
data/local/                 # pre-ingested JSON snapshot (no-DB quick start)
supabase/migrations/        # schema (0001 init, 0002 facilities, 0003 EU classification)
```

## Data sources & credits

| Data | Source |
|---|---|
| Locations | [PDOK — Zwemwaterlocaties (INSPIRE)](https://service.pdok.nl/provincies/zwemwater-provinciaal-rijkswateren/atom/v1_0/index.xml) (CC-BY 4.0) |
| Province/municipality | [PDOK Locatieserver](https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse) reverse geocoding |
| Water quality | [zwemwater.nl](https://www.zwemwater.nl/data-en-api) monthly published-measures XLSX |
| Water temperature | [Rijkswaterstaat WaterWebservices 2.0](https://rijkswaterstaatdata.nl/waterdata/) (`ddapi20-waterwebservices.rijkswaterstaat.nl`; latest + period history) |
| EU classification | [EEA DISCODATA](https://discodata.eea.europa.eu/) `WISE_BWD` (annual bathing-water status + registry coordinates) |
| Weather | [Open-Meteo](https://open-meteo.com/) (no key) |
| Aerial photos | [PDOK — Luchtfoto Actueel Ortho 25cm](https://www.pdok.nl/introductie/-/article/luchtfoto-pdok) (Beeldmateriaal Nederland, CC-BY 4.0) |
| Map tiles | [MapTiler](https://www.maptiler.com/copyright/) Outdoor v2 vector style (© MapTiler © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors), rendered with [MapLibre GL JS](https://maplibre.org/) |

Facilities for non-featured spots are auto-detected from OpenStreetMap
(`ingest:facilities`) and labeled as such in the UI; toilets/food/parking are
well-mapped in NL so "not found nearby" is shown as "No", while lifeguard
presence stays "Unknown" without positive evidence. `webcam_url` exists in the
schema but is null everywhere — no genuine public webcams exist at Dutch swim
spots today.

## Notes & follow-ups (from the build plan)

- **BIJ12 WFS access**: email communicatie@bij12.nl about direct WMS/WFS access to
  the zwemwater register — would replace the XLSX ingestion and could backfill
  facilities nationally. Parallel track, not a blocker.
- The classic RWS API (`waterwebservices.rijkswaterstaat.nl`) was retired April
  2026; this project already uses the successor ("Wadar") API.
- Spots >25 km from a live sensor show "—" for water temperature instead of a
  misleading stale grab-sample value; readings older than 72 h are discarded.
- **EEA data lag**: DISCODATA's `[latest]` schema trails the annual report by a
  few months (season 2024 as of July 2026 even though the 2025 report PDF is
  out). `ingest:eu` always takes `MAX(season)`, and the UI shows the year on
  the badge, so stale data is self-describing.
- The quality **season timeline** renders only once a spot has ≥2 stored
  readings; history accumulates one snapshot per monthly cron run, so first
  seasons look sparse by design.
- **Deploying the EU-classification feature to prod**: run
  `supabase/migrations/0003_eu_classification.sql`, then `npm run ingest:eu`
  once (the yearly cron takes over afterwards).
