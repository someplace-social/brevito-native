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
      console.log(`[useWordAnalysis] Starting fetch for: "${word}"`);
      setIsLoading(true);
      setError(null);
      try {
        console.log('[useWordAnalysis] Invoking supabase function "analyze-word"...');
        const { data, error: invokeError } = await supabase.functions.invoke('analyze-word', {
          body: { word, sourceLanguage, targetLanguage },
        });

        console.log('[useWordAnalysis] Invoke response error:', invokeError);
        console.log('[useWordAnalysis] Invoke response data:', data);

        if (invokeError) throw invokeError;

        if (data.error) {
          throw new Error(data.error);
        }

        if (data && Array.isArray(data.analysis) && data.analysis.length > 0) {
          setAnalysis(data as WordAnalysisData);
        } else {
          throw new Error("Sorry, we couldn't find a detailed analysis for this word.");
        }
      } catch (err: any) {
        console.error('[useWordAnalysis] Fetch error:', err);
        setError(err.message || 'An error occurred fetching analysis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [word, sourceLanguage, targetLanguage, enabled]);

  return { analysis, isLoading, error };
}