-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  display_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  apps TEXT[] DEFAULT '{}',
  has_custom_password BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public read access to non-sensitive profile data
CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can modify roles (handled by functions)

-- Create user_credentials table (for password tracking)
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- Users can read their own credentials
CREATE POLICY "Users can read their own credentials"
  ON public.user_credentials FOR SELECT
  USING (auth.uid() = user_id);

-- Create profile_access_audit table for security logging
CREATE TABLE IF NOT EXISTS public.profile_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  accessed_profile_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.profile_access_audit FOR SELECT
  USING (public.is_user_admin(auth.uid()));

-- Create profile_access_rate_limit table
CREATE TABLE IF NOT EXISTS public.profile_access_rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profile_access_rate_limit ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();