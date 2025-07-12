
-- Create tables for File Maintenance
CREATE TABLE public.file_maintenance (
  file_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id uuid NOT NULL REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE,
  franchisee_id uuid REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT,
  file_path TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  uploaded_by uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tables for enhanced sales transactions with daily reporting
CREATE TABLE public.daily_sales_report (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.location(location_id) ON DELETE CASCADE,
  franchisee_id uuid NOT NULL REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  file_path TEXT,
  notes TEXT,
  submitted_by uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(location_id, report_date)
);

-- Create tables for report generation
CREATE TABLE public.generated_reports (
  report_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchisor_id uuid NOT NULL REFERENCES public.franchisor(franchisor_id) ON DELETE CASCADE,
  franchisee_id uuid REFERENCES public.franchisee(franchisee_id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  parameters JSONB,
  file_path TEXT,
  file_size BIGINT,
  generated_by uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL,
  date_from DATE,
  date_to DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.file_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_maintenance
CREATE POLICY "Users can view files in their franchisor network"
ON public.file_maintenance
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

CREATE POLICY "Users can create files in their franchisor network"
ON public.file_maintenance
FOR INSERT
WITH CHECK (franchisor_id = public.get_my_franchisor_id());

CREATE POLICY "Users can update files in their franchisor network"
ON public.file_maintenance
FOR UPDATE
USING (franchisor_id = public.get_my_franchisor_id());

CREATE POLICY "Users can delete files in their franchisor network"
ON public.file_maintenance
FOR DELETE
USING (franchisor_id = public.get_my_franchisor_id());

-- RLS Policies for daily_sales_report
CREATE POLICY "Users can view sales reports in their franchisor network"
ON public.daily_sales_report
FOR SELECT
USING (
  franchisee_id IN (
    SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
      SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
    )
  )
);

CREATE POLICY "Users can create sales reports in their franchisor network"
ON public.daily_sales_report
FOR INSERT
WITH CHECK (
  franchisee_id IN (
    SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
      SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
    )
  )
);

CREATE POLICY "Users can update sales reports in their franchisor network"
ON public.daily_sales_report
FOR UPDATE
USING (
  franchisee_id IN (
    SELECT franchisee_id FROM public.franchisee WHERE brand_id IN (
      SELECT brand_id FROM public.brand WHERE franchisor_id = public.get_my_franchisor_id()
    )
  )
);

-- RLS Policies for generated_reports
CREATE POLICY "Users can view generated reports in their franchisor network"
ON public.generated_reports
FOR SELECT
USING (franchisor_id = public.get_my_franchisor_id());

CREATE POLICY "Users can create generated reports in their franchisor network"
ON public.generated_reports
FOR INSERT
WITH CHECK (franchisor_id = public.get_my_franchisor_id());

CREATE POLICY "Users can update generated reports in their franchisor network"
ON public.generated_reports
FOR UPDATE
USING (franchisor_id = public.get_my_franchisor_id());

-- Add indexes for performance
CREATE INDEX idx_file_maintenance_franchisor ON public.file_maintenance(franchisor_id);
CREATE INDEX idx_file_maintenance_franchisee ON public.file_maintenance(franchisee_id);
CREATE INDEX idx_file_maintenance_category ON public.file_maintenance(category);
CREATE INDEX idx_daily_sales_report_location ON public.daily_sales_report(location_id);
CREATE INDEX idx_daily_sales_report_date ON public.daily_sales_report(report_date);
CREATE INDEX idx_daily_sales_report_franchisee ON public.daily_sales_report(franchisee_id);
CREATE INDEX idx_generated_reports_type ON public.generated_reports(report_type);
CREATE INDEX idx_generated_reports_franchisor ON public.generated_reports(franchisor_id);

-- Add triggers for updated_at
CREATE TRIGGER on_file_maintenance_update BEFORE UPDATE ON public.file_maintenance FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_daily_sales_report_update BEFORE UPDATE ON public.daily_sales_report FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_generated_reports_update BEFORE UPDATE ON public.generated_reports FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Insert sample data for testing
INSERT INTO public.daily_sales_report (
  location_id, 
  franchisee_id, 
  report_date, 
  total_sales, 
  total_transactions,
  status
)
SELECT 
  l.location_id,
  l.franchisee_id,
  CURRENT_DATE - INTERVAL '1 day',
  3450.00,
  28,
  'submitted'
FROM public.location l
LIMIT 1;
