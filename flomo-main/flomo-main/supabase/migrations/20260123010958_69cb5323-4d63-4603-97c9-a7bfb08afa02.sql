-- Add has_custom_password column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_custom_password boolean NOT NULL DEFAULT false;