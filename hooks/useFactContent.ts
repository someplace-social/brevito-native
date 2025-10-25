import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

type UseFactContentProps = {
  factId: string;
  language: string;
  level: string;
  isIntersecting: boolean;
};

export function useFactContent({ factId, language, level, isIntersecting }: UseFactContentProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isIntersecting && !content) {
      const fetchContent = async () => {
        try {
          const levelColumn = `${level.toLowerCase()}_text`;
          const { data, error } = await supabase
            .from('fact_translations')
            .select(levelColumn)
            .eq('fact_id', factId)
            .eq('language', language)
            .single();

          if (error) throw error;
          if (!data) throw new Error('Translation not found.');

          const factContent = data[levelColumn as keyof typeof data];
          setContent(factContent as string | null);
        } catch (err: any) {
          setError(err.message || 'Could not load content.');
        }
      };
      fetchContent();
    }
  }, [factId, isIntersecting, language, level, content]);

  const isLoading = isIntersecting && !content && !error;

  return { content, error, isLoading };
}