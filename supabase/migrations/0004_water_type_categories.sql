-- water_type: replace the unused fresh/salt split with the EEA bathing-water
-- categories (spatial_ProtectedArea.specialisedZoneType), backfilled by the
-- EU classification ingest.
alter table swim_spots drop constraint swim_spots_water_type_check;
update swim_spots set water_type = null
  where water_type is not null
    and water_type not in ('sea', 'lake', 'river', 'transitional');
alter table swim_spots add constraint swim_spots_water_type_check
  check (water_type in ('sea', 'lake', 'river', 'transitional'));
