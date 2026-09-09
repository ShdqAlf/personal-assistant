import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store';
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from 'date-fns';

export interface GymSet {
  weight_kg: number;
  reps: number;
}

export interface GymExercise {
  name: string;
  sets: GymSet[];
  exerciseVolume: number;
  maxWeight: number;
}

export interface GymSessionRecord {
  date: string;
  routine: string;
  exercises: GymExercise[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
}

export interface ExercisePR {
  name: string;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  totalSets: number;
  totalVolume: number;
  lastDate: string;
}

export interface GymStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  topRoutine: string;
  routinesBreakdown: { routine: string; count: number }[];
  exercisePRs: ExercisePR[];
}

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
  gymSessions: GymSessionRecord[];
  gymStats: GymStats;
}

export function useStatsData() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [timeframe, setTimeframe] = useState<'month' | 'all'>('month');
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const prevMonth = useCallback(() => {
    setSelectedMonth((prev) => subMonths(prev, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setSelectedMonth((prev) => addMonths(prev, 1));
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    setSelectedMonth(new Date());
    setTimeframe('month');
  }, []);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      setIsLoading(true);

      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

      try {
        let query = supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id);

        if (timeframe === 'month') {
          query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data: logs, error } = await query.order('date', { ascending: false });

        if (error) throw error;

        let totalExpenses = 0;
        let gymDays = 0;
        let checkInDays = 0;
        const expensesHistory: any[] = [];
        const activeDates: Date[] = [];
        const gymSessions: GymSessionRecord[] = [];

        // Exercise PR tracking
        const prMap: Record<string, ExercisePR> = {};
        const routineCounter: Record<string, number> = {};

        let overallGymVolume = 0;
        let overallGymSets = 0;
        let overallGymReps = 0;

        if (logs) {
          logs.forEach((log) => {
            let isActive = false;

            // Process Gym Session
            const hasExercises = log.gym_session?.exercises && log.gym_session.exercises.length > 0;
            const hasRoutine = !!log.gym_session?.routine?.trim();

            if (hasExercises || hasRoutine) {
              gymDays++;
              isActive = true;

              const routineName = log.gym_session?.routine?.trim() || 'Custom Workout';
              routineCounter[routineName] = (routineCounter[routineName] || 0) + 1;

              let sessionVolume = 0;
              let sessionSets = 0;
              let sessionReps = 0;
              let sessionMaxWeight = 0;

              const processedExercises: GymExercise[] = (log.gym_session?.exercises || []).map((ex: any) => {
                const cleanName = (ex.name || 'Unnamed Exercise').trim();
                const cleanSets: GymSet[] = (ex.sets || []).map((s: any) => ({
                  weight_kg: Number(s.weight_kg) || 0,
                  reps: Number(s.reps) || 0,
                }));

                let exVolume = 0;
                let exMaxWeight = 0;

                cleanSets.forEach((s) => {
                  const setVol = s.weight_kg * s.reps;
                  exVolume += setVol;
                  sessionVolume += setVol;
                  sessionSets += 1;
                  sessionReps += s.reps;

                  if (s.weight_kg > exMaxWeight) {
                    exMaxWeight = s.weight_kg;
                  }
                  if (s.weight_kg > sessionMaxWeight) {
                    sessionMaxWeight = s.weight_kg;
                  }

                  // Update global PR map for this exercise
                  if (!prMap[cleanName]) {
                    prMap[cleanName] = {
                      name: cleanName,
                      maxWeight: s.weight_kg,
                      maxRepsAtMaxWeight: s.reps,
                      totalSets: 1,
                      totalVolume: setVol,
                      lastDate: log.date,
                    };
                  } else {
                    const currentPR = prMap[cleanName];
                    currentPR.totalSets += 1;
                    currentPR.totalVolume += setVol;
                    if (
                      s.weight_kg > currentPR.maxWeight ||
                      (s.weight_kg === currentPR.maxWeight && s.reps > currentPR.maxRepsAtMaxWeight)
                    ) {
                      currentPR.maxWeight = s.weight_kg;
                      currentPR.maxRepsAtMaxWeight = s.reps;
                      currentPR.lastDate = log.date;
                    }
                  }
                });

                return {
                  name: cleanName,
                  sets: cleanSets,
                  exerciseVolume: exVolume,
                  maxWeight: exMaxWeight,
                };
              });

              overallGymVolume += sessionVolume;
              overallGymSets += sessionSets;
              overallGymReps += sessionReps;

              gymSessions.push({
                date: log.date,
                routine: routineName,
                exercises: processedExercises,
                totalVolume: sessionVolume,
                totalSets: sessionSets,
                totalReps: sessionReps,
                maxWeight: sessionMaxWeight,
              });
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
                  ...exp,
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

        // Calculate Top Routine
        const routinesBreakdown = Object.entries(routineCounter)
          .map(([routine, count]) => ({ routine, count }))
          .sort((a, b) => b.count - a.count);

        const topRoutine = routinesBreakdown.length > 0 ? routinesBreakdown[0].routine : '-';

        // Sort PRs by maxWeight descending
        const exercisePRs = Object.values(prMap).sort((a, b) => b.maxWeight - a.maxWeight);

        setData({
          totalExpenses,
          gymDays,
          checkInDays,
          expensesHistory,
          activeDates,
          gymSessions,
          gymStats: {
            totalWorkouts: gymSessions.length,
            totalVolume: overallGymVolume,
            totalSets: overallGymSets,
            totalReps: overallGymReps,
            topRoutine,
            routinesBreakdown,
            exercisePRs,
          },
        });
      } catch (e) {
        console.error('Error fetching stats data:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [selectedMonth, timeframe, user]);

  return {
    data,
    isLoading,
    selectedMonth,
    timeframe,
    setTimeframe,
    prevMonth,
    nextMonth,
    resetToCurrentMonth,
  };
}

