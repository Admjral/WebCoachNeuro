-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.steps CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    focus_area TEXT,
    income_goal INTEGER,
    target_deadline TIMESTAMP WITH TIME ZONE,
    obstacles TEXT[]
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create steps table
CREATE TABLE public.steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Enable read access for users based on user_id" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users based on user_id" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for goals table
CREATE POLICY "Enable read access for goals based on user_id" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for goals based on user_id" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for goals based on user_id" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for goals based on user_id" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for steps table
CREATE POLICY "Enable read access for steps based on user_id" ON public.steps
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.goals WHERE id = goal_id));

CREATE POLICY "Enable insert for steps based on user_id" ON public.steps
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.goals WHERE id = goal_id));

CREATE POLICY "Enable update for steps based on user_id" ON public.steps
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.goals WHERE id = goal_id));

CREATE POLICY "Enable delete for steps based on user_id" ON public.steps
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.goals WHERE id = goal_id));

-- Create RLS policies for chat_sessions table
CREATE POLICY "Enable read access for chat_sessions based on user_id" ON public.chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for chat_sessions based on user_id" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for chat_sessions based on user_id" ON public.chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for messages table
CREATE POLICY "Enable read access for messages based on user_id" ON public.messages
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.chat_sessions WHERE id = session_id));

CREATE POLICY "Enable insert for messages based on user_id" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.chat_sessions WHERE id = session_id));

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, name, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        FALSE
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_steps_updated_at 
    BEFORE UPDATE ON public.steps
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert some initial data for testing (optional)
-- This will be executed after a user registers
