import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface StatsData {
  totalExpenses: number;
  gymDays: number;
  checkInDays: number;
  expensesHistory: {
    date: string;
    amount: number;
    category: string;
    note: string;
  }[];
  activeDates: Date[];
}

export function useStatsData() {
  const [month] = useState(new Date());
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      setIsLoading(true);

      // Create start/end of month just once inside the effect
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

      try {
        const { data: logs, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });

        if (error) throw error;

        let totalExpenses = 0;
        let gymDays = 0;
        let checkInDays = 0;
        const expensesHistory: any[] = [];
        const activeDates: Date[] = [];

        if (logs) {
          logs.forEach((log) => {
            let isActive = false;

            if (log.gym_session?.exercises?.length > 0) {
              gymDays++;
              isActive = true;
            }

            if (log.attendance?.check_in) {
              checkInDays++;
              isActive = true;
            }

            if (log.expenses && Array.isArray(log.expenses)) {
              log.expenses.forEach((exp: any) => {
                totalExpenses += exp.amount || 0;
                expensesHistory.push({
                  date: log.date,
                  ...exp
                });
                isActive = true;
              });
            }

            if (log.notes) {
                isActive = true;
            }

            if (isActive) {
              activeDates.push(new Date(log.date + 'T00:00:00')); 
            }
          });
        }

        setData({
          totalExpenses,
          gymDays,
          checkInDays,
          expensesHistory,
          activeDates
        });
      } catch (e) {
        console.error("Error fetching stats data:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [month.getTime(), user]);

  return { data, isLoading };
}
