-- Create maintenance_windows table
CREATE TABLE public.maintenance_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.maintenance_windows ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (status page is public)
CREATE POLICY "Anyone can view maintenance windows" 
ON public.maintenance_windows 
FOR SELECT 
USING (true);

-- Create policy for insert (for admin - will be managed via API key or edge function)
CREATE POLICY "Allow insert maintenance windows" 
ON public.maintenance_windows 
FOR INSERT 
WITH CHECK (true);

-- Create policy for update
CREATE POLICY "Allow update maintenance windows" 
ON public.maintenance_windows 
FOR UPDATE 
USING (true);

-- Create policy for delete
CREATE POLICY "Allow delete maintenance windows" 
ON public.maintenance_windows 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_maintenance_windows_updated_at
BEFORE UPDATE ON public.maintenance_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_maintenance_updated_at();