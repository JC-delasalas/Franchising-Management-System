import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { 
  requireSupplierReadAccess, 
  requireSupplierWriteAccess,
  AuthenticatedRequest,
  getOrganizationFilter
} from '../middleware/supplierAuth';
import { Database } from '../types/database';

const router = express.Router();
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// SUPPLIERS ENDPOINTS
// =============================================================================

/**
 * GET /api/suppliers
 * List all suppliers for the organization (franchisor only)
 */
router.get('/', requireSupplierReadAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { page = 1, limit = 50, status, supplier_type } = req.query;
    
    let query = supabase
      .from('suppliers')
      .select(`
        id, name, code, supplier_type, status, contact_name, 
        contact_email, contact_phone, lead_time_days, created_at,
        supplier_performance!inner(overall_rating, on_time_delivery_rate)
      `)
      .eq('organization_id', orgFilter.organization_id)
      .order('name');

    // Apply filters
    if (status) query = query.eq('status', status);
    if (supplier_type) query = query.eq('supplier_type', supplier_type);

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: suppliers, error, count } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.json({
      suppliers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve suppliers'
    });
  }
});

/**
 * POST /api/suppliers
 * Create new supplier (franchisor only)
 */
router.post('/', requireSupplierWriteAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const supplierData = {
      ...req.body,
      organization_id: orgFilter.organization_id,
      created_by: req.user!.id
    };

    // Validate required fields
    const requiredFields = ['name', 'contact_email', 'supplier_type'];
    const missingFields = requiredFields.filter(field => !supplierData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.status(201).json({ supplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create supplier'
    });
  }
});

/**
 * GET /api/suppliers/:id
 * Get supplier details (franchisor and admin only)
 */
router.get('/:id', requireSupplierReadAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { id } = req.params;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select(`
        *, 
        supplier_products(*, products(name, sku)),
        supplier_contracts(*),
        supplier_performance(*),
        purchase_orders(id, po_number, status, total_amount, order_date)
      `)
      .eq('id', id)
      .eq('organization_id', orgFilter.organization_id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Supplier not found',
        message: 'Supplier not found or access denied'
      });
    }

    res.json({ supplier });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve supplier'
    });
  }
});

/**
 * PUT /api/suppliers/:id
 * Update supplier (franchisor only)
 */
router.put('/:id', requireSupplierWriteAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', orgFilter.organization_id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found',
        message: 'Supplier not found or access denied'
      });
    }

    res.json({ supplier });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update supplier'
    });
  }
});

// =============================================================================
// SUPPLIER PRODUCTS ENDPOINTS
// =============================================================================

/**
 * GET /api/suppliers/:supplierId/products
 * Get products for a specific supplier
 */
router.get('/:supplierId/products', requireSupplierReadAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { supplierId } = req.params;

    // Verify supplier belongs to organization
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplierId)
      .eq('organization_id', orgFilter.organization_id)
      .single();

    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found',
        message: 'Supplier not found or access denied'
      });
    }

    const { data: supplierProducts, error } = await supabase
      .from('supplier_products')
      .select(`
        *, 
        products(id, name, sku, category),
        suppliers(name, code)
      `)
      .eq('supplier_id', supplierId)
      .eq('active', true)
      .order('priority_rank');

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.json({ supplierProducts });
  } catch (error) {
    console.error('Get supplier products error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve supplier products'
    });
  }
});

/**
 * POST /api/suppliers/:supplierId/products
 * Add product to supplier catalog
 */
router.post('/:supplierId/products', requireSupplierWriteAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { supplierId } = req.params;

    // Verify supplier belongs to organization
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', supplierId)
      .eq('organization_id', orgFilter.organization_id)
      .single();

    if (!supplier) {
      return res.status(404).json({
        error: 'Supplier not found',
        message: 'Supplier not found or access denied'
      });
    }

    const supplierProductData = {
      ...req.body,
      supplier_id: supplierId,
      created_by: req.user!.id
    };

    const { data: supplierProduct, error } = await supabase
      .from('supplier_products')
      .insert(supplierProductData)
      .select(`
        *, 
        products(name, sku),
        suppliers(name)
      `)
      .single();

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.status(201).json({ supplierProduct });
  } catch (error) {
    console.error('Add supplier product error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add product to supplier'
    });
  }
});

// =============================================================================
// PURCHASE ORDERS ENDPOINTS
// =============================================================================

/**
 * GET /api/purchase-orders
 * List purchase orders (franchisor and admin only)
 */
router.get('/purchase-orders', requireSupplierReadAccess, async (req: AuthenticatedRequest, res) => {
  try {
    const orgFilter = getOrganizationFilter(req);
    const { status, supplier_id, location_id, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('purchase_orders')
      .select(`
        *, 
        suppliers(name, contact_email),
        franchise_locations(name),
        orders(order_number)
      `)
      .eq('organization_id', orgFilter.organization_id)
      .order('order_date', { ascending: false });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (supplier_id) query = query.eq('supplier_id', supplier_id);
    if (location_id) query = query.eq('franchise_location_id', location_id);

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit);
    query = query.range(offset, offset + Number(limit) - 1);

    const { data: purchaseOrders, error, count } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Database error',
        message: error.message
      });
    }

    res.json({
      purchaseOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve purchase orders'
    });
  }
});

export default router;
