CREATE OR REPLACE FUNCTION public.fetch_client_dashboard_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_client_id UUID := auth.uid();
  v_next_appointment JSON;
  v_loyalty_info JSON;
  v_barbershop_id UUID;
  report JSON;
BEGIN
  -- 1. Get the next appointment
  SELECT
    json_build_object(
      'id', a.id,
      'start_time', a.start_time,
      'service_name', s.name,
      'barber_name', p_barber.full_name,
      'barbershop_id', a.barbershop_id
    )
  INTO v_next_appointment
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  JOIN public.barbers b ON a.barber_id = b.id
  JOIN public.profiles p_barber ON b.user_id = p_barber.id
  WHERE a.client_id = v_client_id
    AND a.start_time >= NOW()
  ORDER BY a.start_time ASC
  LIMIT 1;

  -- Extract barbershop_id from the appointment if it exists
  v_barbershop_id := (v_next_appointment ->> 'barbershop_id')::uuid;

  -- 2. Get loyalty information based on the barbershop of the next appointment
  SELECT
    json_build_object(
      'current_points', p.loyalty_points,
      'services_needed', lp.services_needed,
      'reward', lp.reward
    )
  INTO v_loyalty_info
  FROM public.profiles p
  LEFT JOIN public.loyalty_programs lp ON lp.barbershop_id = v_barbershop_id AND lp.is_active = true
  WHERE p.id = v_client_id;

  -- 3. Combine into a single report
  report := json_build_object(
    'next_appointment', v_next_appointment,
    'loyalty_info', v_loyalty_info
  );

  RETURN report;
END;
$$;