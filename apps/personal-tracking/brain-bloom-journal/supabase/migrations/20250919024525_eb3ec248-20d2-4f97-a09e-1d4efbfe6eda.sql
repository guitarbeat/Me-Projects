-- Security Fix: Secure Research Data Tables
-- Replace public access policies with authentication-based access controls

-- Drop existing public policies for foil_laser_power_measurements
DROP POLICY IF EXISTS "Anyone can create laser power measurements" ON public.foil_laser_power_measurements;
DROP POLICY IF EXISTS "Anyone can delete laser power measurements" ON public.foil_laser_power_measurements;
DROP POLICY IF EXISTS "Anyone can update laser power measurements" ON public.foil_laser_power_measurements;
DROP POLICY IF EXISTS "Anyone can view laser power measurements" ON public.foil_laser_power_measurements;

-- Drop existing public policies for foil_source_power_measurements
DROP POLICY IF EXISTS "Anyone can create source power measurements" ON public.foil_source_power_measurements;
DROP POLICY IF EXISTS "Anyone can delete source power measurements" ON public.foil_source_power_measurements;
DROP POLICY IF EXISTS "Anyone can update source power measurements" ON public.foil_source_power_measurements;
DROP POLICY IF EXISTS "Anyone can view source power measurements" ON public.foil_source_power_measurements;

-- Drop existing public policies for foil_sop_power_vs_pump
DROP POLICY IF EXISTS "Anyone can create SOP power vs pump data" ON public.foil_sop_power_vs_pump;
DROP POLICY IF EXISTS "Anyone can delete SOP power vs pump data" ON public.foil_sop_power_vs_pump;
DROP POLICY IF EXISTS "Anyone can update SOP power vs pump data" ON public.foil_sop_power_vs_pump;
DROP POLICY IF EXISTS "Anyone can view SOP power vs pump data" ON public.foil_sop_power_vs_pump;

-- Create secure policies for foil_laser_power_measurements
CREATE POLICY "Authenticated users can view laser power measurements" 
ON public.foil_laser_power_measurements 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create laser power measurements" 
ON public.foil_laser_power_measurements 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Researchers can update their own measurements" 
ON public.foil_laser_power_measurements 
FOR UPDATE 
TO authenticated
USING (researcher = (
  SELECT COALESCE(display_name, username, email)
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Admins and researchers can delete measurements" 
ON public.foil_laser_power_measurements 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  researcher = (
    SELECT COALESCE(display_name, username, email)
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create secure policies for foil_source_power_measurements
CREATE POLICY "Authenticated users can view source power measurements" 
ON public.foil_source_power_measurements 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create source power measurements" 
ON public.foil_source_power_measurements 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Researchers can update their own source measurements" 
ON public.foil_source_power_measurements 
FOR UPDATE 
TO authenticated
USING (researcher = (
  SELECT COALESCE(display_name, username, email)
  FROM public.profiles 
  WHERE id = auth.uid()
));

CREATE POLICY "Admins and researchers can delete source measurements" 
ON public.foil_source_power_measurements 
FOR DELETE 
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  researcher = (
    SELECT COALESCE(display_name, username, email)
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Create secure policies for foil_sop_power_vs_pump
CREATE POLICY "Authenticated users can view SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Admins can delete SOP power vs pump data" 
ON public.foil_sop_power_vs_pump 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));