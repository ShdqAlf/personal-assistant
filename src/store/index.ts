import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Session, type User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      setSession: (session) => set({ session, user: session?.user ?? null }),
    }),
    {
      name: 'pa-auth-storage',
    }
  )
);

export interface DailyData {
  id?: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  attendance: {
    check_in?: string;
    check_out?: string;
  };
  habits: {
    creatine_taken?: boolean;
    water_intake_ml?: number;
    grooming_done?: boolean;
    [key: string]: any;
  };
  gym_session?: {
    routine?: string;
    exercises?: {
      name: string;
      sets: { weight_kg: number; reps: number }[];
    }[];
  };
  expenses?: { amount: number; category: string; note: string }[];
  notes?: string;
}

export const defaultDailyData = (date: string): DailyData => ({
  date,
  attendance: {},
  habits: {},
  gym_session: { exercises: [] },
  expenses: [],
  notes: '',
});
