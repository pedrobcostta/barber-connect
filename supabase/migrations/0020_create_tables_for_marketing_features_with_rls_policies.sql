-- Create a table to manage marketing campaigns
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., 'Aniversariantes', 'Lembrete de Retorno'
  template TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for discount coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  value NUMERIC NOT NULL,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create a table for loyalty program settings
CREATE TABLE public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  services_needed INT, -- e.g., '10' services
  reward TEXT, -- e.g., 'free haircut'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add a column to profiles for loyalty points
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Managers can manage their marketing campaigns"
ON public.marketing_campaigns FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));

CREATE POLICY "Managers can manage their coupons"
ON public.coupons FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));

CREATE POLICY "Managers can manage their loyalty programs"
ON public.loyalty_programs FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));