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

-- Add RLS policies for metadata access
CREATE POLICY IF NOT EXISTS "Users can view their metadata" 
ON public.user_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their metadata" 
ON public.user_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create proper data access views for frontend
CREATE OR REPLACE VIEW public.user_dashboard_view AS
SELECT 
  up.user_id,
  up.first_nm,
  up.last_nm,
  up.phone_no,
  up.avatar_url,
  up.status,
  up.metadata,
  up.preferences,
  f.company_nm as franchisor_name,
  f.franchisor_id
FROM public.user_profiles up
JOIN public.franchisor f ON f.franchisor_id = up.franchisor_id
WHERE up.user_id = auth.uid();

-- Create comprehensive franchise data view
CREATE OR REPLACE VIEW public.franchise_overview AS
SELECT 
  fr.franchisee_id,
  fr.op_nm as operating_name,
  fr.legal_nm as legal_name,
  fr.contact_email,
  fr.status,
  fr.onboarding_status,
  fr.metadata,
  b.brand_nm as brand_name,
  b.tagline as brand_tagline,
  b.logo_url as brand_logo,
  COUNT(l.location_id) as location_count,
  COALESCE(SUM(st.total_amt), 0) as total_sales
FROM public.franchisee fr
JOIN public.brand b ON b.brand_id = fr.brand_id
LEFT JOIN public.location l ON l.franchisee_id = fr.franchisee_id
LEFT JOIN public.sales_transaction st ON st.location_id = l.location_id
WHERE b.franchisor_id = get_my_franchisor_id()
GROUP BY fr.franchisee_id, fr.op_nm, fr.legal_nm, fr.contact_email, fr.status, fr.onboarding_status, fr.metadata, b.brand_nm, b.tagline, b.logo_url;

-- Create sales analytics view
CREATE OR REPLACE VIEW public.sales_analytics_view AS
SELECT 
  DATE_TRUNC('month', st.txn_date) as period,
  l.franchisee_id,
  fr.op_nm as franchise_name,
  b.brand_nm,
  COUNT(st.txn_id) as transaction_count,
  SUM(st.total_amt) as total_sales,
  AVG(st.total_amt) as avg_transaction_value,
  SUM(si.qty_sold) as total_items_sold
FROM public.sales_transaction st
JOIN public.location l ON l.location_id = st.location_id
JOIN public.franchisee fr ON fr.franchisee_id = l.franchisee_id
JOIN public.brand b ON b.brand_id = fr.brand_id
LEFT JOIN public.sales_item si ON si.txn_id = st.txn_id
WHERE b.franchisor_id = get_my_franchisor_id()
GROUP BY DATE_TRUNC('month', st.txn_date), l.franchisee_id, fr.op_nm, b.brand_nm;

-- Add RLS policies for views
ALTER VIEW public.user_dashboard_view SET (security_barrier = true);
ALTER VIEW public.franchise_overview SET (security_barrier = true);
ALTER VIEW public.sales_analytics_view SET (security_barrier = true);