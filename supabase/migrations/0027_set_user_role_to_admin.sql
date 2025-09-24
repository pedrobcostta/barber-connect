DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the user ID from the auth schema
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@admin.com' LIMIT 1;

    -- If the user exists, update their profile role to 'admin'
    IF admin_user_id IS NOT NULL THEN
        -- Use an UPSERT to handle cases where the profile might not exist yet,
        -- or to update it if it does.
        INSERT INTO public.profiles (id, role, full_name)
        VALUES (admin_user_id, 'admin', 'Administrador')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            -- Avoid overwriting full_name if it was set differently
            full_name = COALESCE(public.profiles.full_name, 'Administrador');
            
        RAISE NOTICE 'Admin user role has been set for %', 'admin@admin.com';
    ELSE
        RAISE WARNING 'Admin user with email % not found. Please create the user first.', 'admin@admin.com';
    END IF;
END $$;