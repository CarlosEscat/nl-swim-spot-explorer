-- The site only ever needs the newest reading per spot, but PostgREST cannot
-- express "distinct on", so supabase-store.ts paged through the entire
-- water_quality_readings table (41k rows, ~8.9 MB of JSON, 42 requests) on
-- every call to getSpotsWithData() -- i.e. on every render of every spot page.
-- Collapsing it here instead costs one request and ~170 kB.
--
-- security_invoker so the underlying table's "public read" RLS policy is what
-- decides access, rather than the view owner's rights.
create view latest_quality_by_spot
  with (security_invoker = on) as
select distinct on (spot_id) *
from water_quality_readings
-- Matches water_quality_readings_spot_measured, so this is an index scan.
-- `source` only breaks ties between two sources reporting the same date; the
-- old code took whichever row PostgREST happened to return first.
order by spot_id, measured_at desc, source;

grant select on latest_quality_by_spot to anon, authenticated, service_role;
