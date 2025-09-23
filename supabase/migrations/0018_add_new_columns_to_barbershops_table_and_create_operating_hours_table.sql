-- Add columns to the barbershops table for more detailed information
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_street TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_number TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_complement TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_city TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_state TEXT;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_zip_code TEXT;

-- Create a new table to store operating hours for each barbershop
CREATE TABLE IF NOT EXISTS public.operating_hours (
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 for Sunday, 6 for Saturday
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (barbershop_id, day_of_week)
);

-- Enable Row Level Security on the new table
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to ensure managers can only manage their own operating hours
CREATE POLICY "Managers can manage their own operating hours"
ON public.operating_hours
FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));