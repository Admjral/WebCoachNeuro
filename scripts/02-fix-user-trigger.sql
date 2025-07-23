-- First, let's check what's in auth.users table
SELECT id, email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at DESC;

-- Check if our trigger exists
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Drop existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();

-- Create the function with proper permissions and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log the attempt
    RAISE LOG 'Trigger fired for user: % (email: %)', NEW.id, NEW.email;
    
    -- Insert into public.users with proper error handling
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
    
    RAISE LOG 'Successfully created/updated user profile for: %', NEW.email;
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user for % (%): %', NEW.email, NEW.id, SQLERRM;
        -- Don't fail the auth process, just log the error
        RETURN NEW;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create trigger for updates (when email is confirmed)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only update if the user exists in public.users
    UPDATE public.users 
    SET 
        email = NEW.email,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name)
    WHERE id = NEW.id;
    
    -- If user doesn't exist in public.users, create them
    IF NOT FOUND THEN
        INSERT INTO public.users (id, email, name, onboarding_completed)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            FALSE
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_user_update for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_user_update() TO service_role;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Now let's manually create profiles for existing users
INSERT INTO public.users (id, email, name, onboarding_completed)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
    FALSE
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 'Triggers created successfully' as status;
