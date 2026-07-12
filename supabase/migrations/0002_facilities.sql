-- OSM facilities backfill: parking flag + provenance of a details row.
-- facilities_source: 'manual' rows (hand-curated) always win over 'osm' rows.
alter table swim_spot_details
  add column if not exists has_parking boolean,
  add column if not exists facilities_source text;
