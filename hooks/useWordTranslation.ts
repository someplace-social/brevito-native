import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

type UseWordTranslationProps = {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  context: string | null;
  enabled: boolean;
};

export function useWordTranslation({
  word,
  sourceLanguage,
  targetLanguage,
  context,
  enabled,
}: UseWordTranslationProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word || !enabled) {
      setTranslation(null);
      return;
    }

    const fetchTranslation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // NOTE: This implementation only fetches existing translations.
        // A Supabase Edge Function would be required to call a third-party
        // translation API (like DeepL) and insert new translations without
        // exposing API keys on the client.
        const { data, error } = await supabase
          .from('word_translations')
          .select('translation')
          .eq('word', word.toLowerCase())
          .eq('source_language', sourceLanguage)
          .eq('target_language', targetLanguage)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore 'single row not found'
          throw error;
        }

        if (data) {
          setTranslation(data.translation.primaryTranslation);
        } else {
          // Placeholder for when no translation is found in the DB
          setTranslation('No translation found.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslation();
  }, [word, sourceLanguage, targetLanguage, context, enabled]);

  return { translation, isLoading, error };
}