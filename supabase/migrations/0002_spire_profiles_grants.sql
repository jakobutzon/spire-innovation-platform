-- Rolle-privilegier (RLS alene er ikke nok — tabellen kræver også GRANTs,
-- ellers fejler skrivninger med "permission denied for table").
grant select on public.spire_profiles to anon, authenticated;
grant insert, update on public.spire_profiles to authenticated;
