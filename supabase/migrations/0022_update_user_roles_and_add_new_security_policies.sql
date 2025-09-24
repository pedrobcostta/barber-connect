-- Add new roles to the user_role enum if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'recepcao' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'recepcao';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'financeiro' AND enumtypid = 'user_role'::regtype) THEN
    ALTER TYPE user_role ADD VALUE 'financeiro';
  END IF;
END$$;

-- Add new permissive RLS policies for the 'recepcao' role
CREATE POLICY "Reception can manage appointments"
ON public.appointments FOR ALL
USING ((SELECT get_my_role()) = 'recepcao' AND barbershop_id = (SELECT get_my_barbershop_id()));

CREATE POLICY "Reception can view clients"
ON public.profiles FOR SELECT
USING ((SELECT get_my_role()) = 'recepcao' AND EXISTS (
  SELECT 1 FROM appointments a WHERE a.client_id = profiles.id AND a.barbershop_id = (SELECT get_my_barbershop_id())
));

-- Add new permissive RLS policies for the 'financeiro' role
CREATE POLICY "Finance can manage expenses"
ON public.expenses FOR ALL
USING ((SELECT get_my_role()) = 'financeiro' AND barbershop_id = (SELECT get_my_barbershop_id()));