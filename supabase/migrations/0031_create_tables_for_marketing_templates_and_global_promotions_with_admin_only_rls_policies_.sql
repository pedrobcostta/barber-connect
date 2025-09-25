-- Create a table for campaign templates managed by admins
CREATE TABLE IF NOT EXISTS public.campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'birthday', 'reminder'
    channel TEXT NOT NULL DEFAULT 'WhatsApp', -- e.g., 'WhatsApp', 'Email'
    content TEXT NOT NULL,
    variables TEXT[], -- e.g., ['[NOME_CLIENTE]', '[NOME_BARBEARIA]']
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table for global promotions managed by admins
CREATE TABLE IF NOT EXISTS public.global_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for both tables
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_promotions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Admins can manage campaign templates" ON public.campaign_templates;
DROP POLICY IF EXISTS "Admins can manage global promotions" ON public.global_promotions;
DROP POLICY IF EXISTS "Authenticated users can view active templates" ON public.campaign_templates;


-- Create policies for campaign_templates
CREATE POLICY "Admins can manage campaign templates" ON public.campaign_templates
    FOR ALL TO authenticated
    USING ((SELECT get_my_role()) = 'admin')
    WITH CHECK ((SELECT get_my_role()) = 'admin');

-- Barbershop managers should be able to read active templates
CREATE POLICY "Authenticated users can view active templates" ON public.campaign_templates
    FOR SELECT TO authenticated
    USING (is_active = true);


-- Create policies for global_promotions
CREATE POLICY "Admins can manage global promotions" ON public.global_promotions
    FOR ALL TO authenticated
    USING ((SELECT get_my_role()) = 'admin')
    WITH CHECK ((SELECT get_my_role()) = 'admin');