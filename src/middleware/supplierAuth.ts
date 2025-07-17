import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'franchisor' | 'franchisee' | 'admin' | 'user';
    organizationId?: string;
  };
}

/**
 * Middleware to enforce supplier management access control
 * Only franchisors have full access, admins have read-only access
 */
export const requireSupplierAccess = (requiredPermission: 'read' | 'write' = 'read') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Extract user from JWT token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Access token is required for supplier management'
        });
      }

      // Verify token and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return res.status(401).json({
          error: 'Invalid authentication',
          code: 'AUTH_INVALID',
          message: 'Invalid or expired access token'
        });
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, role, email, full_name')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(403).json({
          error: 'User profile not found',
          code: 'PROFILE_NOT_FOUND',
          message: 'User profile is required for supplier access'
        });
      }

      // Check role-based permissions
      const userRole = profile.role as 'franchisor' | 'franchisee' | 'admin' | 'user';
      
      // Log access attempt for audit trail
      await logSupplierAccess(req, profile.id, userRole, requiredPermission);

      // Permission matrix for supplier management
      const permissions = {
        franchisor: { read: true, write: true },
        admin: { read: true, write: false },
        franchisee: { read: false, write: false },
        user: { read: false, write: false }
      };

      const userPermissions = permissions[userRole];
      const hasPermission = requiredPermission === 'read' 
        ? userPermissions.read 
        : userPermissions.write;

      if (!hasPermission) {
        // Return role-specific error messages
        const errorMessages = {
          franchisee: 'Franchisees cannot access supplier management. Contact your franchisor for supplier-related inquiries.',
          user: 'Staff users do not have access to supplier management functionality.',
          admin: requiredPermission === 'write' 
            ? 'Administrators have read-only access to supplier information.'
            : 'Access denied to supplier information.'
        };

        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'SUPPLIER_ACCESS_DENIED',
          message: errorMessages[userRole] || 'Access denied to supplier management',
          userRole,
          requiredPermission,
          availablePermissions: userPermissions
        });
      }

      // Get organization membership for data filtering
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id, role as org_role')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      // Attach user info to request
      req.user = {
        id: user.id,
        email: profile.email,
        role: userRole,
        organizationId: membership?.organization_id
      };

      next();
    } catch (error) {
      console.error('Supplier auth middleware error:', error);
      return res.status(500).json({
        error: 'Authentication error',
        code: 'AUTH_ERROR',
        message: 'Internal authentication error'
      });
    }
  };
};

/**
 * Middleware specifically for supplier write operations
 */
export const requireSupplierWriteAccess = requireSupplierAccess('write');

/**
 * Middleware specifically for supplier read operations
 */
export const requireSupplierReadAccess = requireSupplierAccess('read');

/**
 * Log supplier access attempts for audit trail
 */
async function logSupplierAccess(
  req: Request, 
  userId: string, 
  userRole: string, 
  permission: string
) {
  try {
    const auditLog = {
      user_id: userId,
      action: `supplier_${permission}_access`,
      resource_type: 'supplier_management',
      resource_id: req.params.id || null,
      method: req.method,
      endpoint: req.path,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      user_role: userRole,
      permission_requested: permission,
      timestamp: new Date().toISOString(),
      success: true // Will be updated if access is denied
    };

    // Insert audit log (assuming we have an audit_logs table)
    await supabase.from('audit_logs').insert(auditLog);
  } catch (error) {
    console.error('Failed to log supplier access:', error);
    // Don't fail the request if logging fails
  }
}

/**
 * Helper function to check if user has franchisor role
 */
export const isFranchisor = (req: AuthenticatedRequest): boolean => {
  return req.user?.role === 'franchisor';
};

/**
 * Helper function to check if user has admin role
 */
export const isAdmin = (req: AuthenticatedRequest): boolean => {
  return req.user?.role === 'admin';
};

/**
 * Helper function to get organization-filtered query conditions
 */
export const getOrganizationFilter = (req: AuthenticatedRequest) => {
  if (!req.user?.organizationId) {
    throw new Error('Organization context required for supplier access');
  }
  return { organization_id: req.user.organizationId };
};
