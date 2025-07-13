import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, TrendingUp } from 'lucide-react';
import { BrandService } from '@/services/franchise';
import { useToast } from '@/hooks/use-toast';

interface Brand {
  brand_id: string;
  brand_nm: string;
  tagline?: string;
  details?: string;
  logo_url?: string;
  metadata?: Record<string, any>;
  marketing_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface BrandManagementProps {
  franchisorId: string;
}

export function BrandManagement({ franchisorId }: BrandManagementProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    brand_nm: '',
    tagline: '',
    details: '',
    logo_url: '',
    target_demographic: '',
    price_point: '',
    brand_colors: '',
    fonts: ''
  });

  useEffect(() => {
    loadBrands();
  }, [franchisorId]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const result = await BrandService.getBrands(franchisorId);
      
      if (result.success) {
        setBrands(result.data || []);
      } else {
        toast({
          title: "Error loading brands",
          description: result.error?.message || "Failed to load brands",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const brandData = {
        brand_nm: formData.brand_nm,
        tagline: formData.tagline || undefined,
        details: formData.details || undefined,
        logo_url: formData.logo_url || undefined,
        metadata: {
          target_demographic: formData.target_demographic,
          price_point: formData.price_point,
          created_via: 'brand_management_ui'
        },
        marketing_data: {
          brand_colors: formData.brand_colors ? formData.brand_colors.split(',').map(c => c.trim()) : [],
          fonts: formData.fonts ? formData.fonts.split(',').map(f => f.trim()) : []
        }
      };

      let result;
      if (editingBrand) {
        result = await BrandService.updateBrand(editingBrand.brand_id, brandData);
      } else {
        result = await BrandService.createBrand(franchisorId, brandData);
      }

      if (result.success) {
        toast({
          title: editingBrand ? "Brand updated" : "Brand created",
          description: `${formData.brand_nm} has been ${editingBrand ? 'updated' : 'created'} successfully`
        });
        
        resetForm();
        loadBrands();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to save brand",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      brand_nm: brand.brand_nm,
      tagline: brand.tagline || '',
      details: brand.details || '',
      logo_url: brand.logo_url || '',
      target_demographic: brand.metadata?.target_demographic || '',
      price_point: brand.metadata?.price_point || '',
      brand_colors: brand.marketing_data?.brand_colors?.join(', ') || '',
      fonts: brand.marketing_data?.fonts?.join(', ') || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Are you sure you want to delete ${brand.brand_nm}?`)) {
      return;
    }

    try {
      const result = await BrandService.deleteBrand(brand.brand_id);
      
      if (result.success) {
        toast({
          title: "Brand deleted",
          description: `${brand.brand_nm} has been deleted successfully`
        });
        loadBrands();
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to delete brand",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      brand_nm: '',
      tagline: '',
      details: '',
      logo_url: '',
      target_demographic: '',
      price_point: '',
      brand_colors: '',
      fonts: ''
    });
    setEditingBrand(null);
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Brand Management</h2>
          <p className="text-muted-foreground">Manage your franchise brands and their properties</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Brand
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</CardTitle>
            <CardDescription>
              {editingBrand ? 'Update brand information' : 'Add a new brand to your franchise portfolio'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand_nm">Brand Name *</Label>
                  <Input
                    id="brand_nm"
                    value={formData.brand_nm}
                    onChange={(e) => setFormData({ ...formData, brand_nm: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Your brand's tagline"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="details">Description</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  placeholder="Describe your brand..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_demographic">Target Demographic</Label>
                  <Input
                    id="target_demographic"
                    value={formData.target_demographic}
                    onChange={(e) => setFormData({ ...formData, target_demographic: e.target.value })}
                    placeholder="e.g., urban professionals"
                  />
                </div>
                <div>
                  <Label htmlFor="price_point">Price Point</Label>
                  <Input
                    id="price_point"
                    value={formData.price_point}
                    onChange={(e) => setFormData({ ...formData, price_point: e.target.value })}
                    placeholder="e.g., premium, mid-range, budget"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand_colors">Brand Colors</Label>
                  <Input
                    id="brand_colors"
                    value={formData.brand_colors}
                    onChange={(e) => setFormData({ ...formData, brand_colors: e.target.value })}
                    placeholder="e.g., #FF0000, #00FF00, #0000FF"
                  />
                </div>
                <div>
                  <Label htmlFor="fonts">Brand Fonts</Label>
                  <Input
                    id="fonts"
                    value={formData.fonts}
                    onChange={(e) => setFormData({ ...formData, fonts: e.target.value })}
                    placeholder="e.g., Roboto, Open Sans"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brands.map((brand) => (
          <Card key={brand.brand_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{brand.brand_nm}</CardTitle>
                  {brand.tagline && (
                    <CardDescription className="mt-1">{brand.tagline}</CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(brand)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(brand)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {brand.details && (
                <p className="text-sm text-muted-foreground mb-3">{brand.details}</p>
              )}
              
              <div className="space-y-2">
                {brand.metadata?.target_demographic && (
                  <Badge variant="secondary">{brand.metadata.target_demographic}</Badge>
                )}
                {brand.metadata?.price_point && (
                  <Badge variant="outline">{brand.metadata.price_point}</Badge>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Analytics</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created {new Date(brand.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {brands.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first brand to start managing your franchise portfolio
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Brand
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
