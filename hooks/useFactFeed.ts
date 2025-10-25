import { supabase } from '@/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Fact = {
  id: string;
  category: string | null;
  subcategory: string | null;
  source: string | null;
  source_url: string | null;
  image_url: string | null;
};

type UseFactFeedProps = {
  settingsKey: number;
  selectedCategories: string[];
  contentLanguage: string;
};

const PAGE_LIMIT = 5;

export function useFactFeed({ settingsKey, selectedCategories, contentLanguage }: UseFactFeedProps) {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const prevSettingsKey = useRef(settingsKey);

  const fetchFacts = useCallback(async (fetchPage: number, isReset: boolean) => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.rpc('get_random_facts', {
        p_categories: selectedCategories,
        p_language: contentLanguage,
        p_limit: PAGE_LIMIT,
        p_offset: fetchPage * PAGE_LIMIT,
      });

      if (error) throw error;

      const newFacts: Fact[] = data || [];
      setHasMore(newFacts.length === PAGE_LIMIT);
      setFacts((prevFacts) => {
        const currentFacts = isReset ? [] : prevFacts;
        const combined = [...currentFacts, ...newFacts];
        return Array.from(new Map(combined.map((f) => [f.id, f])).values());
      });
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategories, contentLanguage]);

  useEffect(() => {
    const isReset = prevSettingsKey.current !== settingsKey;
    if (isReset) {
      prevSettingsKey.current = settingsKey;
      setFacts([]);
      setPage(0);
      setHasMore(true);
      fetchFacts(0, true);
    } else {
      fetchFacts(page, false);
    }
  }, [page, settingsKey, fetchFacts]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return { facts, error, isLoading, hasMore, loadMore };
}