-- This ensures that all user roles used in the application are valid in the database.
-- Using 'IF NOT EXISTS' makes the operation safe to run multiple times.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gestor';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'barbeiro';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cliente';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin';