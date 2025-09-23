-- Create a table to track barbershop expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., 'pending', 'paid'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security for the new expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create a policy to ensure managers can only manage their own expenses
CREATE POLICY "Managers can manage their own expenses"
ON public.expenses
FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));

-- Create an RPC function to securely generate a financial overview report
CREATE OR REPLACE FUNCTION public.get_financial_overview(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_barbershop_id UUID;
  report JSON;
BEGIN
  -- Security Check: Get the barbershop_id for the authenticated manager
  SELECT id INTO v_barbershop_id
  FROM public.barbershops
  WHERE owner_id = auth.uid()
  LIMIT 1;

  IF v_barbershop_id IS NULL THEN
    RAISE EXCEPTION 'User is not a barbershop owner or barbershop not found.';
  END IF;

  -- Aggregate all data into a single JSON object
  WITH daily_revenue AS (
    SELECT
      date_trunc('day', a.start_time) AS report_date,
      COALESCE(SUM(s.price), 0) AS revenue
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    WHERE a.barbershop_id = v_barbershop_id
      AND a.start_time BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  ),
  daily_costs AS (
    SELECT
      date_trunc('day', e.due_date) AS report_date,
      COALESCE(SUM(e.amount), 0) AS costs
    FROM public.expenses e
    WHERE e.barbershop_id = v_barbershop_id
      AND e.due_date BETWEEN p_start_date AND p_end_date
    GROUP BY 1
  ),
  date_series AS (
    SELECT generate_series(
      date_trunc('day', p_start_date),
      date_trunc('day', p_end_date),
      '1 day'::interval
    ) AS report_date
  ),
  time_series AS (
    SELECT
      TO_CHAR(ds.report_date, 'DD/MM') AS date,
      COALESCE(dr.revenue, 0) AS "Faturamento",
      COALESCE(dc.costs, 0) AS "Custos"
    FROM date_series ds
    LEFT JOIN daily_revenue dr ON ds.report_date = dr.report_date
    LEFT JOIN daily_costs dc ON ds.report_date = dc.report_date
    ORDER BY ds.report_date
  ),
  kpis AS (
    SELECT
      (SELECT COALESCE(SUM("Faturamento"), 0) FROM time_series) AS total_revenue,
      (SELECT COALESCE(SUM("Custos"), 0) FROM time_series) AS total_costs
  )
  SELECT
    json_build_object(
      'kpis', json_build_object(
        'total_revenue', k.total_revenue,
        'total_costs', k.total_costs,
        'net_profit', k.total_revenue - k.total_costs
      ),
      'time_series', (SELECT COALESCE(json_agg(ts), '[]'::json) FROM time_series ts)
    )
  INTO report
  FROM kpis k;

  RETURN report;
END;
$$;