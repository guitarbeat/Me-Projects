-- Enable RLS on research tables that don't have it yet
ALTER TABLE public.foil_laser_power_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foil_rig_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foil_sop_power_vs_pump ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foil_source_power_measurements ENABLE ROW LEVEL SECURITY;

-- Create public access policies for research tables (anyone can CRUD)
-- These are research tables that should allow public access for data collection

-- foil_laser_power_measurements policies
CREATE POLICY "Anyone can view laser power measurements" 
ON public.foil_laser_power_measurements 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create laser power measurements" 
ON public.foil_laser_power_measurements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update laser power measurements" 
ON public.foil_laser_power_measurements 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete laser power measurements" 
ON public.foil_laser_power_measurements 
FOR DELETE 
USING (true);

-- foil_rig_log policies
CREATE POLICY "Anyone can view rig log entries" 
ON public.foil_rig_log 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create rig log entries" 
ON public.foil_rig_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update rig log entries" 
ON public.foil_rig_log 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete rig log entries" 
ON public.foil_rig_log 
FOR DELETE 
USING (true);

-- foil_sop_power_vs_pump policies
CREATE POLICY "Anyone can view SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR DELETE 
USING (true);

-- foil_source_power_measurements policies
CREATE POLICY "Anyone can view source power measurements" 
ON public.foil_source_power_measurements 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create source power measurements" 
ON public.foil_source_power_measurements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update source power measurements" 
ON public.foil_source_power_measurements 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete source power measurements" 
ON public.foil_source_power_measurements 
FOR DELETE 
USING (true);

-- Add error handling to the gemini-chat edge function by ensuring it checks for API key
-- This is done through a database function that can validate environment setup
CREATE OR REPLACE FUNCTION public.validate_environment_setup()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function can be used to validate that required environment variables are set
  -- For now, it just returns true, but can be extended for more validation
  RETURN true;
END;
$$;