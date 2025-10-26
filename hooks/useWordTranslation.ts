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

    const fetchOrInvokeTranslation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke('translate-and-store', {
          body: { word, sourceLanguage, targetLanguage, context },
        });

        if (error) throw error;
        
        if (data.error) {
          throw new Error(data.error);
        }

        setTranslation(data.primaryTranslation);
      } catch (err: any) {
        setError(err.message || 'An error occurred.');
        setTranslation('Translation failed.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrInvokeTranslation();
  }, [word, sourceLanguage, targetLanguage, context, enabled]);

  return { translation, isLoading, error };
}