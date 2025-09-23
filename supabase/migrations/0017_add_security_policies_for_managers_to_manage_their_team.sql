-- This policy allows a manager to perform any action (SELECT, INSERT, UPDATE, DELETE)
-- on barber records that belong to their own barbershop.
CREATE POLICY "Managers can manage barbers in their shop"
ON public.barbers
FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));

-- This policy allows a manager to view and update the profiles of barbers
-- who are part of their team.
CREATE POLICY "Managers can manage their team profiles"
ON public.profiles
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.barbers b
    WHERE b.user_id = profiles.id
      AND b.barbershop_id = (SELECT get_my_barbershop_id())
  )
);