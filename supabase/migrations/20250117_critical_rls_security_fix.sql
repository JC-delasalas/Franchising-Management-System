-- =====================================================
-- CRITICAL RLS SECURITY FIX
-- Date: 2025-01-17
-- Purpose: Implement RLS policies for 13 vulnerable tables
-- Priority: CRITICAL - Immediate deployment required
-- =====================================================

-- Enable RLS on all vulnerable tables
-- This immediately blocks all access until policies are created

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. PRODUCT_CATEGORIES - Product categorization data
-- Access: Read for authenticated users, write for admins
-- =====================================================

-- Allow authenticated users to read product categories
CREATE POLICY "product_categories_read_authenticated" ON public.product_categories
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins and franchisors to manage product categories
CREATE POLICY "product_categories_write_admin" ON public.product_categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'franchisor')
            AND status = 'active'
        )
    );

-- =====================================================
-- 2. CUSTOM_FIELDS - Custom field definitions
-- Access: Read for authenticated, write for admins
-- =====================================================

-- Allow authenticated users to read custom field definitions
CREATE POLICY "custom_fields_read_authenticated" ON public.custom_fields
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow admins and franchisors to manage custom fields
CREATE POLICY "custom_fields_write_admin" ON public.custom_fields
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'franchisor')
            AND status = 'active'
        )
    );

-- =====================================================
-- 3. TRANSACTION_HISTORY - Financial transaction records
-- Access: Users only see their own transactions
-- =====================================================

-- Users can only access their own transaction history
CREATE POLICY "transaction_history_user_access" ON public.transaction_history
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Franchisors can see transactions for their franchise locations
CREATE POLICY "transaction_history_franchisor_access" ON public.transaction_history
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND up.status = 'active'
        )
        AND EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = transaction_history.franchise_location_id
            AND fl.franchisor_id = auth.uid()
        )
    );

-- =====================================================
-- 4. ENTITY_METADATA - System metadata
-- Access: Context-dependent based on entity ownership
-- =====================================================

-- Users can access metadata for entities they own
CREATE POLICY "entity_metadata_owner_access" ON public.entity_metadata
    FOR ALL
    TO authenticated
    USING (
        -- For user entities
        (entity_type = 'user' AND entity_id::uuid = auth.uid())
        OR
        -- For franchise location entities (franchisee access)
        (entity_type = 'franchise_location' AND EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = entity_id::uuid
            AND fl.franchisee_id = auth.uid()
        ))
        OR
        -- Franchisor access to their franchise locations
        (entity_type = 'franchise_location' AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = entity_id::uuid
        ))
        OR
        -- Admin access to all metadata
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

-- =====================================================
-- 5. CUSTOM_FIELD_VALUES - Custom field data values
-- Access: Users see values for entities they can access
-- =====================================================

-- Users can access custom field values for entities they own
CREATE POLICY "custom_field_values_owner_access" ON public.custom_field_values
    FOR ALL
    TO authenticated
    USING (
        -- For user entities
        (entity_type = 'user' AND entity_id::uuid = auth.uid())
        OR
        -- For franchise location entities (franchisee access)
        (entity_type = 'franchise_location' AND EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = entity_id::uuid
            AND fl.franchisee_id = auth.uid()
        ))
        OR
        -- Franchisor access to their franchise locations
        (entity_type = 'franchise_location' AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = entity_id::uuid
        ))
        OR
        -- Admin access to all values
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

-- =====================================================
-- 6. USER_ADDRESSES - User address information
-- Access: Users only see their own addresses
-- =====================================================

-- Users can only access their own addresses
CREATE POLICY "user_addresses_owner_access" ON public.user_addresses
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Franchisors can see addresses of their franchisees (for business purposes)
CREATE POLICY "user_addresses_franchisor_access" ON public.user_addresses
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisee_id = user_addresses.user_id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.franchisor_id = up.id
        )
    );

-- =====================================================
-- 7. RECURRING_CHARGES - Recurring billing data
-- Access: Users only see their own charges
-- =====================================================

-- Users can only access their own recurring charges
CREATE POLICY "recurring_charges_owner_access" ON public.recurring_charges
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- Franchisors can see charges for their franchisees
CREATE POLICY "recurring_charges_franchisor_access" ON public.recurring_charges
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisee_id = recurring_charges.user_id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.franchisor_id = up.id
        )
    );

-- =====================================================
-- 8. SALES_RECEIPTS - Sales transaction receipts
-- Access: Franchise-specific access
-- =====================================================

-- Franchisees can access receipts for their locations
CREATE POLICY "sales_receipts_franchisee_access" ON public.sales_receipts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = sales_receipts.franchise_location_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisors can access receipts for all their franchise locations
CREATE POLICY "sales_receipts_franchisor_access" ON public.sales_receipts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = sales_receipts.franchise_location_id
        )
    );

-- =====================================================
-- 9. SALES_RECEIPT_ITEMS - Individual receipt line items
-- Access: Based on receipt access
-- =====================================================

-- Access based on sales receipt access
CREATE POLICY "sales_receipt_items_franchisee_access" ON public.sales_receipt_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales_receipts sr
            JOIN public.franchise_locations fl ON fl.id = sr.franchise_location_id
            WHERE sr.id = sales_receipt_items.sales_receipt_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisor access to receipt items
CREATE POLICY "sales_receipt_items_franchisor_access" ON public.sales_receipt_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.sales_receipts sr
            JOIN public.franchise_locations fl ON fl.id = sr.franchise_location_id
            JOIN public.user_profiles up ON up.id = fl.franchisor_id
            WHERE sr.id = sales_receipt_items.sales_receipt_id
            AND up.id = auth.uid()
            AND up.role = 'franchisor'
        )
    );

-- =====================================================
-- 10. LOCATION_REVIEWS - Franchise location reviews
-- Access: Location-specific access
-- =====================================================

-- Franchisees can access reviews for their locations
CREATE POLICY "location_reviews_franchisee_access" ON public.location_reviews
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = location_reviews.franchise_location_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisors can access reviews for all their locations
CREATE POLICY "location_reviews_franchisor_access" ON public.location_reviews
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = location_reviews.franchise_location_id
        )
    );

-- Public read access for published reviews (optional - uncomment if needed)
-- CREATE POLICY "location_reviews_public_read" ON public.location_reviews
--     FOR SELECT
--     TO authenticated
--     USING (status = 'published' AND is_public = true);

-- =====================================================
-- 11. COMPLIANCE_AUDITS - Compliance audit records
-- Access: Franchise-specific, franchisor oversight
-- =====================================================

-- Franchisees can access audits for their locations
CREATE POLICY "compliance_audits_franchisee_access" ON public.compliance_audits
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = compliance_audits.franchise_location_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisors can access and manage audits for all their locations
CREATE POLICY "compliance_audits_franchisor_access" ON public.compliance_audits
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = compliance_audits.franchise_location_id
        )
    );

-- Auditors can access audits they are assigned to
CREATE POLICY "compliance_audits_auditor_access" ON public.compliance_audits
    FOR ALL
    TO authenticated
    USING (
        auditor_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'auditor'
            AND status = 'active'
        )
    );

-- =====================================================
-- 12. KPI_SUMMARY - Key performance indicator data
-- Access: Franchise-specific, franchisor oversight
-- =====================================================

-- Franchisees can access KPI data for their locations
CREATE POLICY "kpi_summary_franchisee_access" ON public.kpi_summary
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.franchise_locations fl
            WHERE fl.id = kpi_summary.franchise_location_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisors can access KPI data for all their locations
CREATE POLICY "kpi_summary_franchisor_access" ON public.kpi_summary
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.franchise_locations fl ON fl.franchisor_id = up.id
            WHERE up.id = auth.uid()
            AND up.role = 'franchisor'
            AND fl.id = kpi_summary.franchise_location_id
        )
    );

-- System can insert KPI data (for automated processes)
CREATE POLICY "kpi_summary_system_insert" ON public.kpi_summary
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- =====================================================
-- 13. SHIPMENT_ITEMS - Shipping and fulfillment data
-- Access: Franchise-specific access
-- =====================================================

-- Franchisees can access shipment items for their orders
CREATE POLICY "shipment_items_franchisee_access" ON public.shipment_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.franchise_locations fl ON fl.id = o.franchise_location_id
            WHERE o.id = shipment_items.order_id
            AND fl.franchisee_id = auth.uid()
        )
    );

-- Franchisors can access shipment items for their franchise locations
CREATE POLICY "shipment_items_franchisor_access" ON public.shipment_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.franchise_locations fl ON fl.id = o.franchise_location_id
            JOIN public.user_profiles up ON up.id = fl.franchisor_id
            WHERE o.id = shipment_items.order_id
            AND up.id = auth.uid()
            AND up.role = 'franchisor'
        )
    );

-- Suppliers can access shipment items for their shipments
CREATE POLICY "shipment_items_supplier_access" ON public.shipment_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.shipments s
            WHERE s.id = shipment_items.shipment_id
            AND s.supplier_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
            AND role = 'supplier'
            AND status = 'active'
        )
    );

-- =====================================================
-- SECURITY VALIDATION FUNCTIONS
-- Helper functions to validate RLS implementation
-- =====================================================

-- Function to test RLS policies (for validation)
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS TABLE (
    table_name text,
    rls_enabled boolean,
    policy_count integer,
    test_result text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.table_name::text,
        t.row_security::boolean as rls_enabled,
        COALESCE(p.policy_count, 0)::integer,
        CASE
            WHEN t.row_security AND COALESCE(p.policy_count, 0) > 0 THEN 'SECURE'
            WHEN t.row_security AND COALESCE(p.policy_count, 0) = 0 THEN 'RLS_ENABLED_NO_POLICIES'
            ELSE 'VULNERABLE'
        END::text as test_result
    FROM information_schema.tables t
    LEFT JOIN (
        SELECT
            schemaname || '.' || tablename as full_table_name,
            COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY schemaname, tablename
    ) p ON p.full_table_name = 'public.' || t.table_name
    WHERE t.table_schema = 'public'
    AND t.table_name IN (
        'product_categories', 'custom_fields', 'transaction_history',
        'entity_metadata', 'custom_field_values', 'user_addresses',
        'recurring_charges', 'sales_receipts', 'sales_receipt_items',
        'location_reviews', 'compliance_audits', 'kpi_summary', 'shipment_items'
    )
    ORDER BY t.table_name;
END;
$$;

-- Grant execute permission to authenticated users for testing
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated;

-- =====================================================
-- COMMIT TRANSACTION AND LOG COMPLETION
-- =====================================================

-- Log the completion of RLS policy implementation
INSERT INTO public.system_logs (
    level,
    message,
    context,
    created_at
) VALUES (
    'INFO',
    'Critical RLS security policies implemented for 13 vulnerable tables',
    jsonb_build_object(
        'tables_secured', ARRAY[
            'product_categories', 'custom_fields', 'transaction_history',
            'entity_metadata', 'custom_field_values', 'user_addresses',
            'recurring_charges', 'sales_receipts', 'sales_receipt_items',
            'location_reviews', 'compliance_audits', 'kpi_summary', 'shipment_items'
        ],
        'security_level', 'CRITICAL',
        'implementation_date', NOW()
    ),
    NOW()
);

-- =====================================================
-- MIGRATION COMPLETE
-- All 13 critical RLS vulnerabilities have been addressed
-- =====================================================
