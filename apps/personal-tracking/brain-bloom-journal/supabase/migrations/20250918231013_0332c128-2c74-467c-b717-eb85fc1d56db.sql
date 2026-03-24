-- Create fake historical journal entries for better timeline demonstration
-- This will create entries spanning the last 30 days with realistic content

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
  'default-user-id'::uuid,
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
  'default-user-id'::uuid,
  'Daily Thoughts - Creative Breakthrough',
  '[
    {"id": "msg1", "text": "Had an amazing creative breakthrough today while working on my side project. Sometimes the best ideas come when you''re not actively trying to solve the problem.", "isUser": true, "timestamp": "2025-01-03T14:30:00Z"},
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
  'default-user-id'::uuid,
  'Weekend Adventures and Reflection',
  '[
    {"id": "msg1", "text": "Spent the weekend exploring a new hiking trail. There''s something magical about being surrounded by nature - it puts everything into perspective.", "isUser": true, "timestamp": "2024-12-29T16:00:00Z"},
    {"id": "msg2", "text": "Met some interesting people on the trail who shared stories about their own journeys. Reminded me how everyone has their own unique path.", "isUser": true, "timestamp": "2024-12-29T16:05:00Z"},
    {"id": "msg3", "text": "This week I want to focus more on being present in the moment rather than always thinking about the next task or goal.", "isUser": true, "timestamp": "2024-12-29T16:10:00Z"}
  ]'::jsonb,
  '2024-12-29'::date,
  'weekly',
  '2024-12-29 16:00:00+00',
  '2024-12-29 16:15:00+00'
),
(
  gen_random_uuid(),
  'default-user-id'::uuid,
  'Midweek Check-in - Progress and Priorities',
  '[
    {"id": "msg1", "text": "Halfway through the week and feeling good about the progress I''ve made on my main goals. The key has been breaking things down into smaller, manageable tasks.", "isUser": true, "timestamp": "2024-12-25T12:00:00Z"},
    {"id": "msg2", "text": "Had a great conversation with a mentor today about career development. Their advice about focusing on impact over activity really resonated with me.", "isUser": true, "timestamp": "2024-12-25T12:05:00Z"}
  ]'::jsonb,
  '2024-12-25'::date,
  'daily',
  '2024-12-25 12:00:00+00',
  '2024-12-25 12:10:00+00'
),

-- Week 3 entries
(
  gen_random_uuid(),
  'default-user-id'::uuid,
  'Learning from Setbacks',
  '[
    {"id": "msg1", "text": "This week didn''t go as planned. Had a few setbacks that initially felt discouraging, but I''m trying to reframe them as learning opportunities.", "isUser": true, "timestamp": "2024-12-22T20:00:00Z"},
    {"id": "msg2", "text": "One thing I''ve realized is that resilience isn''t about avoiding failure, it''s about how quickly you bounce back and what you learn from the experience.", "isUser": true, "timestamp": "2024-12-22T20:05:00Z"},
    {"id": "msg3", "text": "Planning to approach next week with a growth mindset and more realistic expectations. Progress isn''t always linear.", "isUser": true, "timestamp": "2024-12-22T20:10:00Z"}
  ]'::jsonb,
  '2024-12-22'::date,
  'weekly',
  '2024-12-22 20:00:00+00',
  '2024-12-22 20:15:00+00'
),
(
  gen_random_uuid(),
  'default-user-id'::uuid,
  'Evening Gratitude Practice',
  '[
    {"id": "msg1", "text": "Starting a new evening routine where I write down three things I''m grateful for each day. Today: good health, supportive friends, and the opportunity to learn.", "isUser": true, "timestamp": "2024-12-20T21:00:00Z"},
    {"id": "msg2", "text": "It''s amazing how shifting focus to gratitude can completely change your perspective on the day, even when things didn''t go perfectly.", "isUser": true, "timestamp": "2024-12-20T21:05:00Z"}
  ]'::jsonb,
  '2024-12-20'::date,
  'daily',
  '2024-12-20 21:00:00+00',
  '2024-12-20 21:10:00+00'
),

-- Week 4 entries
(
  gen_random_uuid(),
  'default-user-id'::uuid,
  'Monthly Goals Review and Planning',
  '[
    {"id": "msg1", "text": "Taking time to review this month''s goals and plan for the next. I achieved about 70% of what I set out to do, which feels pretty good.", "isUser": true, "timestamp": "2024-12-15T10:00:00Z"},
    {"id": "msg2", "text": "The goals I didn''t hit were mostly due to being overly ambitious with my timeline. Learning to be more realistic about what''s achievable.", "isUser": true, "timestamp": "2024-12-15T10:05:00Z"},
    {"id": "msg3", "text": "For next month, I''m focusing on three key areas: health, relationships, and skill development. Quality over quantity.", "isUser": true, "timestamp": "2024-12-15T10:10:00Z"}
  ]'::jsonb,
  '2024-12-15'::date,
  'monthly',
  '2024-12-15 10:00:00+00',
  '2024-12-15 10:15:00+00'
),
(
  gen_random_uuid(),
  'default-user-id'::uuid,
  'Inspiration and New Ideas',
  '[
    {"id": "msg1", "text": "Attended an interesting workshop today that sparked some new ideas for my personal projects. Sometimes exposure to different perspectives is exactly what you need.", "isUser": true, "timestamp": "2024-12-12T15:30:00Z"},
    {"id": "msg2", "text": "Met someone who''s working on something similar to what I''ve been thinking about. Might be worth exploring a collaboration.", "isUser": true, "timestamp": "2024-12-12T15:35:00Z"},
    {"id": "msg3", "text": "The energy and enthusiasm of other creative people is contagious. Feeling motivated to take action on some ideas that have been sitting on the back burner.", "isUser": true, "timestamp": "2024-12-12T15:40:00Z"}
  ]'::jsonb,
  '2024-12-12'::date,
  'daily',
  '2024-12-12 15:30:00+00',
  '2024-12-12 15:45:00+00'
);

-- Also add some ink_daily entries for more detailed daily data
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
(gen_random_uuid(), 'default-user-id'::uuid, '2025-01-06'::date, 'Morning meditation felt particularly peaceful today. 15 minutes of quiet reflection before the day begins.', 'user_message', '2025-01-06 07:00:00+00', '2025-01-06 07:00:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2025-01-06'::date, 'Completed a challenging workout. Push-ups are getting easier - consistency is paying off.', 'user_message', '2025-01-06 18:30:00+00', '2025-01-06 18:30:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2025-01-05'::date, 'Read an fascinating article about productivity. The concept of "deep work" blocks really resonates with me.', 'user_message', '2025-01-05 20:00:00+00', '2025-01-05 20:00:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2025-01-04'::date, 'Had a great coffee chat with a colleague. Sometimes the best conversations happen outside of formal meetings.', 'user_message', '2025-01-04 14:15:00+00', '2025-01-04 14:15:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2025-01-03'::date, 'Took a long walk after lunch. Fresh air and movement help me think more clearly about complex problems.', 'user_message', '2025-01-03 13:45:00+00', '2025-01-03 13:45:00+00'),
-- Older entries
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-30'::date, 'Year-end reflection: This year brought unexpected challenges but also significant growth.', 'user_message', '2024-12-30 22:00:00+00', '2024-12-30 22:00:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-28'::date, 'Experimented with a new recipe today. Cooking is surprisingly meditative and creative.', 'user_message', '2024-12-28 19:30:00+00', '2024-12-28 19:30:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-25'::date, 'Holiday gatherings remind me how important family and close relationships are.', 'user_message', '2024-12-25 17:00:00+00', '2024-12-25 17:00:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-22'::date, 'Started learning a new skill online. The learning curve is steep but exciting.', 'user_message', '2024-12-22 16:20:00+00', '2024-12-22 16:20:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-18'::date, 'Attended a local community event. Meeting neighbors and connecting with my community felt really good.', 'user_message', '2024-12-18 11:00:00+00', '2024-12-18 11:00:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-15'::date, 'Volunteered at a local charity today. Giving back to the community is incredibly fulfilling.', 'user_message', '2024-12-15 09:30:00+00', '2024-12-15 09:30:00+00'),
(gen_random_uuid(), 'default-user-id'::uuid, '2024-12-10'::date, 'Discovered a new podcast about personal development. Learning from others'' experiences and insights.', 'user_message', '2024-12-10 21:15:00+00', '2024-12-10 21:15:00+00');