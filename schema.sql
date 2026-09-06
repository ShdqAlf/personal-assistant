-- Create daily_logs table
CREATE TABLE public.daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    attendance JSONB DEFAULT '{}'::jsonb,
    habits JSONB DEFAULT '{}'::jsonb,
    gym_session JSONB DEFAULT '{}'::jsonb,
    expenses JSONB DEFAULT '[]'::jsonb,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data
CREATE POLICY "Users can view own daily logs." 
    ON public.daily_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs." 
    ON public.daily_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs." 
    ON public.daily_logs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs." 
    ON public.daily_logs FOR DELETE 
    USING (auth.uid() = user_id);
