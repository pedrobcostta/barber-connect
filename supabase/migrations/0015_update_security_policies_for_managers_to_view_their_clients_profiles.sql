-- This policy allows managers to view the profiles of clients
-- who have had at least one appointment in their barbershop.
CREATE POLICY "Managers can view their barbershop clients"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.appointments a
    WHERE a.client_id = profiles.id
      AND a.barbershop_id = (SELECT get_my_barbershop_id())
  )
);

-- This policy allows managers to update any client profile,
-- as they are responsible for the data within their business context.
CREATE POLICY "Managers can update client profiles"
ON public.profiles
FOR UPDATE
USING (
  (SELECT get_my_role()) = 'gestor'
);