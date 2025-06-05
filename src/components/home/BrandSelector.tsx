
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccessibleImage from '@/components/AccessibleImage';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  tagline: string;
  color: string;
  image: string;
}

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: string;
  onBrandChange: (brandId: string) => void;
}

const BrandSelector = ({ brands, selectedBrand, onBrandChange }: BrandSelectorProps) => {
  return (
    <section id="brands" className="py-16 bg-gray-50" aria-labelledby="brands-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="brands-heading" className="text-3xl font-bold text-gray-900 mb-4">Choose Your Brand</h2>
          <p className="text-lg text-gray-600">Multiple proven brands, one platform</p>
        </div>

        <Tabs value={selectedBrand} onValueChange={onBrandChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {brands.map((brand) => (
              <TabsTrigger key={brand.id} value={brand.id} className="text-sm">
                {brand.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {brands.map((brand) => (
            <TabsContent key={brand.id} value={brand.id}>
              <div className={`bg-gradient-to-br ${brand.color} rounded-2xl text-white p-8 mb-8`}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{brand.name}</h3>
                    <p className="text-xl opacity-90 mb-6">{brand.tagline}</p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Proven business model</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Comprehensive training</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5" />
                        <span>Marketing support</span>
                      </li>
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                        <Link to={`/brand/${brand.id}`}>
                          Learn More <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                      <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 border-2 border-white font-semibold">
                        <Link to={`/apply?brand=${brand.id}`}>
                          Apply Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    <AccessibleImage
                      src={brand.image}
                      alt={`${brand.name} brand showcase`}
                      className="w-full h-64 object-cover rounded-lg mx-auto"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default BrandSelector;
