-- Fix security issue: Strengthen RLS policies for profiles table
-- Remove any existing overly permissive policies and ensure proper access control

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can delete their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Authenticated users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view their own profile" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create secure, restrictive policies
-- 1. Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Users can insert their own profile only
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Users can update their own profile only
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Users can delete their own profile only
CREATE POLICY "Users can delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = id);

-- 6. Admins can delete any profile (except their own for safety)
CREATE POLICY "Admins can delete other profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) 
  AND auth.uid() != id
);

-- Ensure no public access by explicitly denying access to anonymous users
-- (RLS already handles this by default, but being explicit for security)
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM public;