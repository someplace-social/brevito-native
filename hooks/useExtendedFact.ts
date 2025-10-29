import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

type ExtendedFactData = {
  content: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
  category: string | null;
  subcategory: string | null;
  image_credit: string | null;
};

type UseExtendedFactProps = {
  factId: string | null;
  language: string;
  level: string;
};

export function useExtendedFact({ factId, language, level }: UseExtendedFactProps) {
  const [data, setData] = useState<ExtendedFactData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!factId) {
      setData(null);
      return;
    }

    const fetchExtendedContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const levelColumn = `${level.toLowerCase()}_text_extended`;

        const { data: translationData, error: translationError } = await supabase
          .from('fact_translations')
          .select(levelColumn)
          .eq('fact_id', factId)
          .eq('language', language)
          .single();

        if (translationError && translationError.code !== 'PGRST116') throw translationError;

        const { data: ogFactData, error: ogFactError } = await supabase
          .from('og_facts')
          .select('source, source_url, image_url, category, subcategory, image_credit')
          .eq('id', factId)
          .single();

        if (ogFactError) throw ogFactError;

        setData({
          content: (translationData?.[levelColumn as keyof typeof translationData] as string | null) || 'No extended content available.',
          ...ogFactData,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch extended content.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExtendedContent();
  }, [factId, language, level]);

  return { data, isLoading, error };
}