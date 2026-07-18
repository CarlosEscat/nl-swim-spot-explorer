-- zwemwater.nl internal location id (the ?id= in their URLs), matched by
-- normalized name from their public location list. Powers the per-spot
-- bacteriological measurements chart.
-- Run manually: Supabase SQL editor or `supabase db push`.
alter table swim_spots
  add column if not exists zwemwater_id text;
