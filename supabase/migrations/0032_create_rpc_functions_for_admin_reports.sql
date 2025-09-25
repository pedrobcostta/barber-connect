-- Function to generate a growth report (barbershops and users)
CREATE OR REPLACE FUNCTION generate_growth_report(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    report JSON;
    v_user_role TEXT;
BEGIN
    -- Security Check
    SELECT get_my_role() INTO v_user_role;
    IF v_user_role <> 'admin' THEN
        RAISE EXCEPTION 'Forbidden: User is not an admin';
    END IF;

    WITH date_series AS (
        SELECT generate_series(
            date_trunc('month', start_date),
            date_trunc('month', end_date),
            '1 month'::interval
        ) AS month
    ),
    monthly_signups AS (
        SELECT
            date_trunc('month', created_at) as month,
            COUNT(*) as new_shops
        FROM public.barbershops
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    monthly_users AS (
        SELECT
            date_trunc('month', created_at) as month,
            COUNT(*) as new_users
        FROM public.profiles
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    cumulative_growth AS (
        SELECT
            to_char(ds.month, 'YYYY-MM') as month,
            (SELECT COUNT(*) FROM public.barbershops WHERE created_at <= ds.month) as total_shops,
            (SELECT COUNT(*) FROM public.profiles WHERE created_at <= ds.month) as total_users
        FROM date_series ds
    ),
    monthly_details AS (
        SELECT
            to_char(ds.month, 'YYYY-MM') as month,
            COALESCE(ms.new_shops, 0) as new_barbershops,
            COALESCE(mu.new_users, 0) as new_users
        FROM date_series ds
        LEFT JOIN monthly_signups ms ON ds.month = ms.month
        LEFT JOIN monthly_users mu ON ds.month = mu.month
        ORDER BY ds.month
    )
    SELECT json_build_object(
        'growth_chart', (SELECT COALESCE(json_agg(cg), '[]'::json) FROM cumulative_growth cg),
        'details_table', (SELECT COALESCE(json_agg(md), '[]'::json) FROM monthly_details md)
    )
    INTO report;

    RETURN report;
END;
$$;

-- Function to generate a revenue report
CREATE OR REPLACE FUNCTION generate_revenue_report(start_date timestamp with time zone, end_date timestamp with time zone)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    report JSON;
    v_user_role TEXT;
BEGIN
    -- Security Check
    SELECT get_my_role() INTO v_user_role;
    IF v_user_role <> 'admin' THEN
        RAISE EXCEPTION 'Forbidden: User is not an admin';
    END IF;

    WITH monthly_revenue AS (
        SELECT
            date_trunc('month', created_at) as month,
            SUM(price) as revenue,
            COUNT(*) as new_subscriptions
        FROM public.subscriptions
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    report_data AS (
        SELECT
            to_char(mr.month, 'YYYY-MM') as month,
            mr.revenue,
            mr.new_subscriptions,
            mr.revenue as mrr, -- Simplified MRR for monthly view
            0 as churn, -- Placeholder for churn
            CASE WHEN mr.new_subscriptions > 0 THEN (mr.revenue / mr.new_subscriptions) ELSE 0 END as avg_ticket
        FROM monthly_revenue mr
        ORDER BY mr.month
    )
    SELECT json_build_object(
        'revenue_chart', (SELECT COALESCE(json_agg(json_build_object('month', month, 'faturamento', revenue)), '[]'::json) FROM report_data),
        'details_table', (SELECT COALESCE(json_agg(rd), '[]'::json) FROM report_data rd)
    )
    INTO report;

    RETURN report;
END;
$$;

-- Function to generate an engagement report
CREATE OR REPLACE FUNCTION generate_engagement_report()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    report JSON;
    v_user_role TEXT;
BEGIN
    -- Security Check
    SELECT get_my_role() INTO v_user_role;
    IF v_user_role <> 'admin' THEN
        RAISE EXCEPTION 'Forbidden: User is not an admin';
    END IF;

    WITH plan_distribution AS (
        SELECT
            p.name as name,
            COUNT(s.id) as value
        FROM public.plans p
        LEFT JOIN public.subscriptions s ON p.name = s.name
        GROUP BY p.name
    ),
    marketing_usage AS (
        SELECT
            name,
            COUNT(*) as value
        FROM public.marketing_campaigns
        WHERE is_active = true
        GROUP BY name
    )
    SELECT json_build_object(
        'plan_distribution', (SELECT COALESCE(json_agg(pd), '[]'::json) FROM plan_distribution pd),
        'marketing_usage', (SELECT COALESCE(json_agg(mu), '[]'::json) FROM marketing_usage mu)
    )
    INTO report;

    RETURN report;
END;
$$;