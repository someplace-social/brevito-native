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
        const { data, error: invokeError } = await supabase.functions.invoke('analyze-word', {
          body: { word, sourceLanguage, targetLanguage },
        });

        if (invokeError) throw invokeError;
        
        if (data.error) {
          throw new Error(data.error);
        }

        setAnalysis(data as WordAnalysisData);
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