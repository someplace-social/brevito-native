-- supabase/migrations/YYYYMMDDHHMMSS_add_image_credit_to_og_facts.sql
alter table public.og_facts
add column image_credit text null;