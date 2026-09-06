import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { type DailyData, defaultDailyData, useAuthStore } from '@/store';
import { format } from 'date-fns';

export function useDailyData(date: Date = new Date()) {
  const [data, setData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const dateStr = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setIsLoading(true);
      
      try {
        const { data: logData, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', dateStr)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
          throw error;
        }

        if (logData) {
          setData(logData as DailyData);
        } else {
          setData(defaultDailyData(dateStr));
        }
      } catch (e) {
        console.error("Failed to load daily data from Supabase", e);
        setData(defaultDailyData(dateStr));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [dateStr, user]);

  const saveData = async (newData: DailyData) => {
    if (!user) return;
    setData(newData);
    
    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          id: newData.id, // Will be undefined on first insert, Supabase handles uuid generation if configured or we can rely on unique (user_id, date) if id is not required
          user_id: user.id,
          date: newData.date,
          attendance: newData.attendance,
          habits: newData.habits,
          gym_session: newData.gym_session,
          expenses: newData.expenses,
          notes: newData.notes,
        }, { onConflict: 'user_id, date' }); // Upsert matching user_id and date
        
      if (error) throw error;
    } catch (e) {
      console.error("Failed to save daily data to Supabase", e);
    }
  };

  const updateAttendance = async (type: 'check_in' | 'check_out') => {
    if (!data) return;
    const timeStr = format(new Date(), 'HH:mm:ss');
    const newData = {
      ...data,
      attendance: {
        ...data.attendance,
        [type]: timeStr,
      }
    };
    await saveData(newData);
  };

  const updateHabit = async (habitId: string, value: any) => {
    if (!data) return;
    const newData = {
      ...data,
      habits: {
        ...data.habits,
        [habitId]: value,
      }
    };
    await saveData(newData);
  };
  
  const updateGymSession = async (gymData: any) => {
    if (!data) return;
    const newData = {
      ...data,
      gym_session: gymData
    };
    await saveData(newData);
  };

  const addExpense = async (expense: { amount: number; category: string; note: string }) => {
    if (!data) return;
    const newData = {
      ...data,
      expenses: [...(data.expenses || []), expense]
    };
    await saveData(newData);
  };

  const updateNotes = async (notes: string) => {
    if (!data) return;
    const newData = {
      ...data,
      notes,
    };
    await saveData(newData);
  };

  return { data, isLoading, updateAttendance, updateHabit, updateGymSession, addExpense, updateNotes };
}
