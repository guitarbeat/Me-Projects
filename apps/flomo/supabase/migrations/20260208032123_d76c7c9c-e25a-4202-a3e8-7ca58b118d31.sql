-- Grant admin role to Aaron
INSERT INTO public.user_roles (user_id, role)
VALUES ('902260dd-5f34-42f3-99f0-37d2b0e9d584', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;