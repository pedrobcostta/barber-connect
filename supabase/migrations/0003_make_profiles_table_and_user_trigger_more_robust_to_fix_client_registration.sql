-- Make the handle_new_user function safer by handling potentially missing metadata
-- This prevents errors if a signup occurs without full metadata.
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
    -- Default to 'cliente' if role is not provided, which is critical for preventing NOT NULL violations.
    COALESCE((new.raw_user_meta_data ->> 'role')::public.user_role, 'cliente'),
    new.raw_user_meta_data ->> 'cnpj',
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

-- Re-apply the trigger to ensure the updated function is used
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();