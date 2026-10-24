import { useEffect, useState } from 'react';

export function usePendingCount(isAdmin: boolean) {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/pending-count')
        .then((res) => res.json())
        .then((data) => setPendingCount(data.count))
        .catch(() => setPendingCount(0));
    }
  }, [isAdmin]);

  return pendingCount;
}
