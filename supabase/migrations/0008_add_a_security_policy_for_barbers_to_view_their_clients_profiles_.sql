CREATE POLICY "Barbers can view their clients' profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments a
    JOIN public.barbers b ON a.barber_id = b.id
    WHERE a.client_id = profiles.id AND b.user_id = auth.uid()
  )
);