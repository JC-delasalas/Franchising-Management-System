
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import AccessibleImage from '@/components/AccessibleImage';
import { ArrowRight } from 'lucide-react';

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    tagline: string;
    color: string;
    image: string;
  };
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <Link 
        to={`/brand/${brand.id}`} 
        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label={`Learn more about ${brand.name} franchise opportunity`}
      >
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <AccessibleImage
            src={brand.image}
            alt={`${brand.name} franchise opportunity`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{brand.tagline}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">Learn More</span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default BrandCard;
