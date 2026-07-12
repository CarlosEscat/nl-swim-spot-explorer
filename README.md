# NL Swim Spot Explorer

Interactive map of all ~744 **official Dutch outdoor swimming locations**, with:

- **Water quality** — official status from zwemwater.nl advisories (+ last-measured date)
- **Water temperature** — latest reading from the nearest *live* Rijkswaterstaat sensor
- **Weather** — current conditions per exact coordinates (Open-Meteo)
- **Facilities & access hours** — hand-curated for the featured Amsterdam-area spots
- **SEO pages** — one static page per spot (`/spots/[slug]`), sitemap, OG images

Built with Next.js (App Router) + TypeScript, Tailwind, Leaflet/OpenStreetMap, Supabase, Vercel Cron.

## Quick start (no database needed)

The repo ships with a pre-ingested snapshot in `data/local/`. When Supabase env
vars are absent, the app and all scripts transparently read/write those JSON
files instead:

```bash
npm install
npm run dev        # → http://localhost:3000, fully working
```

## Production setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com) and run
   `supabase/migrations/0001_init.sql` in the SQL editor.
2. `cp .env.example .env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (scripts/cron only — never shipped to the client)
   - `CRON_SECRET` (any random string; set the same value in Vercel env vars)
   - `NEXT_PUBLIC_SITE_URL` (production URL, for sitemap/metadata)
3. Ingest everything:

```bash
npm run ingest:all
```

which runs, in order:

| Script | What it does |
|---|---|
| `ingest:locations` | Pulls the PDOK *Zwemwaterlocaties* INSPIRE dataset (GML), converts polygon centroids EPSG:3035 → WGS84, reverse-geocodes province/municipality via PDOK Locatieserver, upserts `swim_spots` |
| `seed:stations` | Pulls the RWS WaterWebservices catalog (~1080 stations measuring surface-water temp), probes them in batches and keeps only the ~116 with a reading in the last 7 days, then links every spot to its nearest live station (≤ 25 km) |
| `ingest:quality` | Downloads the monthly zwemwater.nl advisory XLSX, maps active advisories (warning / negative advice / ban) onto spots by normalized name, snapshots a status per spot into `water_quality_readings` |
| `seed:amsterdam` | Hand-curated facilities/hours for the 15 featured Amsterdam-area spots (Gaasperplas, IJburg, Nieuwe Meer, Diemerpark, Marineterrein, Het Twiske) |

## Scheduled refresh (Vercel Cron)

`vercel.json` defines two jobs (both authorized via the `CRON_SECRET` bearer
token Vercel sends automatically):

- `/api/cron/refresh-quality` — monthly (2nd, 06:00 UTC): re-ingests the advisory XLSX
- `/api/cron/refresh-locations` — weekly (Mon, 05:00 UTC): re-pulls PDOK **and**
  re-probes live stations / re-links nearest stations

Live data (weather + water temp) is deliberately **not** cron-ingested: the
`/api/spot/[slug]/live` route fetches it on request with a 30-minute cache.

## Data sources & credits

| Data | Source |
|---|---|
| Locations | [PDOK — Zwemwaterlocaties (INSPIRE)](https://service.pdok.nl/provincies/zwemwater-provinciaal-rijkswateren/atom/v1_0/index.xml) (CC-BY 4.0) |
| Province/municipality | [PDOK Locatieserver](https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse) reverse geocoding |
| Water quality | [zwemwater.nl](https://www.zwemwater.nl/data-en-api) monthly published-measures XLSX |
| Water temperature | [Rijkswaterstaat WaterWebservices 2.0](https://rijkswaterstaatdata.nl/waterdata/) (`ddapi20-waterwebservices.rijkswaterstaat.nl`) |
| Weather | [Open-Meteo](https://open-meteo.com/) (no key) |
| Map tiles | [OpenStreetMap](https://www.openstreetmap.org/copyright) |

Facilities for non-featured spots are shown as "not curated yet" rather than
guessed. `webcam_url` exists in the schema but is null everywhere — no genuine
public webcams exist at Dutch swim spots today.

## Notes & follow-ups (from the build plan)

- **BIJ12 WFS access**: email communicatie@bij12.nl about direct WMS/WFS access to
  the zwemwater register — would replace the XLSX ingestion and could backfill
  facilities nationally. Parallel track, not a blocker.
- The classic RWS API (`waterwebservices.rijkswaterstaat.nl`) was retired April
  2026; this project already uses the successor ("Wadar") API.
- Spots >25 km from a live sensor show "—" for water temperature instead of a
  misleading stale grab-sample value; readings older than 72 h are discarded.
