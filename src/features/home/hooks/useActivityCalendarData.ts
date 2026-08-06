import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { IActivityCalendarData } from '@/types/learningDashboard';

export function useActivityCalendarData() {
  const [data, setData] = useState<IActivityCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await homeApi.getActivityCalendar();
        
        if (isMounted) {
          setData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
