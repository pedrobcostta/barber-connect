CREATE OR REPLACE FUNCTION get_my_clients()
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  last_visit timestamptz,
  total_spent numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH barber_info AS (
    SELECT b.id FROM public.barbers b WHERE b.user_id = auth.uid() LIMIT 1
  ),
  client_appointments AS (
    SELECT
      a.client_id,
      MAX(a.start_time) as last_visit,
      SUM(s.price) as total_spent
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.barber_id = (SELECT id FROM barber_info)
    GROUP BY a.client_id
  )
  SELECT
    p.id,
    p.full_name,
    p.phone,
    ca.last_visit,
    ca.total_spent
  FROM public.profiles p
  JOIN client_appointments ca ON p.id = ca.client_id;
$$;