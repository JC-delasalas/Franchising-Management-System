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