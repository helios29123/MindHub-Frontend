import { useState, useEffect } from 'react';
import { homeApi } from '@/features/home/api';
import { ILearningDashboardData } from '@/types/learningDashboard';

export function useLearningDashboardData() {
  const [data, setData] = useState<ILearningDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const res = await homeApi.getLearningDashboard();
        
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
