
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading';
import { Image, Download } from 'lucide-react';

const brands = [
  { id: 'FoodCorp', name: 'FoodCorp', color: 'from-orange-500 to-red-600' },
  { id: 'RetailPlus', name: 'RetailPlus', color: 'from-blue-500 to-purple-600' },
  { id: 'ServiceMax', name: 'ServiceMax', color: 'from-green-500 to-teal-600' },
  { id: 'TechFlow', name: 'TechFlow', color: 'from-purple-500 to-pink-600' }
];

const BrandImageGenerator = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generateBrandImage = async (brandName: string) => {
    setLoading(brandName);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-brand-images', {
        body: { brandName }
      });

      if (error) throw error;

      setGeneratedImages(prev => ({
        ...prev,
        [brandName]: data.image
      }));

      toast({
        title: "Image Generated!",
        description: `Generated image for ${brandName}`,
      });

    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const downloadImage = (brandName: string, imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${brandName}-brand-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-6 h-6" />
            <span>Brand Image Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {brands.map((brand) => (
              <Card key={brand.id} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${brand.color} text-white`}>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {generatedImages[brand.name] ? (
                    <div className="space-y-4">
                      <img
                        src={generatedImages[brand.name]}
                        alt={`${brand.name} generated image`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => generateBrandImage(brand.name)}
                          disabled={loading === brand.name}
                          variant="outline"
                          size="sm"
                        >
                          {loading === brand.name ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Regenerating...
                            </>
                          ) : (
                            'Regenerate'
                          )}
                        </Button>
                        <Button
                          onClick={() => downloadImage(brand.name, generatedImages[brand.name])}
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                      <Button
                        onClick={() => generateBrandImage(brand.name)}
                        disabled={loading === brand.name}
                      >
                        {loading === brand.name ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Generating...
                          </>
                        ) : (
                          'Generate Image'
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandImageGenerator;
