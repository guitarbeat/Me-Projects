-- Insert sample retrospective data using existing user ID
INSERT INTO public.ink_retrospectives (
  user_id,
  retrospective_date,
  title,
  retrospective_type,
  content
) VALUES (
  '9c0440ca-d1e4-44c8-abbf-8e25b87bee91'::uuid,
  '2025-08-03'::date,
  'Sample Daily Reflection - 2025-08-03',
  'daily',
  '{
    "messages": [
      {
        "id": "sample-1",
        "text": "Had a really productive morning working on the quarterly presentation. Managed to finish all the slides and even had time to practice my delivery.",
        "isUser": true,
        "timestamp": "2025-08-03T09:00:00.000Z"
      },
      {
        "id": "sample-2", 
        "text": "Went for a walk during lunch break. The fresh air really helped clear my mind and I came back feeling refreshed and focused.",
        "isUser": true,
        "timestamp": "2025-08-03T12:30:00.000Z"
      },
      {
        "id": "sample-3",
        "text": "Had a great team meeting this afternoon. We brainstormed some innovative solutions for the upcoming project and everyone was really engaged.",
        "isUser": true,
        "timestamp": "2025-08-03T15:00:00.000Z"
      },
      {
        "id": "sample-4",
        "text": "Ended the day by reading a chapter from my personal development book. Learning about growth mindset and how to embrace challenges.",
        "isUser": true,
        "timestamp": "2025-08-03T19:00:00.000Z"
      }
    ],
    "generated_at": "2025-08-03T20:00:00.000Z"
  }'::jsonb
) ON CONFLICT (user_id, retrospective_date, retrospective_type) DO UPDATE SET
  content = EXCLUDED.content,
  title = EXCLUDED.title;