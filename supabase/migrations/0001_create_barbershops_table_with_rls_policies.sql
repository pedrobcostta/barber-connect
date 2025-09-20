-- Create the barbershops table
CREATE TABLE IF NOT EXISTS public.barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the barbershops table
DROP POLICY IF EXISTS "Owners can manage their own barbershop." ON public.barbershops;
CREATE POLICY "Owners can manage their own barbershop."
  ON public.barbershops FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);