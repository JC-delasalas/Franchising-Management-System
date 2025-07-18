import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSupplierPermissions } from '@/components/auth/SupplierRouteGuard';
import { ProductsAPI, ProductCatalogItem } from '@/api/products';
import { CartAPI } from '@/api/cart';
import { queryKeys } from '@/lib/queryClient';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowLeft,
  Grid3X3,
  List,
  Star,
  Package
} from 'lucide-react';

const ProductCatalog: React.FC = () => {
  const { user } = useAuth();
  const { hasSupplierRead } = useSupplierPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartItems, setCartItems] = useState<Map<string, number>>(new Map());
  
  const { toast } = useToast();

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['catalog-products', searchTerm, selectedCategory, selectedBrand, priceRange],
    queryFn: () => ProductsAPI.getCatalogProducts({
      search: searchTerm || undefined,
      category: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
      brand: selectedBrand && selectedBrand !== 'all' ? selectedBrand : undefined,
      min_price: priceRange.min ? parseFloat(priceRange.min) : undefined,
      max_price: priceRange.max ? parseFloat(priceRange.max) : undefined,
    }),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories'],
    queryFn: ProductsAPI.getCategories,
  });

  // Fetch brands
  const { data: brands = [] } = useQuery({
    queryKey: ['product-brands'],
    queryFn: ProductsAPI.getBrands,
  });

  // Get cart count with optimized configuration
  const { data: cartCount = 0 } = useQuery({
    queryKey: queryKeys.cart.count,
    queryFn: CartAPI.getCartItemCount,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Authentication failed') || error?.message?.includes('not authenticated')) {
        return false;
      }
      return failureCount < 1; // Reduced retries
    },
    retryDelay: 500,
    staleTime: 15 * 1000, // 15 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    throwOnError: false,
    // Prevent background refetching to reduce conflicts with cart summary
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Initialize cart items from products
  useEffect(() => {
    const cartMap = new Map();
    products.forEach(product => {
      if (product.in_cart && product.cart_quantity) {
        cartMap.set(product.id, product.cart_quantity);
      }
    });
    setCartItems(cartMap);
  }, [products]);

  const handleAddToCart = async (product: ProductCatalogItem) => {
    try {
      const currentQuantity = cartItems.get(product.id) || 0;
      const newQuantity = currentQuantity + 1;

      // Check maximum order quantity
      if (product.maximum_order_qty && newQuantity > product.maximum_order_qty) {
        toast({
          title: "Maximum quantity reached",
          description: `You can only order up to ${product.maximum_order_qty} ${product.unit_of_measure} of this product.`,
          variant: "destructive",
        });
        return;
      }

      await CartAPI.addToCart(product.id, 1);
      setCartItems(prev => new Map(prev.set(product.id, newQuantity)));
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });

      // Refresh cart count
      refetch();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (product: ProductCatalogItem, newQuantity: number) => {
    try {
      const cartItem = await CartAPI.getCartItemForProduct(product.id);
      if (!cartItem) return;

      if (newQuantity <= 0) {
        await CartAPI.removeFromCart(cartItem.id);
        setCartItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(product.id);
          return newMap;
        });
        toast({
          title: "Removed from cart",
          description: `${product.name} has been removed from your cart.`,
        });
      } else {
        // Check maximum order quantity
        if (product.maximum_order_qty && newQuantity > product.maximum_order_qty) {
          toast({
            title: "Maximum quantity reached",
            description: `You can only order up to ${product.maximum_order_qty} ${product.unit_of_measure} of this product.`,
            variant: "destructive",
          });
          return;
        }

        await CartAPI.updateCartItemQuantity(cartItem.id, newQuantity);
        setCartItems(prev => new Map(prev.set(product.id, newQuantity)));
      }

      // Refresh cart count
      refetch();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
  };

  const ProductCard: React.FC<{ product: ProductCatalogItem }> = ({ product }) => {
    const quantity = cartItems.get(product.id) || 0;
    const isInCart = quantity > 0;

    return (
      <Card className="h-full flex flex-col">
        <CardContent className="p-4 flex-1">
          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              <Badge variant="secondary" className="text-xs ml-2">
                {product.category}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg text-green-600">₱{product.price?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">per {product.unit_of_measure}</p>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Min: {product.minimum_order_qty}</p>
                {product.maximum_order_qty && (
                  <p>Max: {product.maximum_order_qty}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        
        <div className="p-4 pt-0">
          {isInCart ? (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(product, quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="mx-3 font-semibold">{quantity}</span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateQuantity(product, quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => handleAddToCart(product)}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/franchisee-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Product Catalog</h1>
            </div>
            
            <Link to="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Franchisee Notice */}
        {user?.role === 'franchisee' && !hasSupplierRead && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Package className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Approved Product Catalog</div>
                <div>
                  All products shown are pre-approved by your franchisor and sourced from
                  verified suppliers. You can place orders without needing to manage supplier
                  relationships directly.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Min Price"
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              />
              
              <Input
                placeholder="Max Price"
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="aspect-square mb-3" />
                  <Skeleton className="h-4 mb-2" />
                  <Skeleton className="h-3 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search terms.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
