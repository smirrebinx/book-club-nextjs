'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AutoRefreshProps {
  /**
   * Interval in seconds to refresh the page
   * Default: 30 seconds
   */
  interval?: number;
}

/**
 * Component that automatically refreshes the page at a specified interval
 * Uses Next.js router.refresh() to refetch server components
 */
export function AutoRefresh({ interval = 30 }: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    // Set up interval to refresh
    const intervalId = setInterval(() => {
      router.refresh();
    }, interval * 1000);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [interval, router]);

  // This component doesn't render anything
  return null;
}
