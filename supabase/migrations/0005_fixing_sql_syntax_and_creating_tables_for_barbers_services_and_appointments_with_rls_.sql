-- Create a table to link authenticated users to barbershop roles
CREATE TABLE public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- A user can only be one barber
);
-- Enable RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
-- Policies: Users can see their own barber profile. Barbershop owners can see all barbers in their shop.
CREATE POLICY "Barbers can view their own profile" ON public.barbers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can view barbers in their barbershop" ON public.barbers FOR SELECT USING ((SELECT owner_id FROM public.barbershops WHERE id = barbershop_id) = auth.uid());


-- Create a table for services offered by a barbershop
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
-- Policies: Authenticated users can view services. Owners can manage them.
CREATE POLICY "Authenticated users can view services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can manage services in their barbershop" ON public.services FOR ALL USING ((SELECT owner_id FROM public.barbershops WHERE id = barbershop_id) = auth.uid());


-- Create a table for appointments
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- e.g., scheduled, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Policies: Barbers and clients can see their own appointments. Owners can see all appointments in their shop.
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT USING (auth.uid() = client_id OR auth.uid() = (SELECT user_id FROM public.barbers WHERE id = barber_id));
CREATE POLICY "Owners can manage appointments in their barbershop" ON public.appointments FOR ALL USING ((SELECT owner_id FROM public.barbershops WHERE id = barbershop_id) = auth.uid());