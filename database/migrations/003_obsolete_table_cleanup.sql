-- =====================================================
-- OBSOLETE TABLE CLEANUP MIGRATION
-- Post-Consolidation Cleanup Phase
-- =====================================================

-- This migration removes obsolete table references and cleans up
-- tables that have been consolidated into unified views

-- Step 1: Verify unified systems are operational
SELECT 'VERIFICATION: Unified Systems Status' as status;

-- Check unified_inventory view exists and has data
SELECT 
  'unified_inventory' as view_name,
  COUNT(*) as record_count,
  SUM(total_value) as total_inventory_value
FROM unified_inventory;

-- Check unified_sales view exists (if migration 002 was executed)
SELECT 
  'unified_sales' as view_name,
  COUNT(*) as record_count,
  SUM(total_amount) as total_sales_value
FROM unified_sales;

-- Step 2: Create backup of tables before cleanup (safety measure)
CREATE SCHEMA IF NOT EXISTS obsolete_table_backup;

-- Backup sales_receipts before potential removal
CREATE TABLE IF NOT EXISTS obsolete_table_backup.sales_receipts_backup AS
SELECT * FROM sales_receipts;

-- Backup addresses tables before removal
CREATE TABLE IF NOT EXISTS obsolete_table_backup.addresses_backup AS
SELECT * FROM addresses WHERE 1=0; -- Structure only since table is empty

CREATE TABLE IF NOT EXISTS obsolete_table_backup.user_addresses_backup AS
SELECT * FROM user_addresses WHERE 1=0; -- Structure only since table is empty

-- Step 3: Update any remaining direct references to obsolete tables
-- Note: Most code references have been updated, this handles any database-level references

-- Update any views that might reference old tables (if any exist)
-- This is a safety check - most should already be handled

-- Step 4: Create compatibility functions for legacy code (temporary)
-- These functions provide backward compatibility while code is being updated

CREATE OR REPLACE FUNCTION get_inventory_levels_legacy(p_warehouse_id UUID)
RETURNS TABLE (
  warehouse_id UUID,
  product_id UUID,
  quantity_on_hand INTEGER,
  reserved_quantity INTEGER,
  available_quantity INTEGER,
  reorder_level INTEGER,
  max_stock_level INTEGER,
  cost_per_unit NUMERIC,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_restocked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Redirect to unified_inventory view with column mapping
  RETURN QUERY
  SELECT 
    ui.location_id as warehouse_id,
    ui.product_id,
    ui.quantity as quantity_on_hand,
    ui.reserved_quantity,
    ui.available_quantity,
    ui.reorder_point as reorder_level,
    ui.max_stock_level,
    ui.unit_cost as cost_per_unit,
    ui.last_counted_at,
    ui.last_restocked_at
  FROM unified_inventory ui
  WHERE ui.location_id = p_warehouse_id
    AND ui.inventory_type = 'warehouse';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_sales_receipts_legacy(p_location_id UUID)
RETURNS TABLE (
  id UUID,
  location_id UUID,
  total_amount NUMERIC,
  tax_amount NUMERIC,
  discount_amount NUMERIC,
  payment_method VARCHAR,
  receipt_number VARCHAR,
  cashier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Redirect to unified_sales view
  RETURN QUERY
  SELECT 
    us.id::UUID,
    us.location_id::UUID,
    us.total_amount,
    us.tax_amount,
    us.discount_amount,
    us.payment_method,
    us.receipt_number,
    us.cashier_id,
    us.created_at
  FROM unified_sales us
  WHERE us.location_id::UUID = p_location_id
    AND us.source_type = 'sales_receipt';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create cleanup verification function
CREATE OR REPLACE FUNCTION verify_obsolete_table_cleanup()
RETURNS TABLE (
  table_name TEXT,
  status TEXT,
  record_count BIGINT,
  replacement_system TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'inventory_levels'::TEXT as table_name,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_levels') 
      THEN 'EXISTS - Part of unified system'
      ELSE 'REMOVED'
    END as status,
    COALESCE((SELECT COUNT(*) FROM inventory_levels), 0) as record_count,
    'unified_inventory view'::TEXT as replacement_system
  UNION ALL
  SELECT 
    'sales_receipts'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_receipts') 
      THEN 'EXISTS - Migration pending'
      ELSE 'MIGRATED'
    END,
    COALESCE((SELECT COUNT(*) FROM sales_receipts), 0),
    'unified_sales view'::TEXT
  UNION ALL
  SELECT 
    'addresses'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'addresses') 
      THEN 'EXISTS - Can be removed'
      ELSE 'REMOVED'
    END,
    COALESCE((SELECT COUNT(*) FROM addresses), 0),
    'user_profiles.metadata'::TEXT
  UNION ALL
  SELECT 
    'user_addresses'::TEXT,
    CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_addresses') 
      THEN 'EXISTS - Can be removed'
      ELSE 'REMOVED'
    END,
    COALESCE((SELECT COUNT(*) FROM user_addresses), 0),
    'user_profiles.metadata'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Optional cleanup of empty tables (commented out for safety)
-- Uncomment these after verifying all code has been updated

-- Remove empty address tables (0 records each)
-- DROP TABLE IF EXISTS addresses CASCADE;
-- DROP TABLE IF EXISTS user_addresses CASCADE;

-- Note: inventory_levels and sales_receipts should NOT be dropped yet
-- They are part of the unified system and may still contain valuable data

-- Step 7: Create indexes for compatibility functions
CREATE INDEX IF NOT EXISTS idx_unified_inventory_location_type 
ON unified_inventory(location_id, inventory_type);

CREATE INDEX IF NOT EXISTS idx_unified_sales_location_source 
ON unified_sales(location_id, source_type);

-- Step 8: Grant permissions for compatibility functions
GRANT EXECUTE ON FUNCTION get_inventory_levels_legacy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_sales_receipts_legacy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_obsolete_table_cleanup() TO authenticated;

-- Step 9: Final verification
SELECT 'CLEANUP VERIFICATION' as status;
SELECT * FROM verify_obsolete_table_cleanup();

-- Migration complete
SELECT 'Obsolete Table Cleanup Migration Complete' as status,
       'Legacy compatibility functions created for smooth transition' as note;
