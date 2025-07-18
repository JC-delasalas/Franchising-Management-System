-- =====================================================
-- UNIFIED INVENTORY SYSTEM MIGRATION
-- Phase 1: Critical Database Consolidation
-- =====================================================

-- Create unified inventory view that combines warehouse and location inventory
CREATE OR REPLACE VIEW unified_inventory AS
WITH warehouse_inventory AS (
  SELECT 
    (il.warehouse_id::text || '-' || il.product_id::text) as id,
    'warehouse' as inventory_type,
    il.warehouse_id as location_id,
    w.name as location_name,
    w.city,
    w.type as location_type,
    il.product_id,
    p.name as product_name,
    p.sku,
    p.category,
    il.quantity_on_hand as quantity,
    COALESCE(il.reserved_quantity, 0) as reserved_quantity,
    (il.quantity_on_hand - COALESCE(il.reserved_quantity, 0)) as available_quantity,
    COALESCE(il.reorder_level, 0) as reorder_point,
    COALESCE(il.max_stock_level, 0) as max_stock_level,
    COALESCE(il.cost_per_unit, 0) as unit_cost,
    (il.quantity_on_hand * COALESCE(il.cost_per_unit, 0)) as total_value,
    il.last_counted_at,
    il.last_restocked_at,
    COALESCE(il.created_at, NOW()) as created_at,
    COALESCE(il.updated_at, NOW()) as updated_at
  FROM inventory_levels il
  JOIN warehouses w ON il.warehouse_id = w.id
  JOIN products p ON il.product_id = p.id
),
location_inventory AS (
  SELECT 
    ii.id::text as id,
    'location' as inventory_type,
    ii.location_id,
    fl.name as location_name,
    fl.city,
    'franchise_location' as location_type,
    ii.product_id,
    p.name as product_name,
    p.sku,
    p.category,
    ii.quantity,
    0 as reserved_quantity,
    ii.quantity as available_quantity,
    COALESCE(ii.reorder_point, 0) as reorder_point,
    COALESCE(ii.max_stock_level, 0) as max_stock_level,
    COALESCE(ii.unit_cost, 0) as unit_cost,
    (ii.quantity * COALESCE(ii.unit_cost, 0)) as total_value,
    NULL::timestamp with time zone as last_counted_at,
    NULL::timestamp with time zone as last_restocked_at,
    ii.created_at,
    ii.updated_at
  FROM inventory_items ii
  JOIN franchise_locations fl ON ii.location_id = fl.id
  JOIN products p ON ii.product_id = p.id
)
SELECT * FROM warehouse_inventory
UNION ALL
SELECT * FROM location_inventory
ORDER BY inventory_type, location_name, product_name;

-- Create inventory summary view for dashboard KPIs
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
  inventory_type,
  location_id,
  location_name,
  location_type,
  COUNT(*) as total_products,
  SUM(quantity) as total_quantity,
  SUM(total_value) as total_value,
  COUNT(CASE WHEN quantity <= reorder_point THEN 1 END) as low_stock_items,
  AVG(quantity) as avg_quantity_per_product,
  MAX(updated_at) as last_updated
FROM unified_inventory
GROUP BY inventory_type, location_id, location_name, location_type
ORDER BY total_value DESC;

-- Create function to get inventory for a specific location (warehouse or franchise)
CREATE OR REPLACE FUNCTION get_location_inventory(p_location_id UUID)
RETURNS TABLE (
  id TEXT,
  inventory_type TEXT,
  location_name TEXT,
  product_name TEXT,
  sku TEXT,
  quantity INTEGER,
  available_quantity INTEGER,
  reorder_point INTEGER,
  unit_cost NUMERIC,
  total_value NUMERIC,
  stock_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.id,
    ui.inventory_type,
    ui.location_name,
    ui.product_name,
    ui.sku,
    ui.quantity,
    ui.available_quantity,
    ui.reorder_point,
    ui.unit_cost,
    ui.total_value,
    CASE 
      WHEN ui.quantity <= ui.reorder_point THEN 'Critical'
      WHEN ui.quantity <= (ui.reorder_point * 1.5) THEN 'Low'
      ELSE 'Good'
    END as stock_status
  FROM unified_inventory ui
  WHERE ui.location_id = p_location_id
  ORDER BY ui.product_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to get network-wide inventory summary for franchisors
CREATE OR REPLACE FUNCTION get_network_inventory_summary()
RETURNS TABLE (
  total_locations INTEGER,
  total_products INTEGER,
  total_inventory_value NUMERIC,
  warehouse_value NUMERIC,
  location_value NUMERIC,
  critical_stock_items INTEGER,
  low_stock_items INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ui.location_id)::INTEGER as total_locations,
    COUNT(DISTINCT ui.product_id)::INTEGER as total_products,
    SUM(ui.total_value) as total_inventory_value,
    SUM(CASE WHEN ui.inventory_type = 'warehouse' THEN ui.total_value ELSE 0 END) as warehouse_value,
    SUM(CASE WHEN ui.inventory_type = 'location' THEN ui.total_value ELSE 0 END) as location_value,
    COUNT(CASE WHEN ui.quantity <= ui.reorder_point THEN 1 END)::INTEGER as critical_stock_items,
    COUNT(CASE WHEN ui.quantity <= (ui.reorder_point * 1.5) AND ui.quantity > ui.reorder_point THEN 1 END)::INTEGER as low_stock_items
  FROM unified_inventory ui;
END;
$$ LANGUAGE plpgsql;

-- Update the existing calculate_franchisee_kpis function to use unified inventory
CREATE OR REPLACE FUNCTION calculate_franchisee_kpis(p_location_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  today_sales NUMERIC := 0;
  week_sales NUMERIC := 0;
  month_sales NUMERIC := 0;
  inventory_value NUMERIC := 0;
  low_stock_count INTEGER := 0;
BEGIN
  -- Calculate sales metrics
  SELECT COALESCE(SUM(total_amount), 0) INTO today_sales
  FROM sales_records 
  WHERE location_id = p_location_id 
    AND DATE(created_at) = CURRENT_DATE;

  SELECT COALESCE(SUM(total_amount), 0) INTO week_sales
  FROM sales_records 
  WHERE location_id = p_location_id 
    AND created_at >= CURRENT_DATE - INTERVAL '7 days';

  SELECT COALESCE(SUM(total_amount), 0) INTO month_sales
  FROM sales_records 
  WHERE location_id = p_location_id 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate inventory metrics using unified view
  SELECT 
    COALESCE(SUM(total_value), 0),
    COUNT(CASE WHEN quantity <= reorder_point THEN 1 END)
  INTO inventory_value, low_stock_count
  FROM unified_inventory
  WHERE location_id = p_location_id;

  -- Build result JSON
  result := json_build_object(
    'todaySales', today_sales,
    'weekSales', week_sales,
    'monthSales', month_sales,
    'salesChange', 0, -- Would calculate from historical data
    'orderCount', (SELECT COUNT(*) FROM orders WHERE created_by IN (
      SELECT id FROM user_profiles WHERE metadata->>'primary_location_id' = p_location_id::text
    )),
    'avgOrderValue', CASE WHEN month_sales > 0 THEN month_sales / GREATEST(1, (SELECT COUNT(*) FROM orders WHERE created_by IN (
      SELECT id FROM user_profiles WHERE metadata->>'primary_location_id' = p_location_id::text
    ))) ELSE 0 END,
    'inventoryValue', inventory_value,
    'lowStockItems', low_stock_count
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unified_inventory_location_id ON inventory_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_unified_inventory_product_id ON inventory_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_id ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id);

-- Grant permissions
GRANT SELECT ON unified_inventory TO authenticated;
GRANT SELECT ON inventory_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_location_inventory(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_network_inventory_summary() TO authenticated;

-- Migration complete
SELECT 'Unified Inventory System Migration Complete' as status;
