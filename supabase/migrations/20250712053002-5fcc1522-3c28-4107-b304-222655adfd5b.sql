-- Fix missing enum types and ensure demo users can be created properly

-- Create missing enums if they don't exist
DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'annually', 'one-time');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE module_type_enum AS ENUM ('document', 'video', 'quiz');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    default_franchisor_id uuid;
BEGIN
  -- Get or create a default franchisor
  SELECT franchisor_id INTO default_franchisor_id 
  FROM public.franchisor 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- If no franchisor exists, create one
  IF default_franchisor_id IS NULL THEN
    INSERT INTO public.franchisor (company_nm, contact_email, status)
    VALUES ('Demo Franchise Company', 'admin@demofranchise.com', 'active')
    RETURNING franchisor_id INTO default_franchisor_id;
  END IF;
  
  -- Create user profile from auth.users metadata
  INSERT INTO public.user_profiles (user_id, franchisor_id, first_nm, last_nm, phone_no, status)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'franchisor_id')::uuid, default_franchisor_id),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'Name'),
    NEW.raw_user_meta_data ->> 'phone',
    'active'::user_status_enum
  );
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create demo franchisor and brand data if they don't exist
INSERT INTO public.franchisor (franchisor_id, company_nm, contact_email, status)
VALUES ('f2c98ac4-438e-4902-a232-3a7479242cf1', 'Demo Franchise Corp', 'demo@franchisor.com', 'active'::user_status_enum)
ON CONFLICT (franchisor_id) DO NOTHING;

-- Create demo brand
INSERT INTO public.brand (brand_id, franchisor_id, brand_nm, tagline)
VALUES ('b1c98ac4-438e-4902-a232-3a7479242cf1', 'f2c98ac4-438e-4902-a232-3a7479242cf1', 'Demo Brand', 'Your Demo Franchise')
ON CONFLICT (brand_id) DO NOTHING;

-- Create demo franchisee
INSERT INTO public.franchisee (franchisee_id, brand_id, op_nm, contact_email, status)
VALUES ('a1c98ac4-438e-4902-a232-3a7479242cf1', 'b1c98ac4-438e-4902-a232-3a7479242cf1', 'Demo Franchisee Store', 'demo@franchisee.com', 'active'::user_status_enum)
ON CONFLICT (franchisee_id) DO NOTHING;