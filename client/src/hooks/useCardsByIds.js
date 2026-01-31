import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api';

export function useCardsByIds(ids) {
  const stableIds = useMemo(() => Array.from(new Set((ids || []).filter(Boolean))), [ids]);
  const [cardsById, setCardsById] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!stableIds.length) {
        setCardsById({});
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await apiRequest('/cards/bulk', { method: 'POST', body: { ids: stableIds } });
        if (cancelled) return;
        setCardsById(res.cards || {});
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [stableIds]);

  return { cardsById, loading, error };
}
