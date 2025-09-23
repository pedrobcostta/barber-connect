CREATE OR REPLACE FUNCTION public.generate_manager_dashboard(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_barbershop_id UUID;
  v_owner_id UUID;
  report JSON;
BEGIN
  -- Security Check: Ensure the caller is the owner of a barbershop
  SELECT id, owner_id INTO v_barbershop_id, v_owner_id
  FROM public.barbershops
  WHERE owner_id = auth.uid()
  LIMIT 1;

  IF v_barbershop_id IS NULL THEN
    RAISE EXCEPTION 'User is not a barbershop owner or barbershop not found.';
  END IF;

  -- Aggregate all data into a single JSON object
  WITH appointments_in_range AS (
    SELECT
      a.id,
      a.start_time,
      a.client_id,
      a.barber_id,
      s.price,
      s.name AS service_name,
      b_prof.full_name AS barber_name,
      c_prof.full_name AS client_name
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    JOIN public.barbers b ON a.barber_id = b.id
    JOIN public.profiles b_prof ON b.user_id = b_prof.id
    JOIN public.profiles c_prof ON a.client_id = c_prof.id
    WHERE a.barbershop_id = v_barbershop_id
      AND a.start_time BETWEEN p_start_date AND p_end_date
  ),
  kpis AS (
    SELECT
      COALESCE(SUM(price), 0) AS total_revenue,
      COUNT(*) AS total_appointments,
      COUNT(DISTINCT client_id) AS new_clients -- Simplified: counts unique clients in period
    FROM appointments_in_range
  ),
  revenue_by_barber AS (
    SELECT
      barber_name AS name,
      SUM(price) AS value
    FROM appointments_in_range
    GROUP BY barber_name
    ORDER BY value DESC
  ),
  revenue_by_service AS (
    SELECT
      service_name AS name,
      SUM(price) AS value
    FROM appointments_in_range
    GROUP BY service_name
    ORDER BY value DESC
  ),
  upcoming_appointments AS (
    SELECT
      start_time,
      client_name,
      service_name,
      barber_name
    FROM appointments_in_range
    WHERE start_time >= NOW() AND start_time <= end_of_day(NOW())
    ORDER BY start_time
    LIMIT 10
  )
  SELECT
    json_build_object(
      'kpis', (SELECT to_json(kpis) FROM kpis),
      'revenue_by_barber', (SELECT COALESCE(json_agg(r), '[]'::json) FROM revenue_by_barber r),
      'revenue_by_service', (SELECT COALESCE(json_agg(s), '[]'::json) FROM revenue_by_service s),
      'upcoming_appointments', (SELECT COALESCE(json_agg(u), '[]'::json) FROM upcoming_appointments u)
    )
  INTO report;

  RETURN report;
END;
$$;