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
import { useToast } from '@/hooks/use-toast';
import { PaymentMethodsAPI, CreatePaymentMethodData } from '@/api/paymentMethods';
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Trash2, 
  Edit,
  Star,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';

const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null);
  const [formData, setFormData] = useState<CreatePaymentMethodData>({
    type: 'bank_transfer',
    provider: '',
    provider_payment_method_id: '',
    is_default: false,
    metadata: {},
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading, refetch } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: PaymentMethodsAPI.getPaymentMethods,
  });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: PaymentMethodsAPI.createPaymentMethod,
    onSuccess: () => {
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update payment method mutation
  const updatePaymentMethodMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreatePaymentMethodData> }) =>
      PaymentMethodsAPI.updatePaymentMethod(id, updates),
    onSuccess: () => {
      toast({
        title: "Payment method updated",
        description: "Your payment method has been updated successfully.",
      });
      refetch();
      setIsEditDialogOpen(false);
      setEditingPaymentMethod(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: PaymentMethodsAPI.deletePaymentMethod,
    onSuccess: () => {
      toast({
        title: "Payment method deleted",
        description: "Your payment method has been deleted successfully.",
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: PaymentMethodsAPI.setDefaultPaymentMethod,
    onSuccess: () => {
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update default payment method. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      type: 'bank_transfer',
      provider: '',
      provider_payment_method_id: '',
      is_default: false,
      metadata: {},
    });
  };

  const handleAddPaymentMethod = () => {
    const errors = PaymentMethodsAPI.validatePaymentMethodData(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    addPaymentMethodMutation.mutate(formData);
  };

  const handleEditPaymentMethod = (paymentMethod: any) => {
    setEditingPaymentMethod(paymentMethod);
    setFormData({
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      provider_payment_method_id: paymentMethod.provider_payment_method_id,
      is_default: paymentMethod.is_default,
      metadata: paymentMethod.metadata || {},
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePaymentMethod = () => {
    if (!editingPaymentMethod) return;

    const errors = PaymentMethodsAPI.validatePaymentMethodData(formData);
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive",
      });
      return;
    }

    updatePaymentMethodMutation.mutate({
      id: editingPaymentMethod.id,
      updates: formData,
    });
  };

  const handleDeletePaymentMethod = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      deletePaymentMethodMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'gcash':
        return <Smartphone className="w-5 h-5" />;
      case 'cash_on_delivery':
        return <Banknote className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const renderPaymentMethodForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="type">Payment Type</Label>
        <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="gcash">GCash</SelectItem>
            <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="provider">Provider</Label>
        <Input
          id="provider"
          value={formData.provider}
          onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
          placeholder="e.g., BPI, BDO, GCash, etc."
        />
      </div>

      <div>
        <Label htmlFor="provider_payment_method_id">Provider Payment Method ID</Label>
        <Input
          id="provider_payment_method_id"
          value={formData.provider_payment_method_id}
          onChange={(e) => setFormData({ ...formData, provider_payment_method_id: e.target.value })}
          placeholder="Unique identifier from provider"
        />
      </div>

      <div>
        <Label htmlFor="nickname">Nickname (Optional)</Label>
        <Input
          id="nickname"
          value={formData.metadata?.nickname || ''}
          onChange={(e) => setFormData({ 
            ...formData, 
            metadata: { ...formData.metadata, nickname: e.target.value }
          })}
          placeholder="e.g., My Main Card, Business Account"
        />
      </div>

      {/* Type-specific fields */}
      {(formData.type === 'bank_transfer') && (
        <>
          <div>
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={formData.metadata?.bank_name || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, bank_name: e.target.value }
              })}
              placeholder="e.g., Bank of the Philippine Islands"
            />
          </div>
          <div>
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              value={formData.metadata?.account_number || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, account_number: e.target.value }
              })}
              placeholder="Your bank account number"
            />
          </div>
          <div>
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              value={formData.metadata?.account_holder_name || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, account_holder_name: e.target.value }
              })}
              placeholder="Name on the account"
            />
          </div>
        </>
      )}

      {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
        <>
          <div>
            <Label htmlFor="card_last_four">Last 4 Digits</Label>
            <Input
              id="card_last_four"
              value={formData.metadata?.card_last_four || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, card_last_four: e.target.value }
              })}
              placeholder="1234"
              maxLength={4}
            />
          </div>
          <div>
            <Label htmlFor="card_brand">Card Brand</Label>
            <Input
              id="card_brand"
              value={formData.metadata?.card_brand || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, card_brand: e.target.value }
              })}
              placeholder="e.g., Visa, Mastercard"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="card_expiry_month">Expiry Month</Label>
              <Input
                id="card_expiry_month"
                type="number"
                min="1"
                max="12"
                value={formData.metadata?.card_expiry_month || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metadata: { ...formData.metadata, card_expiry_month: parseInt(e.target.value) }
                })}
                placeholder="MM"
              />
            </div>
            <div>
              <Label htmlFor="card_expiry_year">Expiry Year</Label>
              <Input
                id="card_expiry_year"
                type="number"
                min={new Date().getFullYear()}
                value={formData.metadata?.card_expiry_year || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  metadata: { ...formData.metadata, card_expiry_year: parseInt(e.target.value) }
                })}
                placeholder="YYYY"
              />
            </div>
          </div>
        </>
      )}

      {formData.type === 'gcash' && (
        <>
          <div>
            <Label htmlFor="gcash_number">GCash Number</Label>
            <Input
              id="gcash_number"
              value={formData.metadata?.gcash_number || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, gcash_number: e.target.value }
              })}
              placeholder="09XXXXXXXXX"
            />
          </div>
          <div>
            <Label htmlFor="gcash_account_name">Account Name</Label>
            <Input
              id="gcash_account_name"
              value={formData.metadata?.gcash_account_name || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                metadata: { ...formData.metadata, gcash_account_name: e.target.value }
              })}
              placeholder="Name on GCash account"
            />
          </div>
        </>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => setFormData({ ...formData, is_default: !!checked })}
        />
        <Label htmlFor="is_default">Set as default payment method</Label>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p>Loading payment methods...</p>
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
              <h1 className="text-xl font-semibold ml-4">Payment Methods</h1>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                </DialogHeader>
                {renderPaymentMethodForm()}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={addPaymentMethodMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddPaymentMethod}
                    disabled={addPaymentMethodMutation.isPending}
                  >
                    {addPaymentMethodMutation.isPending ? 'Adding...' : 'Add Payment Method'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold mb-4">No payment methods</h2>
              <p className="text-gray-600 mb-6">
                Add a payment method to start placing orders.
              </p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  {renderPaymentMethodForm()}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={addPaymentMethodMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddPaymentMethod}
                      disabled={addPaymentMethodMutation.isPending}
                    >
                      {addPaymentMethodMutation.isPending ? 'Adding...' : 'Add Payment Method'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => {
              const display = PaymentMethodsAPI.getPaymentMethodDisplay(method);
              return (
                <Card key={method.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{display.title}</h3>
                            {method.is_default && (
                              <Badge variant="secondary" className="flex items-center">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{display.subtitle}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!method.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                            disabled={setDefaultMutation.isPending}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPaymentMethod(method)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          disabled={deletePaymentMethodMutation.isPending}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
          </DialogHeader>
          {renderPaymentMethodForm()}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPaymentMethod(null);
                resetForm();
              }}
              disabled={updatePaymentMethodMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePaymentMethod}
              disabled={updatePaymentMethodMutation.isPending}
            >
              {updatePaymentMethodMutation.isPending ? 'Updating...' : 'Update Payment Method'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
