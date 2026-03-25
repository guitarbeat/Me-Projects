-- Add Web3 authentication fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_address text,
ADD COLUMN IF NOT EXISTS tmp_id uuid;

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);

-- Create index on tmp_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_tmp_id ON public.profiles(tmp_id);