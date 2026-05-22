
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AccessibleImage from '@/components/AccessibleImage';
import { ArrowRight, PlayCircle } from 'lucide-react';

interface HeroSectionProps {
  currentBrand: {
    id: string;
    name: string;
    tagline: string;
    color: string;
    image: string;
  };
}

const HeroSection = ({ currentBrand }: HeroSectionProps) => {
  return (
    <section className="relative pt-16 pb-24 overflow-hidden" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-blue-100 text-blue-800">
              Multi-Brand Franchising Platform
            </Badge>
            <h1 id="hero-heading" className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Start Your
              <span className={`bg-gradient-to-r ${currentBrand.color} bg-clip-text text-transparent`}>
                {' '}Franchise Journey
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of successful entrepreneurs with our proven franchise systems.
              Low capital, high returns, complete support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white">
                <PlayCircle className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Auth Section */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="sm">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                  <Link to="/signup">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className={`bg-gradient-to-br ${currentBrand.color} rounded-2xl p-8 text-white`}>
              <h3 className="text-2xl font-bold mb-2">{currentBrand.name}</h3>
              <p className="text-lg opacity-90 mb-6">{currentBrand.tagline}</p>
              <AccessibleImage
                src={currentBrand.image}
                alt={`${currentBrand.name} franchise showcase`}
                className="w-full h-48 object-cover rounded-lg"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
