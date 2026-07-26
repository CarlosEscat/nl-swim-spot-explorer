-- Dog-friendly flag on a details row. Tri-state like nude_recreation:
-- null = unknown, true/false = curated. Seasonal nuance (dogs are typically
-- banned at official beaches 1 May – 1 Oct, allowed off-season) lives in the
-- access_notes copy; this boolean carries only the headline.
alter table swim_spot_details
  add column if not exists dogs_allowed boolean;
