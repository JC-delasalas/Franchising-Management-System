
import React, { useState, useMemo } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { inventoryService } from '@/services/inventoryService';
import { useInventoryData } from '@/hooks/useInventoryData';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventorySearchFilter } from '@/components/inventory/InventorySearchFilter';
import { InventoryItemsList } from '@/components/inventory/InventoryItemsList';
import { ShoppingCart, CartItem } from '@/components/inventory/ShoppingCart';
import { RecentOrdersSection } from '@/components/inventory/RecentOrdersSection';
import { InventoryItem } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InventoryOrder = () => {
  const { toast } = useToast();
  const { inventoryItems, recentOrders, isLoading, error, refetch } = useInventoryData();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized categories for performance
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(inventoryItems.map(item => item.category))];
    return ['All', ...uniqueCategories];
  }, [inventoryItems]);

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventoryItems, searchTerm, selectedCategory]);

  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const validateOrder = (): string[] => {
    const errors: string[] = [];
    
    if (cart.length === 0) {
      errors.push('Please add items to your cart');
    }
    
    cart.forEach(item => {
      if (item.quantity <= 0) {
        errors.push(`Invalid quantity for ${item.name}`);
      }
    });

    return errors;
  };

  const handleCheckout = async () => {
    const validationErrors = validateOrder();
    if (validationErrors.length > 0) {
      toast({
        title: "Order validation failed",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      }));

      const order = await inventoryService.createOrder(orderItems, orderNotes.trim() || undefined);

      // Clear form
      setCart([]);
      setOrderNotes('');

      // Refresh data
      await refetch();

      toast({
        title: "Order placed successfully!",
        description: `Order ${order.id} has been submitted for processing. Total: ₱${order.totalAmount.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Failed to place order",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Inventory Order - Franchisee Dashboard"
          description="Order inventory items and manage stock levels for your franchise"
          noIndex={true}
        />
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <InventoryHeader />
          
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-20 w-full" />
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Inventory Order - Franchisee Dashboard"
          description="Order inventory items and manage stock levels for your franchise"
          noIndex={true}
        />
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <InventoryHeader />
          
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load inventory data: {error}</span>
              <Button variant="outline" size="sm" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Inventory Order - Franchisee Dashboard"
        description="Order inventory items and manage stock levels for your franchise"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InventoryHeader />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Inventory Catalog */}
          <div className="lg:col-span-3">
            <InventorySearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
            />

            <InventoryItemsList
              items={filteredItems}
              onAddToCart={addToCart}
            />

            <RecentOrdersSection orders={recentOrders} />
          </div>

          {/* Shopping Cart */}
          <div>
            <ShoppingCart
              cart={cart}
              orderNotes={orderNotes}
              onOrderNotesChange={setOrderNotes}
              onUpdateQuantity={updateQuantity}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default InventoryOrder;
