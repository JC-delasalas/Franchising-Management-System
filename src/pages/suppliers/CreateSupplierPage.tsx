import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Truck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SupplierFormData {
  name: string;
  code: string;
  description: string;
  supplier_type: 'primary' | 'backup' | 'emergency' | 'specialty';
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  lead_time_days: number;
  minimum_order_amount: number;
}

const CreateSupplierPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    code: '',
    description: '',
    supplier_type: 'primary',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'Philippines'
    },
    lead_time_days: 7,
    minimum_order_amount: 0
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create supplier');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Supplier Created",
        description: `${formData.name} has been successfully added to your supplier network.`,
        variant: "default",
      });
      
      // Invalidate suppliers query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      
      // Navigate to the new supplier's detail page
      navigate(`/suppliers/${data.supplier.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Supplier code is required';
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Contact phone is required';
    }

    if (formData.lead_time_days < 1) {
      newErrors.lead_time_days = 'Lead time must be at least 1 day';
    }

    if (formData.minimum_order_amount < 0) {
      newErrors.minimum_order_amount = 'Minimum order amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      createSupplierMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/suppliers')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Truck className="h-8 w-8 mr-3 text-blue-600" />
              Add New Supplier
            </h1>
            <p className="text-gray-600 mt-1">
              Create a new supplier profile for your network
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter supplier name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="code">Supplier Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g., SUP001"
                    className={errors.code ? 'border-red-500' : ''}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 mt-1">{errors.code}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="supplier_type">Supplier Type</Label>
                <select
                  id="supplier_type"
                  value={formData.supplier_type}
                  onChange={(e) => handleInputChange('supplier_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="primary">Primary</option>
                  <option value="backup">Backup</option>
                  <option value="emergency">Emergency</option>
                  <option value="specialty">Specialty</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the supplier"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Person *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => handleInputChange('contact_name', e.target.value)}
                    placeholder="Primary contact name"
                    className={errors.contact_name ? 'border-red-500' : ''}
                  />
                  {errors.contact_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact_name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="contact_email">Email Address *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="contact@supplier.com"
                    className={errors.contact_email ? 'border-red-500' : ''}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact_email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Phone Number *</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+63 XXX XXX XXXX"
                    className={errors.contact_phone ? 'border-red-500' : ''}
                  />
                  {errors.contact_phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.contact_phone}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://supplier.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Business Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lead_time_days">Lead Time (Days) *</Label>
                  <Input
                    id="lead_time_days"
                    type="number"
                    min="1"
                    value={formData.lead_time_days}
                    onChange={(e) => handleInputChange('lead_time_days', parseInt(e.target.value) || 1)}
                    className={errors.lead_time_days ? 'border-red-500' : ''}
                  />
                  {errors.lead_time_days && (
                    <p className="text-sm text-red-600 mt-1">{errors.lead_time_days}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="minimum_order_amount">Minimum Order Amount (₱)</Label>
                  <Input
                    id="minimum_order_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_order_amount}
                    onChange={(e) => handleInputChange('minimum_order_amount', parseFloat(e.target.value) || 0)}
                    className={errors.minimum_order_amount ? 'border-red-500' : ''}
                  />
                  {errors.minimum_order_amount && (
                    <p className="text-sm text-red-600 mt-1">{errors.minimum_order_amount}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/suppliers')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSupplierMutation.isPending}
              className="min-w-[120px]"
            >
              {createSupplierMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Supplier
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplierPage;
