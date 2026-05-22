
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

interface PackageCardProps {
  pkg: {
    tier: string;
    name: string;
    price: string;
    inclusions: string[];
    popular: boolean;
  };
  selectedBrand: string;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, selectedBrand }) => {
  return (
    <Card className={`relative h-full flex flex-col ${pkg.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      {pkg.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center pb-4">
        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pkg.tier}</div>
        <CardTitle className="text-base sm:text-lg">{pkg.name}</CardTitle>
        <div className="text-xl sm:text-2xl font-bold text-blue-600">{pkg.price}</div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-6 flex-1" role="list">
          {pkg.inclusions.map((item, i) => (
            <li key={i} className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full mt-auto"
          variant={pkg.popular ? 'default' : 'outline'}
          size="lg"
        >
          <Link 
            to={`/apply?brand=${selectedBrand}&package=${pkg.tier}`}
            aria-label={`Apply for ${pkg.name} package - ${pkg.price}`}
          >
            Apply for Package {pkg.tier}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PackageCard;
