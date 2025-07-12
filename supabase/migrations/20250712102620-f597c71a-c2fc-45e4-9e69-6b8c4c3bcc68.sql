-- Fix Supabase linting issues

-- 1. Enable RLS on all tables that are missing it
ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policies for the tables

-- Role table policies
CREATE POLICY "Users can view roles in their franchisor network" ON public.role
  FOR SELECT USING (franchisor_id = get_my_franchisor_id());

CREATE POLICY "Users can manage roles in their franchisor network" ON public.role
  FOR ALL USING (franchisor_id = get_my_franchisor_id());

-- Shipment table policies
CREATE POLICY "Users can view shipments in their franchisor network" ON public.shipment
  FOR SELECT USING (
    from_location_id IN (
      SELECT location_id FROM location 
      WHERE franchisee_id IN (
        SELECT franchisee_id FROM franchisee 
        WHERE brand_id IN (
          SELECT brand_id FROM brand 
          WHERE franchisor_id = get_my_franchisor_id()
        )
      )
    ) OR to_location_id IN (
      SELECT location_id FROM location 
      WHERE franchisee_id IN (
        SELECT franchisee_id FROM franchisee 
        WHERE brand_id IN (
          SELECT brand_id FROM brand 
          WHERE franchisor_id = get_my_franchisor_id()
        )
      )
    )
  );

-- Plan table policies
CREATE POLICY "Users can view plans in their franchisor network" ON public.plan
  FOR SELECT USING (
    brand_id IN (
      SELECT brand_id FROM brand 
      WHERE franchisor_id = get_my_franchisor_id()
    )
  );

-- Subscription table policies
CREATE POLICY "Users can view subscriptions in their franchisor network" ON public.subscription
  FOR SELECT USING (
    franchisee_id IN (
      SELECT franchisee_id FROM franchisee 
      WHERE brand_id IN (
        SELECT brand_id FROM brand 
        WHERE franchisor_id = get_my_franchisor_id()
      )
    )
  );

-- Invoice table policies
CREATE POLICY "Users can view invoices in their franchisor network" ON public.invoice
  FOR SELECT USING (
    franchisee_id IN (
      SELECT franchisee_id FROM franchisee 
      WHERE brand_id IN (
        SELECT brand_id FROM brand 
        WHERE franchisor_id = get_my_franchisor_id()
      )
    )
  );

-- Payment table policies
CREATE POLICY "Users can view payments in their franchisor network" ON public.payment
  FOR SELECT USING (
    invoice_id IN (
      SELECT invoice_id FROM invoice 
      WHERE franchisee_id IN (
        SELECT franchisee_id FROM franchisee 
        WHERE brand_id IN (
          SELECT brand_id FROM brand 
          WHERE franchisor_id = get_my_franchisor_id()
        )
      )
    )
  );

-- KPI table policies
CREATE POLICY "Users can view KPIs in their franchisor network" ON public.kpi
  FOR SELECT USING (
    brand_id IN (
      SELECT brand_id FROM brand 
      WHERE franchisor_id = get_my_franchisor_id()
    )
  );

-- KPI data table policies
CREATE POLICY "Users can view KPI data in their franchisor network" ON public.kpi_data
  FOR SELECT USING (
    kpi_id IN (
      SELECT kpi_id FROM kpi 
      WHERE brand_id IN (
        SELECT brand_id FROM brand 
        WHERE franchisor_id = get_my_franchisor_id()
      )
    )
  );

-- Training module table policies
CREATE POLICY "Users can view training modules in their franchisor network" ON public.training_module
  FOR SELECT USING (
    brand_id IN (
      SELECT brand_id FROM brand 
      WHERE franchisor_id = get_my_franchisor_id()
    )
  );

-- User training table policies
CREATE POLICY "Users can view their own training records" ON public.user_training
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own training records" ON public.user_training
  FOR UPDATE USING (user_id = auth.uid());

-- Contract table policies
CREATE POLICY "Users can view contracts in their franchisor network" ON public.contract
  FOR SELECT USING (
    franchisee_id IN (
      SELECT franchisee_id FROM franchisee 
      WHERE brand_id IN (
        SELECT brand_id FROM brand 
        WHERE franchisor_id = get_my_franchisor_id()
      )
    )
  );

-- Contract version table policies
CREATE POLICY "Users can view contract versions in their franchisor network" ON public.contract_version
  FOR SELECT USING (
    contract_id IN (
      SELECT contract_id FROM contract 
      WHERE franchisee_id IN (
        SELECT franchisee_id FROM franchisee 
        WHERE brand_id IN (
          SELECT brand_id FROM brand 
          WHERE franchisor_id = get_my_franchisor_id()
        )
      )
    )
  );

-- User role table policies
CREATE POLICY "Users can view user roles in their franchisor network" ON public.user_role
  FOR SELECT USING (
    location_id IN (
      SELECT location_id FROM location 
      WHERE franchisee_id IN (
        SELECT franchisee_id FROM franchisee 
        WHERE brand_id IN (
          SELECT brand_id FROM brand 
          WHERE franchisor_id = get_my_franchisor_id()
        )
      )
    )
  );

-- Role permission table policies
CREATE POLICY "Users can view role permissions in their franchisor network" ON public.role_permission
  FOR SELECT USING (
    role_id IN (
      SELECT role_id FROM role 
      WHERE franchisor_id = get_my_franchisor_id()
    )
  );

-- Permission table policies (public read access for system permissions)
CREATE POLICY "All authenticated users can view permissions" ON public.permission
  FOR SELECT TO authenticated USING (true);

-- Audit logs table policies
CREATE POLICY "Users can view audit logs in their franchisor network" ON public.audit_logs
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM user_profiles 
      WHERE franchisor_id = get_my_franchisor_id()
    )
  );

-- 3. Fix function search_path issues by recreating functions with proper settings

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix get_my_franchisor_id function
CREATE OR REPLACE FUNCTION public.get_my_franchisor_id()
RETURNS UUID 
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT franchisor_id FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- 4. Recreate views without SECURITY DEFINER property

-- Drop and recreate user_dashboard_view
DROP VIEW IF EXISTS public.user_dashboard_view;
CREATE VIEW public.user_dashboard_view AS
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

-- Drop and recreate franchise_overview
DROP VIEW IF EXISTS public.franchise_overview;
CREATE VIEW public.franchise_overview AS
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

-- Drop and recreate sales_analytics_view
DROP VIEW IF EXISTS public.sales_analytics_view;
CREATE VIEW public.sales_analytics_view AS
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