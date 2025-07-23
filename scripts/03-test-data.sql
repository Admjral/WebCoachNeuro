-- This script adds test data after a user has registered
-- Replace 'USER_ID_HERE' with the actual user ID from auth.users table

-- First, check if user exists and get their ID
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Example test goals (uncomment and replace USER_ID_HERE with actual user ID)
/*
INSERT INTO public.goals (user_id, title, description, category, deadline, progress) VALUES
('USER_ID_HERE', 'Изучить React разработку', 'Освоить современную React разработку с хуками и контекстом', 'web-development', NOW() + INTERVAL '3 months', 25),
('USER_ID_HERE', 'Создать портфолио проект', 'Разработать полноценное веб-приложение для портфолио', 'web-development', NOW() + INTERVAL '2 months', 10),
('USER_ID_HERE', 'Изучить TypeScript', 'Освоить типизацию в JavaScript проектах', 'web-development', NOW() + INTERVAL '1 month', 60);

-- Example steps for the first goal
INSERT INTO public.steps (goal_id, title, completed, due_date) VALUES
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' AND user_id = 'USER_ID_HERE' LIMIT 1), 'Изучить основы React', true, NOW() + INTERVAL '1 week'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' AND user_id = 'USER_ID_HERE' LIMIT 1), 'Освоить React Hooks', true, NOW() + INTERVAL '2 weeks'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' AND user_id = 'USER_ID_HERE' LIMIT 1), 'Изучить Context API', false, NOW() + INTERVAL '3 weeks'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' AND user_id = 'USER_ID_HERE' LIMIT 1), 'Создать проект с роутингом', false, NOW() + INTERVAL '1 month');
*/
