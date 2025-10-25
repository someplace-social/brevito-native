CREATE TABLE og_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT,
    subcategory TEXT,
    source TEXT,
    source_url TEXT,
    image_url TEXT
);

CREATE TABLE fact_translations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fact_id UUID NOT NULL REFERENCES og_facts(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    beginner_text TEXT,
    intermediate_text TEXT,
    advanced_text TEXT,
    beginner_text_extended TEXT,
    intermediate_text_extended TEXT,
    advanced_text_extended TEXT,
    UNIQUE(fact_id, language)
);

CREATE TABLE word_translations (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    word TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    context TEXT,
    translation JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(word, source_language, target_language, context)
);

CREATE TABLE profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

CREATE OR REPLACE FUNCTION get_random_facts(
    p_categories TEXT[],
    p_language TEXT,
    p_limit INT,
    p_offset INT
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    subcategory TEXT,
    source TEXT,
    source_url TEXT,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.category,
        f.subcategory,
        f.source,
        f.source_url,
        f.image_url
    FROM
        og_facts f
    WHERE
        EXISTS (
            SELECT 1
            FROM fact_translations ft
            WHERE ft.fact_id = f.id AND ft.language = p_language
        )
        AND (p_categories IS NULL OR f.category = ANY(p_categories))
    ORDER BY
        random()
    LIMIT
        p_limit
    OFFSET
        p_offset;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security
ALTER TABLE og_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access for og_facts" ON og_facts FOR SELECT USING (true);
CREATE POLICY "Allow public read access for fact_translations" ON fact_translations FOR SELECT USING (true);
CREATE POLICY "Allow public read access for word_translations" ON word_translations FOR SELECT USING (true);
CREATE POLICY "Allow anon insert for word_translations" ON word_translations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);