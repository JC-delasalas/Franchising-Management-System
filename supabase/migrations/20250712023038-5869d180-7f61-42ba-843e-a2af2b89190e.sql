-- Create proper user profile setup trigger to handle auth.users data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Create user profile from auth.users metadata
  INSERT INTO public.user_profiles (user_id, franchisor_id, first_nm, last_nm, phone_no, status)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'franchisor_id')::uuid, gen_random_uuid()),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'Name'),
    NEW.raw_user_meta_data ->> 'phone',
    'active'::user_status_enum
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add JSONB columns for unstructured/semi-structured data
ALTER TABLE public.audit_logs 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

ALTER TABLE public.brand
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS marketing_data JSONB DEFAULT '{}';

ALTER TABLE public.franchisee
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

ALTER TABLE public.location
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}';

ALTER TABLE public.product
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_attributes JSONB DEFAULT '{}';

ALTER TABLE public.sales_transaction
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}';

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add GIN indexes for JSONB performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON public.audit_logs USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_brand_metadata ON public.brand USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_franchisee_metadata ON public.franchisee USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_location_metadata ON public.location USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_product_metadata ON public.product USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_sales_transaction_metadata ON public.sales_transaction USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_user_profiles_metadata ON public.user_profiles USING GIN(metadata);