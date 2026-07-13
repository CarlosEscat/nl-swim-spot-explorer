-- Annual EU bathing-water classification (EEA), one value per spot per year.
-- Run manually: Supabase SQL editor or `supabase db push`.
alter table swim_spots
  add column if not exists eu_bw_id text,
  add column if not exists eu_classification text
    check (eu_classification in ('excellent', 'good', 'sufficient', 'poor', 'not_classified')),
  add column if not exists eu_classification_year int;
