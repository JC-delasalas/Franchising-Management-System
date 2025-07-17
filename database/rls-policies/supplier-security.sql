-- =====================================================================
-- SUPPLIER MANAGEMENT ROW LEVEL SECURITY POLICIES
-- =====================================================================
-- These policies ensure only franchisors can access supplier data
-- while maintaining data isolation between organizations

-- Enable RLS on all supplier-related tables
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_communications ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- HELPER FUNCTIONS FOR RLS POLICIES
-- =====================================================================

-- Function to get user role from user_profiles
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM user_profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id(user_uuid uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = user_uuid 
      AND active = true 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is franchisor in organization
CREATE OR REPLACE FUNCTION is_franchisor_in_org(user_uuid uuid, org_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members om
    JOIN user_profiles up ON om.user_id = up.id
    WHERE om.user_id = user_uuid 
      AND om.organization_id = org_uuid
      AND om.active = true
      AND up.role = 'franchisor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin (for read-only access)
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM user_profiles 
    WHERE id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- SUPPLIERS TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view suppliers in their organization
CREATE POLICY "franchisors_can_view_suppliers" ON suppliers
  FOR SELECT
  USING (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- Policy: Admins can view suppliers (read-only support access)
CREATE POLICY "admins_can_view_suppliers" ON suppliers
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can insert suppliers in their organization
CREATE POLICY "franchisors_can_insert_suppliers" ON suppliers
  FOR INSERT
  WITH CHECK (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- Policy: Franchisors can update suppliers in their organization
CREATE POLICY "franchisors_can_update_suppliers" ON suppliers
  FOR UPDATE
  USING (
    is_franchisor_in_org(auth.uid(), organization_id)
  )
  WITH CHECK (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- Policy: Franchisors can delete suppliers in their organization
CREATE POLICY "franchisors_can_delete_suppliers" ON suppliers
  FOR DELETE
  USING (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- =====================================================================
-- SUPPLIER_PRODUCTS TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view supplier products in their organization
CREATE POLICY "franchisors_can_view_supplier_products" ON supplier_products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_products.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- Policy: Admins can view supplier products (read-only)
CREATE POLICY "admins_can_view_supplier_products" ON supplier_products
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can manage supplier products
CREATE POLICY "franchisors_can_manage_supplier_products" ON supplier_products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_products.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_products.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- =====================================================================
-- SUPPLIER_CONTRACTS TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view contracts in their organization
CREATE POLICY "franchisors_can_view_supplier_contracts" ON supplier_contracts
  FOR SELECT
  USING (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- Policy: Admins can view contracts (read-only)
CREATE POLICY "admins_can_view_supplier_contracts" ON supplier_contracts
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can manage contracts in their organization
CREATE POLICY "franchisors_can_manage_supplier_contracts" ON supplier_contracts
  FOR ALL
  USING (
    is_franchisor_in_org(auth.uid(), organization_id)
  )
  WITH CHECK (
    is_franchisor_in_org(auth.uid(), organization_id)
  );

-- =====================================================================
-- SUPPLIER_PERFORMANCE TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view performance data
CREATE POLICY "franchisors_can_view_supplier_performance" ON supplier_performance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_performance.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- Policy: Admins can view performance data (read-only)
CREATE POLICY "admins_can_view_supplier_performance" ON supplier_performance
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can manage performance data
CREATE POLICY "franchisors_can_manage_supplier_performance" ON supplier_performance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_performance.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_performance.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- =====================================================================
-- PURCHASE_ORDERS TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view all purchase orders in their organization
CREATE POLICY "franchisors_can_view_purchase_orders" ON purchase_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = purchase_orders.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- Policy: Franchisees can view their own location's purchase orders (but not supplier details)
CREATE POLICY "franchisees_can_view_own_purchase_orders" ON purchase_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM franchise_locations fl
      JOIN organization_members om ON om.organization_id = fl.organization_id
      WHERE fl.id = purchase_orders.franchise_location_id
        AND om.user_id = auth.uid()
        AND om.active = true
        AND EXISTS (
          SELECT 1 FROM user_profiles up 
          WHERE up.id = auth.uid() 
            AND up.role = 'franchisee'
        )
    )
  );

-- Policy: Admins can view purchase orders (read-only)
CREATE POLICY "admins_can_view_purchase_orders" ON purchase_orders
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can manage purchase orders
CREATE POLICY "franchisors_can_manage_purchase_orders" ON purchase_orders
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = purchase_orders.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = purchase_orders.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- =====================================================================
-- SUPPLIER_COMMUNICATIONS TABLE RLS POLICIES
-- =====================================================================

-- Policy: Franchisors can view communications
CREATE POLICY "franchisors_can_view_supplier_communications" ON supplier_communications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_communications.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- Policy: Admins can view communications (read-only)
CREATE POLICY "admins_can_view_supplier_communications" ON supplier_communications
  FOR SELECT
  USING (
    is_admin_user(auth.uid())
  );

-- Policy: Franchisors can manage communications
CREATE POLICY "franchisors_can_manage_supplier_communications" ON supplier_communications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_communications.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.id = supplier_communications.supplier_id 
        AND is_franchisor_in_org(auth.uid(), s.organization_id)
    )
  );

-- =====================================================================
-- AUDIT LOGGING TABLE (for supplier access tracking)
-- =====================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  method text,
  endpoint text,
  ip_address inet,
  user_agent text,
  user_role text,
  permission_requested text,
  success boolean DEFAULT true,
  error_message text,
  metadata jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own audit logs
CREATE POLICY "users_can_view_own_audit_logs" ON audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: System can insert audit logs
CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- =====================================================================
-- GRANT PERMISSIONS
-- =====================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON suppliers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_contracts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_performance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON purchase_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplier_communications TO authenticated;
GRANT SELECT, INSERT ON audit_logs TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
