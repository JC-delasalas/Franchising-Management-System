import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSupplierPermissions } from '@/components/auth/SupplierRouteGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Search,
  Filter,
  Truck,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  code: string;
  supplier_type: 'primary' | 'backup' | 'emergency' | 'specialty';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  lead_time_days: number;
  created_at: string;
  supplier_performance?: {
    overall_rating: number;
    on_time_delivery_rate: number;
  };
}

const SuppliersListPage: React.FC = () => {
  const { user } = useAuth();
  const { hasSupplierWrite } = useSupplierPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch suppliers data
  const { data: suppliers, isLoading, error, refetch } = useQuery({
    queryKey: ['suppliers', searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      // This would be replaced with actual API call
      const response = await fetch('/api/suppliers?' + new URLSearchParams({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        supplier_type: typeFilter !== 'all' ? typeFilter : ''
      }), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suppliers');
      }

      const data = await response.json();
      return data.suppliers || [];
    },
    staleTime: 30000,
    retry: 2
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'backup': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      case 'specialty': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load suppliers. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Truck className="h-8 w-8 mr-3 text-blue-600" />
              Supplier Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your supplier network and relationships
            </p>
          </div>
          
          {hasSupplierWrite && (
            <Button asChild>
              <Link to="/suppliers/create">
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="primary">Primary</option>
                  <option value="backup">Backup</option>
                  <option value="emergency">Emergency</option>
                  <option value="specialty">Specialty</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : suppliers?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first supplier.'}
              </p>
              {hasSupplierWrite && (
                <Button asChild>
                  <Link to="/suppliers/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Supplier
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers?.map((supplier: Supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {supplier.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">Code: {supplier.code}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(supplier.status)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(supplier.status)}>
                      {supplier.status}
                    </Badge>
                    <Badge className={getTypeColor(supplier.supplier_type)}>
                      {supplier.supplier_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{supplier.contact_email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{supplier.contact_phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{supplier.lead_time_days} days lead time</span>
                    </div>
                    
                    {supplier.supplier_performance && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span>{supplier.supplier_performance.overall_rating.toFixed(1)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {supplier.supplier_performance.on_time_delivery_rate.toFixed(0)}% on-time
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/suppliers/${supplier.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersListPage;
