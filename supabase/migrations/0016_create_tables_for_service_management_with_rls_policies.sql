-- Join table to link barbers to specific services they perform
CREATE TABLE public.barber_services (
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (barber_id, service_id)
);
-- RLS for barber_services
ALTER TABLE public.barber_services ENABLE ROW LEVEL SECURITY;
-- Policy: Managers can manage associations for their barbershop
CREATE POLICY "Managers can manage barber_services"
ON public.barber_services
FOR ALL
USING (
  (SELECT barbershop_id FROM public.barbers WHERE id = barber_id) = (SELECT get_my_barbershop_id())
);

-- Table for service packages/combos
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS for packages
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage their packages"
ON public.packages
FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));

-- Join table for services within a package
CREATE TABLE public.package_services (
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, service_id)
);
-- RLS for package_services
ALTER TABLE public.package_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage package_services"
ON public.package_services
FOR ALL
USING (
  (SELECT barbershop_id FROM public.packages WHERE id = package_id) = (SELECT get_my_barbershop_id())
);

-- Table for subscription plans
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  frequency TEXT NOT NULL, -- e.g., 'monthly', 'quarterly'
  uses_per_period INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can manage their subscriptions"
ON public.subscriptions
FOR ALL
USING (barbershop_id = (SELECT get_my_barbershop_id()));