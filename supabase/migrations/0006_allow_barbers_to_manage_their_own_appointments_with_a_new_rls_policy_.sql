CREATE POLICY "Barbers can manage their own appointments"
ON public.appointments
FOR ALL
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = barber_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = barber_id));