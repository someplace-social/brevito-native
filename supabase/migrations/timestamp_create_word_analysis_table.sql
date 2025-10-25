CREATE TABLE word_analysis (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    word TEXT NOT NULL,
    source_language TEXT NOT NULL,
    target_language TEXT NOT NULL,
    analysis JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(word, source_language, target_language)
);

ALTER TABLE word_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for word_analysis" ON word_analysis FOR SELECT USING (true);