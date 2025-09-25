-- Create a table for subscription plans if it doesn't exist
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    features TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    stripe_plan_id TEXT, -- To store the corresponding ID from the payment gateway
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table for barbershop subscriptions if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    current_period_end TIMESTAMPTZ NOT NULL,
    stripe_subscription_id TEXT UNIQUE, -- To store the corresponding ID from the payment gateway
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for both tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid errors on re-run
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

-- Create policies allowing only admins to manage plans and subscriptions
CREATE POLICY "Admins can manage plans" ON public.plans
    FOR ALL TO authenticated
    USING ((SELECT get_my_role()) = 'admin')
    WITH CHECK ((SELECT get_my_role()) = 'admin');

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL TO authenticated
    USING ((SELECT get_my_role()) = 'admin')
    WITH CHECK ((SELECT get_my_role()) = 'admin');