-- Split access_notes into per-locale columns — the single column was
-- English-only content rendered verbatim on the Dutch pages too. Existing
-- content (all English) is preserved as access_notes_en; access_notes_nl is
-- backfilled by re-running seed:details / seed:unofficial.
-- Run manually: Supabase SQL editor or `supabase db push`.
alter table swim_spot_details
  add column if not exists access_notes_nl text,
  add column if not exists access_notes_en text;

update swim_spot_details
  set access_notes_en = access_notes
  where access_notes is not null and access_notes_en is null;

alter table swim_spot_details
  drop column if exists access_notes;
