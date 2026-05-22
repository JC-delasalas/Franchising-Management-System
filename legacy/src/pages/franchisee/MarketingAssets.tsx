import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import SEO from '@/components/SEO';
import { 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Palette,
  Search,
  ArrowLeft,
  Eye,
  Share2
} from 'lucide-react';

interface MarketingAsset {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'template';
  category: string;
  size: string;
  format: string;
  downloadCount: number;
  lastUpdated: string;
  thumbnail: string;
  description: string;
}

const MarketingAssets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const assets: MarketingAsset[] = [
    {
      id: '1',
      name: 'Siomai Shop Logo - High Resolution',
      type: 'image',
      category: 'Branding',
      size: '2.5 MB',
      format: 'PNG',
      downloadCount: 45,
      lastUpdated: '2024-01-10',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=300&q=80',
      description: 'Official logo in high resolution for print materials'
    },
    {
      id: '2',
      name: 'Menu Card Template',
      type: 'template',
      category: 'Menu',
      size: '1.8 MB',
      format: 'PSD',
      downloadCount: 32,
      lastUpdated: '2024-01-12',
      thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=300&q=80',
      description: 'Editable menu card template with current pricing'
    },
    {
      id: '3',
      name: 'Social Media Post Templates',
      type: 'template',
      category: 'Social Media',
      size: '5.2 MB',
      format: 'ZIP',
      downloadCount: 67,
      lastUpdated: '2024-01-08',
      thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=300&q=80',
      description: 'Instagram and Facebook post templates for promotions'
    },
    {
      id: '4',
      name: 'Brand Guidelines Document',
      type: 'document',
      category: 'Branding',
      size: '3.1 MB',
      format: 'PDF',
      downloadCount: 28,
      lastUpdated: '2024-01-05',
      thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=300&q=80',
      description: 'Complete brand guidelines and usage instructions'
    },
    {
      id: '5',
      name: 'Product Photography Pack',
      type: 'image',
      category: 'Product Photos',
      size: '12.8 MB',
      format: 'ZIP',
      downloadCount: 89,
      lastUpdated: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?auto=format&fit=crop&w=300&q=80',
      description: 'High-quality photos of all menu items'
    },
    {
      id: '6',
      name: 'Promotional Flyer Template',
      type: 'template',
      category: 'Promotions',
      size: '2.3 MB',
      format: 'AI',
      downloadCount: 41,
      lastUpdated: '2024-01-11',
      thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=300&q=80',
      description: 'Customizable flyer template for special offers'
    },
    {
      id: '7',
      name: 'Store Signage Designs',
      type: 'template',
      category: 'Signage',
      size: '8.7 MB',
      format: 'ZIP',
      downloadCount: 23,
      lastUpdated: '2024-01-09',
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
      description: 'Complete signage package for store setup'
    },
    {
      id: '8',
      name: 'Training Video - Customer Service',
      type: 'video',
      category: 'Training',
      size: '45.2 MB',
      format: 'MP4',
      downloadCount: 15,
      lastUpdated: '2024-01-07',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80',
      description: 'Customer service best practices training video'
    }
  ];

  const categories = ['All', 'Branding', 'Menu', 'Social Media', 'Product Photos', 'Promotions', 'Signage', 'Training'];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'template':
        return <Palette className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      image: 'bg-green-100 text-green-800',
      document: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      template: 'bg-orange-100 text-orange-800'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  const handleDownload = (asset: MarketingAsset) => {
    // Simulate download
    alert(`Downloading ${asset.name}...`);
  };

  const handlePreview = (asset: MarketingAsset) => {
    // Simulate preview
    alert(`Opening preview for ${asset.name}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Marketing Assets - Franchisee Dashboard"
        description="Access and download marketing materials for your franchise"
        noIndex={true}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" asChild>
              <Link to="/franchisee-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Assets</h1>
          <p className="text-gray-600">Download logos, templates, and promotional materials</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search marketing assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 overflow-hidden rounded-t-lg">
                <img 
                  src={asset.thumbnail} 
                  alt={asset.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(asset.type)}
                    {getTypeBadge(asset.type)}
                  </div>
                  <Badge variant="outline">{asset.format}</Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{asset.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asset.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{asset.size}</span>
                  <span>{asset.downloadCount} downloads</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handlePreview(asset)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleDownload(asset)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Tabs */}
        <Tabs defaultValue="popular" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>Most Downloaded Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets
                    .sort((a, b) => b.downloadCount - a.downloadCount)
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={asset.thumbnail} 
                            alt={asset.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-600">{asset.downloadCount} downloads</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleDownload(asset)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assets
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .slice(0, 5)
                    .map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={asset.thumbnail} 
                            alt={asset.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-600">
                              Added {new Date(asset.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleDownload(asset)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Design Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {assets
                    .filter(asset => asset.type === 'template')
                    .map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={asset.thumbnail} 
                            alt={asset.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{asset.name}</h4>
                            <p className="text-sm text-gray-600">{asset.format} • {asset.size}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handlePreview(asset)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" onClick={() => handleDownload(asset)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidelines">
            <Card>
              <CardHeader>
                <CardTitle>Brand Guidelines & Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Brand Usage Guidelines</h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Essential guidelines for maintaining brand consistency across all marketing materials.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download Guidelines
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Logo Usage Rules</h4>
                      <p className="text-sm text-gray-600 mb-3">Proper logo placement and sizing guidelines</p>
                      <Button size="sm" variant="outline">View Document</Button>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Color Palette</h4>
                      <p className="text-sm text-gray-600 mb-3">Official brand colors and usage instructions</p>
                      <Button size="sm" variant="outline">View Palette</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MarketingAssets;
