ALTER TABLE public.word_translations
ADD COLUMN IF NOT EXISTS source_language TEXT,
ADD COLUMN IF NOT EXISTS target_language TEXT;