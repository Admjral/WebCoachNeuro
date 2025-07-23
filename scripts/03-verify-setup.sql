-- Verify that triggers are properly set up
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_updated');

-- Check existing users in auth.users
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count,
    array_agg(email ORDER BY created_at DESC) as emails
FROM auth.users;

-- Check existing users in public.users
SELECT 
    'public.users' as table_name,
    COUNT(*) as count,
    array_agg(email ORDER BY created_at DESC) as emails
FROM public.users;

-- Show any users that exist in auth but not in public
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    CASE WHEN pu.id IS NULL THEN 'Missing in public.users' ELSE 'Exists in public.users' END as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;
