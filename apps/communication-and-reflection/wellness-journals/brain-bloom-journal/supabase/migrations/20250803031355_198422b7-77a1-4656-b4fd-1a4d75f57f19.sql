-- Insert sample retrospective data to test if it appears on the site
INSERT INTO public.ink_retrospectives (
  user_id,
  retrospective_date,
  title,
  retrospective_type,
  content
) VALUES (
  auth.uid(),
  CURRENT_DATE,
  'Sample Daily Reflection - ' || CURRENT_DATE,
  'daily',
  '{
    "messages": [
      {
        "id": "sample-1",
        "text": "Had a really productive morning working on the quarterly presentation. Managed to finish all the slides and even had time to practice my delivery.",
        "isUser": true,
        "timestamp": "2024-01-15T09:00:00.000Z"
      },
      {
        "id": "sample-2", 
        "text": "Went for a walk during lunch break. The fresh air really helped clear my mind and I came back feeling refreshed and focused.",
        "isUser": true,
        "timestamp": "2024-01-15T12:30:00.000Z"
      },
      {
        "id": "sample-3",
        "text": "Had a great team meeting this afternoon. We brainstormed some innovative solutions for the upcoming project and everyone was really engaged.",
        "isUser": true,
        "timestamp": "2024-01-15T15:00:00.000Z"
      },
      {
        "id": "sample-4",
        "text": "Ended the day by reading a chapter from my personal development book. Learning about growth mindset and how to embrace challenges.",
        "isUser": true,
        "timestamp": "2024-01-15T19:00:00.000Z"
      }
    ],
    "generated_at": "2024-01-15T20:00:00.000Z"
  }'::jsonb
),
(
  auth.uid(),
  CURRENT_DATE - INTERVAL '1 day',
  'Sample Daily Reflection - ' || (CURRENT_DATE - INTERVAL '1 day'),
  'daily',
  '{
    "messages": [
      {
        "id": "sample-5",
        "text": "Started the day with a 30-minute meditation session. It really helped me feel centered and ready to tackle the day ahead.",
        "isUser": true,
        "timestamp": "2024-01-14T07:00:00.000Z"
      },
      {
        "id": "sample-6",
        "text": "Completed a challenging workout at the gym. Pushed myself harder than usual and felt incredibly accomplished afterwards.",
        "isUser": true,
        "timestamp": "2024-01-14T18:00:00.000Z"
      },
      {
        "id": "sample-7",
        "text": "Cooked a healthy dinner from scratch using fresh ingredients. Taking care of my nutrition is becoming a rewarding habit.",
        "isUser": true,
        "timestamp": "2024-01-14T19:30:00.000Z"
      }
    ],
    "generated_at": "2024-01-14T20:00:00.000Z"
  }'::jsonb
);