-- Insert sample goals and steps for demonstration
-- This will only work after a user is created through the app

-- Note: Replace 'your-user-id' with actual user ID after registration
-- You can get the user ID from the auth.users table after registering

-- Example goals (uncomment and replace user ID after registration):
/*
INSERT INTO public.goals (user_id, title, description, category, deadline, progress) VALUES
('your-user-id', 'Изучить React разработку', 'Освоить современную React разработку с хуками и контекстом', 'web-development', NOW() + INTERVAL '3 months', 25),
('your-user-id', 'Создать портфолио проект', 'Разработать полноценное веб-приложение для портфолио', 'web-development', NOW() + INTERVAL '2 months', 10),
('your-user-id', 'Изучить TypeScript', 'Освоить типизацию в JavaScript проектах', 'web-development', NOW() + INTERVAL '1 month', 60);

-- Example steps for the first goal
INSERT INTO public.steps (goal_id, title, completed, due_date) VALUES
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' LIMIT 1), 'Изучить основы React', true, NOW() + INTERVAL '1 week'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' LIMIT 1), 'Освоить React Hooks', true, NOW() + INTERVAL '2 weeks'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' LIMIT 1), 'Изучить Context API', false, NOW() + INTERVAL '3 weeks'),
((SELECT id FROM public.goals WHERE title = 'Изучить React разработку' LIMIT 1), 'Создать проект с роутингом', false, NOW() + INTERVAL '1 month');
*/
