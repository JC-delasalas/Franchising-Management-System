import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/DataTable';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Copy, 
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { 
  useBrands, 
  useProducts, 
  useProductCategories, 
  useCreateProduct, 
  useUpdateProduct,
  useProductAnalytics
} from '@/hooks/useDatabase';

export const ProductManagement: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const { data: brands } = useBrands();
  const { data: products } = useProducts(selectedBrand);
  const { data: categories } = useProductCategories(selectedBrand);
  const { data: analytics } = useProductAnalytics(selectedBrand);
  
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [newProduct, setNewProduct] = useState({
    brand_id: '',
    category_id: '',
    product_nm: '',
    description: '',
    unit_price: 0,
    cost_price: 0,
    sku: '',
    specifications: {},
  });

  const handleCreateProduct = async () => {
    if (!selectedBrand) return;
    
    try {
      await createProductMutation.mutateAsync({
        ...newProduct,
        brand_id: selectedBrand,
      });
      setIsCreateDialogOpen(false);
      setNewProduct({
        brand_id: '',
        category_id: '',
        product_nm: '',
        description: '',
        unit_price: 0,
        cost_price: 0,
        sku: '',
        specifications: {},
      });
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const productColumns = [
    {
      accessorKey: 'product_nm',
      header: 'Product Name',
    },
    {
      accessorKey: 'category.category_nm',
      header: 'Category',
      cell: ({ row }: any) => {
        const category = row.original.category;
        return category ? (
          <Badge variant="outline">{category.category_nm}</Badge>
        ) : (
          <span className="text-muted-foreground">Uncategorized</span>
        );
      },
    },
    {
      accessorKey: 'unit_price',
      header: 'Price',
      cell: ({ row }: any) => {
        const price = row.getValue('unit_price');
        return <span>${price}</span>;
      },
    },
    {
      accessorKey: 'cost_price',
      header: 'Cost',
      cell: ({ row }: any) => {
        const cost = row.getValue('cost_price');
        const price = row.original.unit_price;
        const margin = cost && price ? ((price - cost) / price * 100).toFixed(1) : 0;
        return (
          <div>
            <div>${cost || 0}</div>
            <div className="text-xs text-muted-foreground">{margin}% margin</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }: any) => {
        const isActive = row.getValue('is_active');
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground">
            Manage products across all your franchise brands
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands?.data?.map((brand) => (
                <SelectItem key={brand.brand_id} value={brand.brand_id}>
                  {brand.brand_nm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedBrand}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your selected brand catalog
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product_nm">Product Name</Label>
                    <Input
                      id="product_nm"
                      value={newProduct.product_nm}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, product_nm: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newProduct.category_id} 
                      onValueChange={(value) => setNewProduct(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.data?.map((category) => (
                          <SelectItem key={category.category_id} value={category.category_id}>
                            {category.category_nm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="unit_price">Unit Price ($)</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      step="0.01"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, unit_price: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_price">Cost Price ($)</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      value={newProduct.cost_price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, cost_price: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU (Optional)</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedBrand ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.data?.total_products || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.data?.active_products || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.data?.average_price?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Range: ${analytics?.data?.price_range?.min || 0} - ${analytics?.data?.price_range?.max || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.data?.categories_count || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Product categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {analytics?.data?.low_stock_products?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Manage your product catalog for {brands?.data?.find(b => b.brand_id === selectedBrand)?.brand_nm}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={productColumns}
                  data={products?.data || []}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                  Organize your products into categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Category management interface coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Product Analytics</CardTitle>
                <CardDescription>
                  Analyze product performance and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Product analytics dashboard coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>
                  Import, export, and bulk edit products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="outline" className="h-24 flex-col">
                    <Upload className="h-6 w-6 mb-2" />
                    Import Products
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Products
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Edit className="h-6 w-6 mb-2" />
                    Bulk Edit Prices
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Select a Brand</h3>
            <p className="text-muted-foreground">
              Choose a brand from the dropdown above to manage its products
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
