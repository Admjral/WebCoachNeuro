-- First, let's check and fix the authentication setup

-- Check if we have any users in auth.users
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC;

-- Check if we have corresponding users in public.users
SELECT id, email, name, onboarding_completed FROM public.users ORDER BY created_at DESC;

-- If email confirmation is required, let's disable it for testing
-- This should be done in Supabase Dashboard -> Authentication -> Settings
-- But we can also check the current settings

-- Let's also make sure our trigger is working properly
-- Drop and recreate the user creation trigger with better error handling

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Log the trigger execution
    RAISE LOG 'Creating user profile for user: %', NEW.id;
    
    -- Insert into public.users table
    INSERT INTO public.users (id, email, name, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name);
    
    RAISE LOG 'Successfully created user profile for: %', NEW.email;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
        -- Don't fail the auth process, just log the error
        RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger for updates (in case email confirmation happens later)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Update the public.users table when auth.users is updated
    UPDATE public.users 
    SET 
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name)
    WHERE id = NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_user_update for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();
