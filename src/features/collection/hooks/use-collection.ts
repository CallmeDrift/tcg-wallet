import { useCallback, useEffect, useRef, useState } from 'react';

import { initializeCollectionRepository, listCollectionCards } from '../repository/collection-repository';
import { syncCollection } from '../services/collection-sync';
import type { CollectionCard } from '../types/card';

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export function useCollection() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  const load = useCallback(async () => {
    await initializeCollectionRepository();
    const storedCards = await listCollectionCards();
    if (isMounted.current) setCards(storedCards);
  }, []);

  const refresh = useCallback(async () => {
    if (!isMounted.current) return;
    setRefreshing(true);
    setError(null);
    try {
      await syncCollection();
      await load();
    } catch (cause) {
      if (isMounted.current) setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la colección.');
    } finally {
      if (isMounted.current) setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    isMounted.current = true;
    void load().finally(() => {
      if (isMounted.current) setLoading(false);
    });
    void refresh();
    const timer = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [load, refresh]);

  return { cards, loading, refreshing, error, refresh };
}
