CREATE OR REPLACE FUNCTION public.get_my_barbershop_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT id FROM public.barbershops WHERE owner_id = auth.uid() LIMIT 1;
$$;