
import React, { useState, useMemo } from 'react';
import ChatAssistant from '@/components/ChatAssistant';
import SkipLink from '@/components/SkipLink';
import SimpleNavigation from '@/components/SimpleNavigation';
import NavigationErrorBoundary from '@/components/NavigationErrorBoundary';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import HeroSection from '@/components/home/HeroSection';
import BrandSelector from '@/components/home/BrandSelector';
import BrandCard from '@/components/home/BrandCard';
import PackageCard from '@/components/home/PackageCard';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { SuccessStoriesSection } from '@/components/home/SuccessStoriesSection';
import SEO from '@/components/SEO';
import { config, isFeatureEnabled } from '@/config/environment';
import { CardSkeleton, PackageSkeleton } from '@/components/ui/enhanced-loading';

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState('siomai-shop');
  const [isLoading, setIsLoading] = useState(false);

  // Memoize static data for better performance
  const brands = useMemo(() => [
    {
      id: 'siomai-shop',
      name: 'Siomai Shop',
      tagline: 'Your Neighborhood Siomai Specialist',
      color: 'from-red-600 to-red-800',
      image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'lemon-juice-stand',
      name: 'Lemon Juice Stand',
      tagline: 'Fresh & Natural Lemon Drinks',
      color: 'from-yellow-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'coffee-shop',
      name: 'Coffee Shop',
      tagline: 'Your Daily Coffee Experience',
      color: 'from-amber-700 to-amber-900',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'burger-fries',
      name: 'Burger & Fries',
      tagline: 'Classic Burgers & Crispy Fries',
      color: 'from-green-600 to-green-800',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
    }
  ], []);

  const packages = useMemo(() => ({
    'siomai-shop': [
      {
        tier: 'A',
        name: 'Entry Level',
        price: '₱50,000',
        inclusions: ['Food Cart Setup', '₱20,000 Initial Inventory', 'Basic Training', '2-Week Support'],
        popular: false
      },
      {
        tier: 'B',
        name: 'Mid Tier',
        price: '₱120,000',
        inclusions: ['Kiosk Setup', 'Marketing Kit', 'POS Training', '1-Month Support', 'Branded Uniforms'],
        popular: true
      },
      {
        tier: 'C',
        name: 'Advanced',
        price: '₱250,000',
        inclusions: ['Food Stall', 'POS System', 'Full Uniforms', '3-Month Support', 'Territory Rights'],
        popular: false
      },
      {
        tier: 'D',
        name: 'Investor Tier',
        price: '₱500,000+',
        inclusions: ['Mini Branch', 'Complete Setup', '6-Month Support', 'Exclusive Territory', 'Advanced Training'],
        popular: false
      }
    ]
  }), []);

  const testimonials = useMemo(() => [
    {
      name: 'Maria Santos',
      location: 'Quezon City',
      brand: 'Siomai Shop',
      rating: 5,
      comment: 'Best investment I\'ve made! ROI within 8 months.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Juan Dela Cruz',
      location: 'Makati',
      brand: 'Coffee Shop',
      rating: 5,
      comment: 'Amazing support from the team. Highly recommended!',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    {
      name: 'Ana Rodriguez',
      location: 'BGC',
      brand: 'Lemon Juice Stand',
      rating: 5,
      comment: 'Great business model with excellent profit margins.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80'
    }
  ], []);

  const currentBrand = useMemo(() => brands.find(b => b.id === selectedBrand) || brands[0], [brands, selectedBrand]);
  const currentPackages = useMemo(() => packages[selectedBrand] || packages['siomai-shop'], [packages, selectedBrand]);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Franchise Management System - Your Gateway to Success"
        description="Discover profitable franchise opportunities with our comprehensive management system. Start your business journey with proven brands and complete support."
        keywords="franchise management, business opportunity, Philippines, franchise system, investment opportunity"
        url="/"
      />
      <SkipLink />

      <NavigationErrorBoundary>
        <SimpleNavigation />
      </NavigationErrorBoundary>

      <main id="main-content">
        <HeroSection currentBrand={currentBrand} />
        <BrandSelector 
          brands={brands} 
          selectedBrand={selectedBrand} 
          onBrandChange={setSelectedBrand}
        />

        {/* Brand Overview Cards */}
        <section className="py-12 sm:py-16" aria-labelledby="brand-overview-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="brand-overview-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Explore Our Brands</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Click on any brand to learn more about the opportunity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <CardSkeleton key={index} showImage={true} lines={2} />
                ))
              ) : (
                brands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Franchise Packages */}
        <section id="packages" className="py-12 sm:py-16" aria-labelledby="packages-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 id="packages-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Franchise Packages</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Choose the perfect package for your budget and goals</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <PackageSkeleton key={index} />
                ))
              ) : (
                currentPackages.map((pkg, index) => (
                  <PackageCard 
                    key={index} 
                    pkg={pkg} 
                    selectedBrand={selectedBrand} 
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <HowItWorksSection />
        <WhyChooseUsSection />
        <SuccessStoriesSection testimonials={testimonials} isLoading={isLoading} />
      </main>

      <Footer />

      {isFeatureEnabled('chatSupport') && <ChatAssistant />}
    </div>
  );
};

export default Index;
