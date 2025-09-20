-- 1. Create an ENUM type for user roles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('gestor', 'barbeiro', 'admin', 'cliente');
    END IF;
END
$$;

-- 2. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role public.user_role NOT NULL,
  cnpj TEXT,
  phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the profiles table
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Create a function to handle new user sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, cnpj, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name', 
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    new.raw_user_meta_data ->> 'cnpj',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- 6. Create a trigger to execute the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();