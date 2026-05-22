import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AddressesAPI, CreateAddressData } from '@/api/addresses';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Trash2, 
  Edit,
  Star,
  Home,
  Building
} from 'lucide-react';

const AddressManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState<CreateAddressData>({
    address_type: 'both',
    recipient_name: '',
    company_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'Philippines',
    phone_number: '',
    delivery_instructions: '',
    nickname: '',
    is_default: false,
  });

  // Fetch addresses
  const { data: addresses = [], isLoading, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => AddressesAPI.getAddresses(),
  });

  // Get Philippine provinces
  const provinces = AddressesAPI.getPhilippineProvinces();

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: AddressesAPI.createAddress,
    onSuccess: () => {
      toast({
        title: "Address added",
        description: "Your address has been added successfully.",
      });
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateAddressData> }) =>
      AddressesAPI.updateAddress(id, updates),
    onSuccess: () => {
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
      refetch();
      setIsEditDialogOpen(false);
      setEditingAddress(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating address:', error);
      toast({
        title: "Error",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: AddressesAPI.deleteAddress,
    onSuccess: () => {
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set default address mutation
  const setDefaultMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'billing' | 'shipping' | 'both' }) =>
      AddressesAPI.setDefaultAddress(id, type),
    onSuccess: () => {
      toast({
        title: "Default address updated",
        description: "Your default address has been updated.",
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      address_type: 'both',
      recipient_name: '',
      company_name: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'Philippines',
      phone_number: '',
      delivery_instructions: '',
      nickname: '',
      is_default: false,
    });
  };

  const handleAddAddress = () => {
    const errors = AddressesAPI.validateAddressData(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    addAddressMutation.mutate(formData);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setFormData({
      address_type: address.address_type,
      recipient_name: address.recipient_name,
      company_name: address.company_name || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone_number: address.phone_number || '',
      delivery_instructions: address.delivery_instructions || '',
      nickname: address.nickname || '',
      is_default: address.is_default,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    const errors = AddressesAPI.validateAddressData(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    updateAddressMutation.mutate({
      id: editingAddress.id,
      updates: formData,
    });
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string, type: 'billing' | 'shipping' | 'both') => {
    setDefaultMutation.mutate({ id, type });
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'billing':
        return <Building className="w-5 h-5" />;
      case 'shipping':
        return <Home className="w-5 h-5" />;
      case 'both':
        return <MapPin className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const formatAddressType = (type: string) => {
    switch (type) {
      case 'billing':
        return 'Billing';
      case 'shipping':
        return 'Shipping';
      case 'both':
        return 'Billing & Shipping';
      default:
        return type;
    }
  };

  const renderAddressForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="address_type">Address Type</Label>
        <Select value={formData.address_type} onValueChange={(value: any) => setFormData({ ...formData, address_type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select address type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="billing">Billing Address</SelectItem>
            <SelectItem value="shipping">Shipping Address</SelectItem>
            <SelectItem value="both">Billing & Shipping</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipient_name">Recipient Name *</Label>
          <Input
            id="recipient_name"
            value={formData.recipient_name}
            onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            placeholder="Full name of recipient"
            required
          />
        </div>
        <div>
          <Label htmlFor="company_name">Company Name (Optional)</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="Company or business name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address_line_1">Address Line 1 *</Label>
        <Input
          id="address_line_1"
          value={formData.address_line_1}
          onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
          placeholder="Street address, building number"
          required
        />
      </div>

      <div>
        <Label htmlFor="address_line_2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line_2"
          value={formData.address_line_2}
          onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
          placeholder="Apartment, suite, unit, floor"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="City"
            required
          />
        </div>
        <div>
          <Label htmlFor="state_province">Province *</Label>
          <Select value={formData.state_province} onValueChange={(value) => setFormData({ ...formData, state_province: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(province => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="postal_code">Postal Code *</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder="1234"
            maxLength={4}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          value={formData.phone_number}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
          placeholder="+63 9XX XXX XXXX"
        />
      </div>

      <div>
        <Label htmlFor="delivery_instructions">Delivery Instructions (Optional)</Label>
        <Textarea
          id="delivery_instructions"
          value={formData.delivery_instructions}
          onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
          placeholder="Special delivery instructions, landmarks, etc."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="nickname">Nickname (Optional)</Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          placeholder="e.g., Home, Office, Warehouse"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => setFormData({ ...formData, is_default: !!checked })}
        />
        <Label htmlFor="is_default">Set as default address</Label>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/franchisee-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold ml-4">Address Management</h1>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Address</DialogTitle>
                </DialogHeader>
                {renderAddressForm()}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={addAddressMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddAddress}
                    disabled={addAddressMutation.isPending}
                  >
                    {addAddressMutation.isPending ? 'Adding...' : 'Add Address'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">No addresses</h2>
              <p className="text-gray-600 mb-6">
                Add an address to start placing orders.
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Address</DialogTitle>
                  </DialogHeader>
                  {renderAddressForm()}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={addAddressMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddAddress}
                      disabled={addAddressMutation.isPending}
                    >
                      {addAddressMutation.isPending ? 'Adding...' : 'Add Address'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => {
              const display = AddressesAPI.formatAddressDisplay(address);
              return (
                <Card key={address.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getAddressTypeIcon(address.address_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{display.title}</h3>
                            <Badge variant="outline">
                              {formatAddressType(address.address_type)}
                            </Badge>
                            {address.is_default && (
                              <Badge variant="secondary" className="flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{display.subtitle}</p>
                          {address.phone_number && (
                            <p className="text-sm text-gray-600">📞 {address.phone_number}</p>
                          )}
                          {address.delivery_instructions && (
                            <p className="text-sm text-gray-500 italic mt-2">
                              "{address.delivery_instructions}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!address.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(address.id, address.address_type as any)}
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={deleteAddressMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          {renderAddressForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingAddress(null);
                resetForm();
              }}
              disabled={updateAddressMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAddress}
              disabled={updateAddressMutation.isPending}
            >
              {updateAddressMutation.isPending ? 'Updating...' : 'Update Address'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressManagement;
