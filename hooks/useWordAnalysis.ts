import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

export type MeaningAnalysis = {
  partOfSpeech: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
};

export type WordAnalysisData = {
  rootWord?: string;
  analysis: MeaningAnalysis[];
};

type UseWordAnalysisProps = {
  word: string;
  sourceLanguage: string;
  targetLanguage: string;
  enabled: boolean;
};

export function useWordAnalysis({
  word,
  sourceLanguage,
  targetLanguage,
  enabled,
}: UseWordAnalysisProps) {
  const [analysis, setAnalysis] = useState<WordAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word || !enabled) {
      setAnalysis(null);
      return;
    }

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // NOTE: This fetches pre-computed analysis from the database.
        // A Supabase Edge Function would be needed to call a generative AI API
        // to create and insert new analyses without exposing API keys.
        const { data, error } = await supabase
          .from('word_analysis')
          .select('analysis')
          .eq('word', word.toLowerCase())
          .eq('source_language', sourceLanguage)
          .eq('target_language', targetLanguage)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setAnalysis(data.analysis as WordAnalysisData);
        } else {
          setError('No analysis found for this word.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred fetching analysis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [word, sourceLanguage, targetLanguage, enabled]);

  return { analysis, isLoading, error };
}