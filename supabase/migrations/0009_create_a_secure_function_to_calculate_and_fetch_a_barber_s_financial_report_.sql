CREATE OR REPLACE FUNCTION get_barber_financial_report(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  report JSON;
  barber_user_id UUID := auth.uid();
  target_barber_id UUID;
BEGIN
  -- Find the barber ID associated with the authenticated user
  SELECT id INTO target_barber_id FROM public.barbers WHERE user_id = barber_user_id LIMIT 1;

  -- If no barber profile is found for the user, return an empty report
  IF target_barber_id IS NULL THEN
    RETURN json_build_object(
      'kpis', json_build_object('total_revenue', 0, 'total_commission', 0, 'average_ticket', 0),
      'details', '[]'::json
    );
  END IF;

  -- Build the report
  SELECT
    json_build_object(
      'kpis', json_build_object(
        'total_revenue', COALESCE(SUM(s.price), 0),
        'total_commission', COALESCE(SUM(s.price * 0.5), 0), -- Assuming 50% commission
        'average_ticket', COALESCE(AVG(s.price), 0)
      ),
      'details', COALESCE(json_agg(
        json_build_object(
          'date', a.start_time,
          'client_name', p.full_name,
          'service_name', s.name,
          'total_value', s.price,
          'payment_method', 'N/A', -- Placeholder as payment method is not in the schema
          'commission_value', s.price * 0.5 -- Assuming 50% commission
        ) ORDER BY a.start_time DESC
      ), '[]'::json)
    )
  INTO report
  FROM
    public.appointments a
  JOIN
    public.services s ON a.service_id = s.id
  JOIN
    public.profiles p ON a.client_id = p.id
  WHERE
    a.barber_id = target_barber_id AND
    a.start_time >= start_date AND
    a.start_time <= end_date;

  RETURN COALESCE(report, json_build_object(
      'kpis', json_build_object('total_revenue', 0, 'total_commission', 0, 'average_ticket', 0),
      'details', '[]'::json
    ));
END;
$$;