-- Create a function to generate a performance report for all barbers in a shop
CREATE OR REPLACE FUNCTION public.generate_barber_performance_report(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE(barber_name text, total_revenue numeric, total_appointments bigint, average_ticket numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_barbershop_id UUID;
BEGIN
  -- Security Check: Ensure the caller is the owner of the barbershop
  SELECT id INTO v_barbershop_id
  FROM public.barbershops
  WHERE owner_id = auth.uid()
  LIMIT 1;

  IF v_barbershop_id IS NULL THEN
    RAISE EXCEPTION 'User is not a barbershop owner or barbershop not found.';
  END IF;

  -- Query to aggregate performance data
  RETURN QUERY
  SELECT
    p.full_name AS barber_name,
    COALESCE(SUM(s.price), 0) AS total_revenue,
    COUNT(a.id) AS total_appointments,
    COALESCE(AVG(s.price), 0) AS average_ticket
  FROM public.barbers b
  JOIN public.profiles p ON b.user_id = p.id
  LEFT JOIN public.appointments a ON a.barber_id = b.id
    AND a.start_time BETWEEN p_start_date AND p_end_date
  LEFT JOIN public.services s ON a.service_id = s.id
  WHERE b.barbershop_id = v_barbershop_id
  GROUP BY p.full_name
  ORDER BY total_revenue DESC;
END;
$$;