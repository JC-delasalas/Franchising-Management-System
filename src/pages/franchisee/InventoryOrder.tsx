
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { getCurrentUser } from '@/services/authService';
import { ordersService, OrderItem } from '@/services/ordersService';
import { cacheService } from '@/services/cacheService';
import { InventoryHeader } from '@/components/inventory/InventoryHeader';
import { InventorySearchFilter } from '@/components/inventory/InventorySearchFilter';
import { InventoryItemsList } from '@/components/inventory/InventoryItemsList';
import { ShoppingCart, CartItem } from '@/components/inventory/ShoppingCart';
import { RecentOrdersSection } from '@/components/inventory/RecentOrdersSection';
import { InventoryItem } from '@/components/inventory/InventoryItemCard';

const InventoryOrder = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentOrders, setRecentOrders] = useState(() => {
    const user = getCurrentUser();
    if (user) {
      const cachedOrders = cacheService.get(`orders_${user.id}`);
      if (cachedOrders) {
        return cachedOrders;
      }
      const orders = ordersService.getOrdersByFranchisee(user.id);
      cacheService.set(`orders_${user.id}`, orders);
      return orders.slice(0, 3); // Show only recent 3
    }
    return [];
  });

  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'Siomai Mix (500pcs)', currentStock: 45, unit: 'pcs', reorderLevel: 20, status: 'Good', price: 2500, category: 'Food' },
    { id: '2', name: 'Sauce Packets (100pcs)', currentStock: 12, unit: 'boxes', reorderLevel: 15, status: 'Low', price: 450, category: 'Condiments' },
    { id: '3', name: 'Disposable Containers (200pcs)', currentStock: 156, unit: 'pcs', reorderLevel: 50, status: 'Good', price: 1200, category: 'Packaging' },
    { id: '4', name: 'Paper Bags (50 bundles)', currentStock: 8, unit: 'bundles', reorderLevel: 10, status: 'Critical', price: 800, category: 'Packaging' },
    { id: '5', name: 'Chili Oil (1L)', currentStock: 5, unit: 'bottles', reorderLevel: 8, status: 'Critical', price: 350, category: 'Condiments' },
    { id: '6', name: 'Soy Sauce (500ml)', currentStock: 25, unit: 'bottles', reorderLevel: 12, status: 'Good', price: 180, category: 'Condiments' },
    { id: '7', name: 'Napkins (1000pcs)', currentStock: 3, unit: 'packs', reorderLevel: 5, status: 'Low', price: 250, category: 'Supplies' },
    { id: '8', name: 'Plastic Spoons (500pcs)', currentStock: 45, unit: 'packs', reorderLevel: 20, status: 'Good', price: 320, category: 'Supplies' }
  ];

  const categories = ['All', 'Food', 'Condiments', 'Packaging', 'Supplies'];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    const user = getCurrentUser();
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    const validationErrors = validateOrder();
    if (validationErrors.length > 0) {
      alert('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert cart items to order items
      const orderItems: OrderItem[] = cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      }));

      // Create the order
      const order = ordersService.createOrder(
        user.id,
        `${user.firstName} ${user.lastName}`,
        orderItems,
        orderNotes.trim() || undefined
      );

      // Clear cache and update recent orders
      cacheService.invalidate(`orders_${user.id}`);
      const updatedOrders = ordersService.getOrdersByFranchisee(user.id);
      cacheService.set(`orders_${user.id}`, updatedOrders);
      setRecentOrders(updatedOrders.slice(0, 3));

      // Clear form
      setCart([]);
      setOrderNotes('');

      alert(`✅ Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: ₱${order.totalAmount.toLocaleString()}\nItems: ${order.items.length}\n\nYour order is now being processed and will be delivered in 3-5 business days.`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
