CREATE OR REPLACE FUNCTION public.fetch_client_financial_history(start_date timestamptz, end_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_client_id UUID := auth.uid();
  v_total_spent NUMERIC;
  v_period_history JSON;
  report JSON;
BEGIN
  -- 1. Calculate total spent across all time for this client
  SELECT COALESCE(SUM(s.price), 0)
  INTO v_total_spent
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  WHERE a.client_id = v_client_id;

  -- 2. Get the payment history for the selected period
  SELECT COALESCE(json_agg(
    json_build_object(
      'date', a.start_time,
      'service_name', s.name,
      'barber_name', p.full_name,
      'amount', s.price
    ) ORDER BY a.start_time DESC
  ), '[]'::json)
  INTO v_period_history
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  JOIN public.barbers b ON a.barber_id = b.id
  JOIN public.profiles p ON b.user_id = p.id
  WHERE a.client_id = v_client_id
    AND a.start_time BETWEEN start_date AND end_date;

  -- 3. Combine into a single report
  report := json_build_object(
    'total_spent', v_total_spent,
    'period_history', v_period_history
  );

  RETURN report;
END;
$$;