
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  franchiseeId: string;
  franchiseeName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  notes?: string;
}

class OrdersService {
  private readonly ORDERS_KEY = 'franchise_orders';

  private getOrders(): Order[] {
    return JSON.parse(localStorage.getItem(this.ORDERS_KEY) || '[]');
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  createOrder(franchiseeId: string, franchiseeName: string, items: OrderItem[], notes?: string): Order {
    const orders = this.getOrders();
    
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      franchiseeId,
      franchiseeName,
      items: [...items],
      totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      orderDate: new Date().toISOString(),
      notes
    };

    orders.unshift(order); // Add to beginning of array
    this.saveOrders(orders);
    
    console.log('Order created:', order);
    return order;
  }

  getOrdersByFranchisee(franchiseeId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(order => order.franchiseeId === franchiseeId);
  }

  getAllOrders(): Order[] {
    return this.getOrders();
  }

  updateOrderStatus(orderId: string, status: Order['status']): boolean {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      this.saveOrders(orders);
      console.log(`Order ${orderId} status updated to ${status}`);
      return true;
    }
    
    return false;
  }

  getOrderById(orderId: string): Order | null {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId) || null;
  }
}

export const ordersService = new OrdersService();
