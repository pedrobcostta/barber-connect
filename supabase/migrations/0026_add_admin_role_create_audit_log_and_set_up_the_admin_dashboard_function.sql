-- Add 'admin' to the user_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'admin';
    END IF;
END$$;

-- Create the audit_log table to track platform events
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    details JSONB
);

-- Enable RLS and set a policy for admins
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit logs" ON public.audit_log
FOR SELECT TO authenticated
USING ((SELECT get_my_role()) = 'admin');

-- Create a trigger function to log new barbershop registrations
CREATE OR REPLACE FUNCTION public.log_new_barbershop()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.audit_log (action, details)
    VALUES (
        'new_barbershop_registered',
        jsonb_build_object(
            'barbershop_id', NEW.id,
            'barbershop_name', NEW.name,
            'owner_id', NEW.owner_id
        )
    );
    RETURN NEW;
END;
$$;

-- Apply the trigger to the barbershops table
DROP TRIGGER IF EXISTS on_barbershop_created ON public.barbershops;
CREATE TRIGGER on_barbershop_created
    AFTER INSERT ON public.barbershops
    FOR EACH ROW EXECUTE FUNCTION public.log_new_barbershop();

-- Create the main RPC function to fetch all dashboard data securely
CREATE OR REPLACE FUNCTION public.get_saas_admin_overview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    report JSON;
    v_user_role TEXT;
BEGIN
    -- Security Check: Ensure the caller is an admin
    SELECT get_my_role() INTO v_user_role;
    IF v_user_role <> 'admin' THEN
        RAISE EXCEPTION 'Forbidden: User is not an admin';
    END IF;

    -- Aggregate all data into a single JSON object
    WITH kpis AS (
        SELECT
            (SELECT COUNT(*) FROM public.barbershops) AS total_barbershops,
            (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) AS total_users,
            (SELECT COUNT(*) FROM public.barbershops WHERE created_at >= date_trunc('month', NOW())) AS new_barbershops_this_month,
            0 AS mrr -- Placeholder for Monthly Recurring Revenue
    ),
    growth_chart AS (
        SELECT
            to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
            COUNT(*) as new_shops
        FROM public.barbershops
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY 1
        ORDER BY 1
    ),
    recent_activity AS (
        SELECT
            created_at,
            action,
            details
        FROM public.audit_log
        ORDER BY created_at DESC
        LIMIT 10
    )
    SELECT
        json_build_object(
            'kpis', (SELECT to_json(kpis) FROM kpis),
            'growth_chart', (SELECT COALESCE(json_agg(gc), '[]'::json) FROM growth_chart gc),
            'recent_activity', (SELECT COALESCE(json_agg(ra), '[]'::json) FROM recent_activity ra)
        )
    INTO report;

    RETURN report;
END;
$$;