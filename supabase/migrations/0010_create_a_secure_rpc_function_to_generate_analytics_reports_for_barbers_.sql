CREATE OR REPLACE FUNCTION get_barber_analytics_report(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  report JSON;
  barber_user_id UUID := auth.uid();
  target_barber_id UUID;
  time_series_data JSON;
  service_breakdown_data JSON;
BEGIN
  -- Find the barber ID associated with the authenticated user
  SELECT id INTO target_barber_id FROM public.barbers WHERE user_id = barber_user_id LIMIT 1;

  -- If no barber profile is found, return an empty report
  IF target_barber_id IS NULL THEN
    RETURN json_build_object(
      'time_series', '[]'::json,
      'service_breakdown', '[]'::json
    );
  END IF;

  -- 1. Generate time series data (revenue and appointments per day)
  WITH date_series AS (
    SELECT generate_series(
      date_trunc('day', start_date),
      date_trunc('day', end_date),
      '1 day'::interval
    ) AS report_date
  ),
  daily_data AS (
    SELECT
      date_trunc('day', a.start_time) AS report_date,
      COUNT(a.id) AS appointments,
      COALESCE(SUM(s.price), 0) AS revenue
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.barber_id = target_barber_id
      AND a.start_time >= start_date
      AND a.start_time <= end_date
    GROUP BY 1
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'date', TO_CHAR(ds.report_date, 'DD/MM'),
      'Receita', COALESCE(dd.revenue, 0),
      'Atendimentos', COALESCE(dd.appointments, 0)
    ) ORDER BY ds.report_date
  ), '[]'::json)
  INTO time_series_data
  FROM date_series ds
  LEFT JOIN daily_data dd ON ds.report_date = dd.report_date;

  -- 2. Generate service breakdown data
  SELECT COALESCE(json_agg(
    json_build_object(
      'name', s.name,
      'value', SUM(s.price)
    )
  ), '[]'::json)
  INTO service_breakdown_data
  FROM public.appointments a
  JOIN public.services s ON a.service_id = s.id
  WHERE a.barber_id = target_barber_id
    AND a.start_time >= start_date
    AND a.start_time <= end_date
  GROUP BY s.name;

  -- Combine results into a single JSON object
  report := json_build_object(
    'time_series', time_series_data,
    'service_breakdown', service_breakdown_data
  );

  RETURN report;
END;
$$;