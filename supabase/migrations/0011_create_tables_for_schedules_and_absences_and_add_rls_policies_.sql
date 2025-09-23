-- Create schedules table to store barber's working hours
CREATE TABLE public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 for Sunday, 6 for Saturday
  start_time TIME,
  end_time TIME,
  is_day_off BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(barber_id, day_of_week)
);

-- Enable RLS for schedules
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for schedules
CREATE POLICY "Barbers can manage their own schedules"
ON public.schedules
FOR ALL
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = schedules.barber_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = schedules.barber_id));


-- Create absences table for vacations and days off
CREATE TABLE public.absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for absences
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- Create policies for absences
CREATE POLICY "Barbers can manage their own absences"
ON public.absences
FOR ALL
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = absences.barber_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.barbers WHERE id = absences.barber_id));

-- Add bio and specialties to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[];