
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChatAssistant from '@/components/ChatAssistant';
import AccessibleImage from '@/components/AccessibleImage';
import SkipLink from '@/components/SkipLink';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import BrandSelector from '@/components/home/BrandSelector';
import SEO from '@/components/SEO';
import { config, isFeatureEnabled } from '@/config/environment';
import {
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Star,
  DollarSign
} from 'lucide-react';

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState('siomai-shop');

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

      <Header showAuthButtons={true} />

      <main id="main-content">
        <HeroSection currentBrand={currentBrand} />
        <BrandSelector 
          brands={brands} 
          selectedBrand={selectedBrand} 
          onBrandChange={setSelectedBrand}
        />

        {/* Brand Overview Cards */}
        <section className="py-16" aria-labelledby="brand-overview-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="brand-overview-heading" className="text-3xl font-bold text-gray-900 mb-4">Explore Our Brands</h2>
              <p className="text-lg text-gray-600">Click on any brand to learn more about the opportunity</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <Card key={brand.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <Link to={`/brand/${brand.id}`} className="block">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <AccessibleImage
                        src={brand.image}
                        alt={`${brand.name} franchise opportunity`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{brand.name}</h3>
                      <p className="text-gray-600 mb-4">{brand.tagline}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-600 font-medium">Learn More</span>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Franchise Packages */}
        <section id="packages" className="py-16" aria-labelledby="packages-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="packages-heading" className="text-3xl font-bold text-gray-900 mb-4">Franchise Packages</h2>
              <p className="text-lg text-gray-600">Choose the perfect package for your budget and goals</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentPackages.map((pkg, index) => (
                <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{pkg.tier}</div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">{pkg.price}</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {pkg.inclusions.map((item, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      <Link to={`/apply?brand=${selectedBrand}&package=${pkg.tier}`}>
                        Apply for Package {pkg.tier}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 bg-gray-50" aria-labelledby="how-it-works-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="how-it-works-heading" className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600">Simple 5-step process to franchise success</p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {[
                { step: 1, title: 'Choose Brand', desc: 'Select your preferred franchise brand' },
                { step: 2, title: 'Select Package', desc: 'Pick the package that fits your budget' },
                { step: 3, title: 'Submit Application', desc: 'Complete our simple application form' },
                { step: 4, title: 'Attend Training', desc: 'Learn operations and best practices' },
                { step: 5, title: 'Start Selling', desc: 'Launch your franchise and earn profits' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Franchise With Us */}
        <section className="py-16" aria-labelledby="why-franchise-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="why-franchise-heading" className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <p className="text-lg text-gray-600">Join thousands of successful franchisees</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { icon: DollarSign, title: 'Low Capital', desc: 'Start from just ₱50,000' },
                { icon: TrendingUp, title: 'Fast ROI', desc: 'Return on investment in 6-12 months' },
                { icon: Users, title: 'National Reach', desc: 'Established brand recognition' },
                { icon: Award, title: 'Full Support', desc: '24/7 training and assistance' }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 bg-gray-50" aria-labelledby="success-stories-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="success-stories-heading" className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
              <p className="text-lg text-gray-600">Hear from our successful franchisees</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <AccessibleImage
                        src={testimonial.image}
                        alt={`${testimonial.name} - successful franchisee`}
                        className="w-12 h-12 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.brand} - {testimonial.location}</p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 italic">"{testimonial.comment}"</blockquote>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {isFeatureEnabled('chatSupport') && <ChatAssistant />}
    </div>
  );
};

export default Index;
