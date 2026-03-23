-- Create fake historical journal entries for better timeline demonstration
-- Using a proper UUID for the default user

-- First, let's use a consistent UUID for our demo user
DO $$
DECLARE
    demo_user_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Create fake retrospectives with proper UUIDs
    INSERT INTO public.ink_retrospectives (
      id,
      user_id,
      title,
      content,
      retrospective_date,
      retrospective_type,
      created_at,
      updated_at
    ) VALUES 
    -- Week 1 entries
    (
      gen_random_uuid(),
      demo_user_id,
      'Weekly Reflection - Growth and Learning',
      '[
        {"id": "msg1", "text": "This week I focused on personal growth and learning new skills. I spent time reading about productivity techniques and started implementing the Pomodoro method.", "isUser": true, "timestamp": "2025-01-05T10:00:00Z"},
        {"id": "msg2", "text": "I also began a new fitness routine - morning runs have been incredibly energizing and help me start the day with clarity.", "isUser": true, "timestamp": "2025-01-05T10:05:00Z"},
        {"id": "msg3", "text": "One challenge this week was managing my time better between work and personal projects. I need to be more intentional about setting boundaries.", "isUser": true, "timestamp": "2025-01-05T10:10:00Z"}
      ]'::jsonb,
      '2025-01-05'::date,
      'weekly',
      '2025-01-05 10:00:00+00',
      '2025-01-05 10:15:00+00'
    ),
    (
      gen_random_uuid(),
      demo_user_id,
      'Daily Thoughts - Creative Breakthrough',
      '[
        {"id": "msg1", "text": "Had an amazing creative breakthrough today while working on my side project. Sometimes the best ideas come when you are not actively trying to solve the problem.", "isUser": true, "timestamp": "2025-01-03T14:30:00Z"},
        {"id": "msg2", "text": "The key was stepping away from the computer and taking a walk. Fresh air and movement really help clear the mental fog.", "isUser": true, "timestamp": "2025-01-03T14:35:00Z"}
      ]'::jsonb,
      '2025-01-03'::date,
      'daily',
      '2025-01-03 14:30:00+00',
      '2025-01-03 14:40:00+00'
    ),
    -- Week 2 entries
    (
      gen_random_uuid(),
      demo_user_id,
      'Weekend Adventures and Reflection',
      '[
        {"id": "msg1", "text": "Spent the weekend exploring a new hiking trail. There is something magical about being surrounded by nature - it puts everything into perspective.", "isUser": true, "timestamp": "2024-12-29T16:00:00Z"},
        {"id": "msg2", "text": "Met some interesting people on the trail who shared stories about their own journeys. Reminded me how everyone has their own unique path.", "isUser": true, "timestamp": "2024-12-29T16:05:00Z"},
        {"id": "msg3", "text": "This week I want to focus more on being present in the moment rather than always thinking about the next task or goal.", "isUser": true, "timestamp": "2024-12-29T16:10:00Z"}
      ]'::jsonb,
      '2024-12-29'::date,
      'weekly',
      '2024-12-29 16:00:00+00',
      '2024-12-29 16:15:00+00'
    );

    -- Add daily entries
    INSERT INTO public.ink_daily (
      id,
      user_id,
      entry_date,
      content,
      entry_type,
      created_at,
      updated_at
    ) VALUES
    -- Recent entries
    (gen_random_uuid(), demo_user_id, '2025-01-06'::date, 'Morning meditation felt particularly peaceful today. 15 minutes of quiet reflection before the day begins.', 'user_message', '2025-01-06 07:00:00+00', '2025-01-06 07:00:00+00'),
    (gen_random_uuid(), demo_user_id, '2025-01-06'::date, 'Completed a challenging workout. Push-ups are getting easier - consistency is paying off.', 'user_message', '2025-01-06 18:30:00+00', '2025-01-06 18:30:00+00'),
    (gen_random_uuid(), demo_user_id, '2025-01-05'::date, 'Read a fascinating article about productivity. The concept of deep work blocks really resonates with me.', 'user_message', '2025-01-05 20:00:00+00', '2025-01-05 20:00:00+00'),
    (gen_random_uuid(), demo_user_id, '2025-01-04'::date, 'Had a great coffee chat with a colleague. Sometimes the best conversations happen outside of formal meetings.', 'user_message', '2025-01-04 14:15:00+00', '2025-01-04 14:15:00+00'),
    (gen_random_uuid(), demo_user_id, '2025-01-03'::date, 'Took a long walk after lunch. Fresh air and movement help me think more clearly about complex problems.', 'user_message', '2025-01-03 13:45:00+00', '2025-01-03 13:45:00+00'),
    -- Older entries
    (gen_random_uuid(), demo_user_id, '2024-12-30'::date, 'Year-end reflection: This year brought unexpected challenges but also significant growth.', 'user_message', '2024-12-30 22:00:00+00', '2024-12-30 22:00:00+00'),
    (gen_random_uuid(), demo_user_id, '2024-12-28'::date, 'Experimented with a new recipe today. Cooking is surprisingly meditative and creative.', 'user_message', '2024-12-28 19:30:00+00', '2024-12-28 19:30:00+00'),
    (gen_random_uuid(), demo_user_id, '2024-12-25'::date, 'Holiday gatherings remind me how important family and close relationships are.', 'user_message', '2024-12-25 17:00:00+00', '2024-12-25 17:00:00+00');
END $$;