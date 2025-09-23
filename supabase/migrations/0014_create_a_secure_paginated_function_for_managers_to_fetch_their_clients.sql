CREATE OR REPLACE FUNCTION public.get_clients_for_barbershop(
  p_search_term TEXT,
  p_page_number INT,
  p_page_size INT
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  phone TEXT,
  last_visit TIMESTAMPTZ,
  total_spent NUMERIC,
  total_clients BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_barbershop_id UUID;
  v_offset INT;
BEGIN
  -- Security check: Ensure the caller is a barbershop owner
  SELECT id INTO v_barbershop_id
  FROM public.barbershops
  WHERE owner_id = auth.uid()
  LIMIT 1;

  IF v_barbershop_id IS NULL THEN
    RAISE EXCEPTION 'User is not a barbershop owner or barbershop not found.';
  END IF;

  v_offset := (p_page_number - 1) * p_page_size;

  RETURN QUERY
  WITH clients_in_shop AS (
    -- Distinct clients who have had an appointment at this barbershop
    SELECT DISTINCT a.client_id
    FROM public.appointments a
    WHERE a.barbershop_id = v_barbershop_id
  ),
  client_stats AS (
    -- Calculate stats for each client
    SELECT
      a.client_id,
      MAX(a.start_time) AS last_visit,
      SUM(s.price) AS total_spent
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.barbershop_id = v_barbershop_id
    GROUP BY a.client_id
  ),
  filtered_clients AS (
    -- Join with profiles and apply search filter
    SELECT
      p.id,
      p.full_name,
      p.phone
    FROM public.profiles p
    JOIN clients_in_shop cis ON p.id = cis.client_id
    WHERE p.full_name ILIKE '%' || p_search_term || '%'
  ),
  total AS (
    -- Get total count for pagination
    SELECT count(*) AS total_count FROM filtered_clients
  )
  SELECT
    fc.id,
    fc.full_name,
    fc.phone,
    cs.last_visit,
    cs.total_spent,
    (SELECT total_count FROM total)
  FROM filtered_clients fc
  JOIN client_stats cs ON fc.id = cs.client_id
  ORDER BY cs.last_visit DESC NULLS LAST
  LIMIT p_page_size
  OFFSET v_offset;
END;
$$;