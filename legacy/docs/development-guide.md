# FranchiseHub Development Guide

This guide provides comprehensive information for developers working on the FranchiseHub system, including coding standards, architecture patterns, and best practices.

## Table of Contents

1. [Development Environment](#development-environment)
2. [Architecture Overview](#architecture-overview)
3. [Coding Standards](#coding-standards)
4. [Component Patterns](#component-patterns)
5. [API Development](#api-development)
6. [Database Development](#database-development)
7. [Testing Guidelines](#testing-guidelines)
8. [Deployment Process](#deployment-process)

---

## Development Environment

### Required Tools

```bash
# Core development tools
Node.js 18+
npm 8+ (or yarn/pnpm)
Git
VS Code (recommended)

# Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

### Project Setup

```bash
# Clone and setup
git clone https://github.com/JC-delasalas/Franchising-Management-System.git
cd Franchising-Management-System
npm install

# Environment configuration
cp .env.example .env.local
# Configure Supabase credentials

# Start development
npm run dev
```

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
npm run type-check   # TypeScript validation
```

---

## Architecture Overview

### System Architecture

```
Frontend (React + TypeScript)
├── Components (UI Layer)
├── Pages (Route Components)
├── API Layer (Supabase Integration)
├── State Management (React Query)
└── Utilities (Helpers & Types)

Backend (Supabase)
├── Database (PostgreSQL)
├── Authentication (Supabase Auth)
├── Real-time (Subscriptions)
├── Storage (File Management)
└── Edge Functions (Server Logic)
```

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel

### Folder Structure

```
src/
├── api/                 # API integration layer
│   ├── addresses.ts     # Address management
│   ├── cart.ts         # Shopping cart operations
│   ├── orders.ts       # Order management
│   ├── paymentMethods.ts # Payment methods
│   ├── products.ts     # Product catalog
│   └── reorderTemplates.ts # Reorder templates
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn/ui base components
│   └── dashboard/     # Dashboard-specific components
├── pages/             # Route components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── types/             # TypeScript definitions
└── styles/            # Global styles
```

---

## Coding Standards

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
interface CreateOrderData {
  franchise_location_id: string;
  items: OrderItem[];
  payment_method_id?: string;
}

// Use proper error handling
async function createOrder(data: CreateOrderData): Promise<Order> {
  try {
    const result = await OrdersAPI.createOrder(data);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
}

// Use enums for constants
enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

### React Component Standards

```typescript
// Use functional components with TypeScript
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  isLoading?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  isLoading = false 
}) => {
  // Use React Query for data fetching
  const { data: cartItem } = useQuery({
    queryKey: ['cart-item', product.id],
    queryFn: () => CartAPI.getCartItemForProduct(product.id),
  });

  // Event handlers
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  // Render with proper error boundaries
  return (
    <Card className="h-full">
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
```

### CSS/Styling Standards

```typescript
// Use Tailwind CSS classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">
    {product.name}
  </h3>
  <Badge variant="secondary">
    {product.category}
  </Badge>
</div>

// Use CSS variables for custom properties
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
}

// Responsive design patterns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

---

## Component Patterns

### Page Components

```typescript
// Page component structure
const ProductCatalog: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ProductFilters>({});
  
  // Data fetching
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => ProductsAPI.getCatalogProducts(filters),
  });

  // Error handling
  if (error) {
    return <ErrorBoundary error={error} />;
  }

  // Loading states
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FilterSection filters={filters} onFiltersChange={setFilters} />
      <ProductGrid products={products} />
    </div>
  );
};
```

### Custom Hooks

```typescript
// Custom hook for cart management
export const useCart = () => {
  const queryClient = useQueryClient();

  const { data: cartSummary, isLoading } = useQuery({
    queryKey: ['cart-summary'],
    queryFn: CartAPI.getCartSummary,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      CartAPI.addToCart(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-summary'] });
      queryClient.invalidateQueries({ queryKey: ['cart-count'] });
    },
  });

  return {
    cartSummary,
    isLoading,
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
};
```

### Error Handling

```typescript
// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## API Development

### API Module Structure

```typescript
// API module template
export const ExampleAPI = {
  // Get all items
  async getItems(filters?: ItemFilters): Promise<Item[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    let query = supabase.from('items').select('*');
    
    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching items:', error);
      throw new Error(`Failed to fetch items: ${error.message}`);
    }

    return data || [];
  },

  // Create item
  async createItem(itemData: CreateItemData): Promise<Item> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('items')
      .insert({
        user_id: user.user.id,
        ...itemData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw new Error(`Failed to create item: ${error.message}`);
    }

    return data;
  },

  // Validation helper
  validateItemData(data: CreateItemData): string[] {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push('Name is required');
    }
    
    if (!data.category) {
      errors.push('Category is required');
    }
    
    return errors;
  },
};
```

### React Query Integration

```typescript
// Query hooks
export const useItems = (filters?: ItemFilters) => {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => ExampleAPI.getItems(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hooks
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ExampleAPI.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error) => {
      console.error('Failed to create item:', error);
    },
  });
};
```

---

## Database Development

### Schema Design Principles

```sql
-- Use consistent naming conventions
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add proper constraints
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Create performance indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### RLS Policy Patterns

```sql
-- User-specific data access
CREATE POLICY "Users can manage their own data" ON user_table
  FOR ALL USING (auth.uid() = user_id);

-- Role-based access
CREATE POLICY "Franchisors can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'franchisor'
    )
  );

-- Relationship-based access
CREATE POLICY "Franchisees can view their location orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM franchise_locations fl
      WHERE fl.id = franchise_location_id 
      AND fl.franchisee_id = auth.uid()
    )
  );
```

### Database Functions

```sql
-- Secure function template
CREATE OR REPLACE FUNCTION secure_function(param_value TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result TEXT;
BEGIN
  -- Validate input
  IF param_value IS NULL OR param_value = '' THEN
    RAISE EXCEPTION 'Invalid parameter value';
  END IF;
  
  -- Business logic
  result := 'processed_' || param_value;
  
  RETURN result;
END;
$$;
```

---

## Testing Guidelines

### Unit Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    category: 'Test Category',
  };

  const renderWithQuery = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders product information correctly', () => {
    renderWithQuery(
      <ProductCard product={mockProduct} onAddToCart={jest.fn()} />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₱100')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    
    renderWithQuery(
      <ProductCard product={mockProduct} onAddToCart={mockAddToCart} />
    );
    
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith('1');
  });
});
```

### API Testing

```typescript
// API testing
import { ExampleAPI } from './example';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() => ({ data: { user: { id: 'test-user' } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [{ id: '1', name: 'Test Item' }],
          error: null,
        })),
      })),
    })),
  },
}));

describe('ExampleAPI', () => {
  it('fetches items successfully', async () => {
    const items = await ExampleAPI.getItems();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Test Item');
  });
});
```

---

## Deployment Process

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop and test
npm run dev
npm run type-check
npm run lint

# 3. Commit changes
git add .
git commit -m "feat: Add new feature"

# 4. Push and create PR
git push origin feature/new-feature
# Create pull request on GitHub

# 5. After approval, merge to main
git checkout main
git pull origin main
```

### Production Deployment

```bash
# 1. Build and test
npm run build
npm run preview

# 2. Deploy to Vercel (automatic on main branch push)
# Or manual deployment:
vercel --prod

# 3. Database migrations (if needed)
# Run SQL scripts in Supabase dashboard

# 4. Monitor deployment
# Check Vercel dashboard and application logs
```

### Environment Management

```bash
# Development
VITE_APP_ENV=development
VITE_SUPABASE_URL=dev_url
VITE_SUPABASE_ANON_KEY=dev_key

# Production
VITE_APP_ENV=production
VITE_SUPABASE_URL=prod_url
VITE_SUPABASE_ANON_KEY=prod_key
```

This development guide provides the foundation for maintaining code quality and consistency across the FranchiseHub project. Follow these patterns and standards to ensure scalable, maintainable code.
