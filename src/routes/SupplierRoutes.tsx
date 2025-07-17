import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SupplierRouteGuard } from '../components/auth/SupplierRouteGuard';

// Supplier Management Components (lazy loaded)
const SuppliersListPage = React.lazy(() => import('../pages/suppliers/SuppliersListPage'));
const SupplierDetailsPage = React.lazy(() => import('../pages/suppliers/SupplierDetailsPage'));
const CreateSupplierPage = React.lazy(() => import('../pages/suppliers/CreateSupplierPage'));
const SupplierProductsPage = React.lazy(() => import('../pages/suppliers/SupplierProductsPage'));
const SupplierContractsPage = React.lazy(() => import('../pages/suppliers/SupplierContractsPage'));
const SupplierPerformancePage = React.lazy(() => import('../pages/suppliers/SupplierPerformancePage'));
const PurchaseOrdersPage = React.lazy(() => import('../pages/suppliers/PurchaseOrdersPage'));
const PurchaseOrderDetailsPage = React.lazy(() => import('../pages/suppliers/PurchaseOrderDetailsPage'));

/**
 * Supplier management routes with role-based access control
 * All routes are protected by SupplierRouteGuard
 */
export const SupplierRoutes: React.FC = () => {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <Routes>
        {/* Suppliers List - Read access required */}
        <Route
          path="/"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <SuppliersListPage />
            </SupplierRouteGuard>
          }
        />

        {/* Create Supplier - Write access required */}
        <Route
          path="/create"
          element={
            <SupplierRouteGuard requiredPermission="write">
              <CreateSupplierPage />
            </SupplierRouteGuard>
          }
        />

        {/* Supplier Details - Read access required */}
        <Route
          path="/:id"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <SupplierDetailsPage />
            </SupplierRouteGuard>
          }
        />

        {/* Supplier Products - Read access required */}
        <Route
          path="/products"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <SupplierProductsPage />
            </SupplierRouteGuard>
          }
        />

        {/* Supplier Contracts - Read access required */}
        <Route
          path="/contracts"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <SupplierContractsPage />
            </SupplierRouteGuard>
          }
        />

        {/* Supplier Performance - Read access required */}
        <Route
          path="/performance"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <SupplierPerformancePage />
            </SupplierRouteGuard>
          }
        />

        {/* Purchase Orders List - Read access required */}
        <Route
          path="/purchase-orders"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <PurchaseOrdersPage />
            </SupplierRouteGuard>
          }
        />

        {/* Purchase Order Details - Read access required */}
        <Route
          path="/purchase-orders/:id"
          element={
            <SupplierRouteGuard requiredPermission="read">
              <PurchaseOrderDetailsPage />
            </SupplierRouteGuard>
          }
        />
      </Routes>
    </React.Suspense>
  );
};

export default SupplierRoutes;
