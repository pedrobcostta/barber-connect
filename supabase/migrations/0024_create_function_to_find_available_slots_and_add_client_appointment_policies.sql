-- Function to get available time slots for a specific barber, service, and date
CREATE OR REPLACE FUNCTION public.get_available_slots(p_barber_id uuid, p_service_id uuid, p_date date)
RETURNS SETOF timestamptz
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_duration INT;
    v_day_of_week INT;
    v_barbershop_id UUID;
    v_start_time TIME;
    v_end_time TIME;
    v_slot_start timestamptz;
    v_slot_end timestamptz;
    v_is_day_off BOOLEAN;
    v_is_absence BOOLEAN;
BEGIN
    -- 1. Get service duration
    SELECT duration_minutes INTO v_duration FROM public.services WHERE id = p_service_id;
    IF NOT FOUND THEN RETURN; END IF;

    v_day_of_week := EXTRACT(DOW FROM p_date);

    -- 2. Determine working hours (barber's schedule > barbershop's operating hours)
    SELECT b.barbershop_id, s.start_time, s.end_time, s.is_day_off
    INTO v_barbershop_id, v_start_time, v_end_time, v_is_day_off
    FROM public.barbers b
    LEFT JOIN public.schedules s ON s.barber_id = b.id AND s.day_of_week = v_day_of_week
    WHERE b.id = p_barber_id;
    IF NOT FOUND THEN RETURN; END IF;

    IF v_is_day_off IS TRUE THEN RETURN; END IF;
    
    IF v_start_time IS NULL OR v_end_time IS NULL THEN
        SELECT oh.open_time, oh.close_time, oh.is_closed
        INTO v_start_time, v_end_time, v_is_day_off
        FROM public.operating_hours oh
        WHERE oh.barbershop_id = v_barbershop_id AND oh.day_of_week = v_day_of_week;
        IF v_is_day_off IS TRUE OR v_start_time IS NULL THEN RETURN; END IF;
    END IF;

    -- 3. Check for absences
    SELECT EXISTS (
        SELECT 1 FROM public.absences a
        WHERE a.barber_id = p_barber_id AND p_date BETWEEN a.start_date AND a.end_date
    ) INTO v_is_absence;
    IF v_is_absence THEN RETURN; END IF;

    -- 4. Generate and check slots
    v_slot_start := p_date::timestamptz + v_start_time::interval;
    v_slot_end := p_date::timestamptz + v_end_time::interval;

    WHILE v_slot_start + (v_duration || ' minutes')::interval <= v_slot_end LOOP
        IF NOT EXISTS (
            SELECT 1 FROM public.appointments a
            WHERE a.barber_id = p_barber_id
            AND (v_slot_start, (v_slot_start + (v_duration || ' minutes')::interval)) OVERLAPS (a.start_time, a.end_time)
        ) THEN
            RETURN NEXT v_slot_start;
        END IF;
        v_slot_start := v_slot_start + '30 minutes'::interval; -- Slot interval
    END LOOP;

    RETURN;
END;
$$;

-- Add policies for clients to manage their own appointments
CREATE POLICY "Clients can create their own appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can cancel their own appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (auth.uid() = client_id);