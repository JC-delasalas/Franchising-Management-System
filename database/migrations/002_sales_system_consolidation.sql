-- =====================================================
-- SALES SYSTEM CONSOLIDATION MIGRATION
-- Phase 1: Critical Database Consolidation
-- =====================================================

-- Step 1: Analyze current sales data structure
-- Check sales_records table structure
SELECT 'sales_records structure' as analysis_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sales_records'
ORDER BY ordinal_position;

-- Check sales_receipts table structure  
SELECT 'sales_receipts structure' as analysis_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sales_receipts'
ORDER BY ordinal_position;

-- Step 2: Data volume and value analysis
WITH sales_records_analysis AS (
  SELECT 
    'sales_records' as table_name,
    COUNT(*) as total_records,
    COALESCE(SUM(total_amount), 0) as total_value,
    COALESCE(AVG(total_amount), 0) as avg_transaction,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    COUNT(DISTINCT location_id) as unique_locations,
    COUNT(DISTINCT created_by) as unique_users
  FROM sales_records
),
sales_receipts_analysis AS (
  SELECT 
    'sales_receipts' as table_name,
    COUNT(*) as total_records,
    COALESCE(SUM(total_amount), 0) as total_value,
    COALESCE(AVG(total_amount), 0) as avg_transaction,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record,
    COUNT(DISTINCT location_id) as unique_locations,
    COUNT(DISTINCT cashier_id) as unique_users
  FROM sales_receipts
)
SELECT * FROM sales_records_analysis
UNION ALL
SELECT * FROM sales_receipts_analysis;

-- Step 3: Create enhanced sales_records table with POS receipt capabilities
-- Add columns to sales_records to accommodate POS receipt data
ALTER TABLE sales_records 
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS cashier_id UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS receipt_type VARCHAR(20) DEFAULT 'sale',
ADD COLUMN IF NOT EXISTS pos_terminal_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Step 4: Create unified sales view
CREATE OR REPLACE VIEW unified_sales AS
WITH enhanced_sales_records AS (
  SELECT 
    sr.id,
    'sales_record' as source_type,
    sr.location_id,
    fl.name as location_name,
    sr.total_amount,
    sr.tax_amount,
    sr.discount_amount,
    sr.payment_method,
    sr.receipt_number,
    sr.cashier_id,
    sr.customer_id,
    sr.created_by,
    sr.notes,
    sr.receipt_type,
    sr.pos_terminal_id,
    sr.created_at,
    sr.updated_at,
    up_cashier.full_name as cashier_name,
    up_created.full_name as created_by_name
  FROM sales_records sr
  LEFT JOIN franchise_locations fl ON sr.location_id = fl.id
  LEFT JOIN user_profiles up_cashier ON sr.cashier_id = up_cashier.id
  LEFT JOIN user_profiles up_created ON sr.created_by = up_created.id
),
legacy_sales_receipts AS (
  SELECT 
    sr.id,
    'sales_receipt' as source_type,
    sr.location_id,
    fl.name as location_name,
    sr.total_amount,
    sr.tax_amount,
    sr.discount_amount,
    sr.payment_method,
    sr.receipt_number,
    sr.cashier_id,
    NULL::UUID as customer_id,
    sr.cashier_id as created_by, -- Map cashier as creator for receipts
    sr.notes,
    'sale' as receipt_type,
    sr.pos_terminal_id,
    sr.created_at,
    sr.updated_at,
    up_cashier.full_name as cashier_name,
    up_cashier.full_name as created_by_name
  FROM sales_receipts sr
  LEFT JOIN franchise_locations fl ON sr.location_id = fl.id
  LEFT JOIN user_profiles up_cashier ON sr.cashier_id = up_cashier.id
)
SELECT * FROM enhanced_sales_records
UNION ALL
SELECT * FROM legacy_sales_receipts
ORDER BY created_at DESC;

-- Step 5: Create migration function to consolidate sales data
CREATE OR REPLACE FUNCTION migrate_sales_receipts_to_records()
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
  receipt_record RECORD;
BEGIN
  -- Migrate sales_receipts data to sales_records
  FOR receipt_record IN 
    SELECT * FROM sales_receipts 
    WHERE id NOT IN (
      SELECT id FROM sales_records 
      WHERE receipt_number IS NOT NULL
    )
  LOOP
    INSERT INTO sales_records (
      id,
      location_id,
      total_amount,
      tax_amount,
      discount_amount,
      payment_method,
      receipt_number,
      cashier_id,
      created_by,
      notes,
      receipt_type,
      pos_terminal_id,
      created_at,
      updated_at
    ) VALUES (
      receipt_record.id,
      receipt_record.location_id,
      receipt_record.total_amount,
      receipt_record.tax_amount,
      receipt_record.discount_amount,
      receipt_record.payment_method,
      receipt_record.receipt_number,
      receipt_record.cashier_id,
      receipt_record.cashier_id, -- Use cashier as creator
      receipt_record.notes,
      'pos_sale',
      receipt_record.pos_terminal_id,
      receipt_record.created_at,
      receipt_record.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      receipt_number = EXCLUDED.receipt_number,
      cashier_id = EXCLUDED.cashier_id,
      payment_method = EXCLUDED.payment_method,
      tax_amount = EXCLUDED.tax_amount,
      discount_amount = EXCLUDED.discount_amount,
      pos_terminal_id = EXCLUDED.pos_terminal_id,
      receipt_type = EXCLUDED.receipt_type;
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update KPI functions to use unified sales data
CREATE OR REPLACE FUNCTION calculate_sales_kpis(p_location_id UUID, p_period_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_sales NUMERIC := 0;
  total_transactions INTEGER := 0;
  avg_transaction NUMERIC := 0;
  period_start TIMESTAMP := CURRENT_DATE - INTERVAL '1 day' * p_period_days;
BEGIN
  -- Calculate sales metrics from unified view
  SELECT 
    COALESCE(SUM(total_amount), 0),
    COUNT(*),
    COALESCE(AVG(total_amount), 0)
  INTO total_sales, total_transactions, avg_transaction
  FROM unified_sales
  WHERE location_id = p_location_id 
    AND created_at >= period_start;

  -- Build result JSON
  result := json_build_object(
    'totalSales', total_sales,
    'totalTransactions', total_transactions,
    'averageTransaction', avg_transaction,
    'periodDays', p_period_days,
    'periodStart', period_start
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create sales summary view for reporting
CREATE OR REPLACE VIEW sales_summary AS
SELECT 
  location_id,
  location_name,
  DATE(created_at) as sale_date,
  COUNT(*) as transaction_count,
  SUM(total_amount) as daily_sales,
  AVG(total_amount) as avg_transaction,
  SUM(tax_amount) as total_tax,
  SUM(discount_amount) as total_discounts,
  COUNT(DISTINCT cashier_id) as active_cashiers,
  COUNT(DISTINCT payment_method) as payment_methods_used
FROM unified_sales
GROUP BY location_id, location_name, DATE(created_at)
ORDER BY sale_date DESC, daily_sales DESC;

-- Step 8: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_records_location_date ON sales_records(location_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_records_cashier ON sales_records(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_receipt_number ON sales_records(receipt_number);
CREATE INDEX IF NOT EXISTS idx_sales_records_payment_method ON sales_records(payment_method);

-- Step 9: Grant permissions
GRANT SELECT ON unified_sales TO authenticated;
GRANT SELECT ON sales_summary TO authenticated;
GRANT EXECUTE ON FUNCTION migrate_sales_receipts_to_records() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_sales_kpis(UUID, INTEGER) TO authenticated;

-- Step 10: Execute migration (commented out for safety)
-- SELECT migrate_sales_receipts_to_records() as migrated_records;

-- Migration complete
SELECT 'Sales System Consolidation Migration Ready' as status,
       'Run migrate_sales_receipts_to_records() to execute data migration' as next_step;
