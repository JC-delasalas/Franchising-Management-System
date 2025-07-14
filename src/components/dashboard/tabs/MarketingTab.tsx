
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const marketingCategories = [
  { category: 'Logos & Branding', items: ['High-res Logo', 'Brand Guidelines', 'Color Palette'] },
  { category: 'Menu & Pricing', items: ['Current Menu Cards', 'Price Lists', 'Nutritional Info'] },
  { category: 'Promotional Materials', items: ['Social Media Templates', 'Flyers & Posters', 'Banner Designs'] }
];

export const MarketingTab: React.FC = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {marketingCategories.map((category, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item}</span>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
