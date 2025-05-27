import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatAssistant from '@/components/ChatAssistant';
import AccessibleImage from '@/components/AccessibleImage';
import SkipLink from '@/components/SkipLink';
import Navigation from '@/components/Navigation';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { config, isFeatureEnabled } from '@/config/environment';
import {
  ArrowRight,
  CheckCircle,
  Users,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
  Star,
  PlayCircle,
  DollarSign
} from 'lucide-react';

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState('siomai-shop');

  const brands = [
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
  ];

  const packages = {
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
  };

  const testimonials = [
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
  ];

  const currentBrand = brands.find(b => b.id === selectedBrand);
  const currentPackages = packages[selectedBrand] || packages['siomai-shop'];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Franchise Opportunities in the Philippines"
        description="Discover profitable franchise opportunities with FranchiseHub. Start your business journey with proven brands like Siomai Shop, Coffee Shop, Lemon Juice Stand, and Burger & Fries. Get comprehensive support and training."
        keywords="franchise Philippines, business opportunity, food franchise, siomai franchise, coffee shop franchise, burger franchise, investment opportunity"
        url="/"
      />
      <SkipLink />

      <Navigation />

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 overflow-hidden" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-800">
                  Multi-Brand Franchising Platform
                </Badge>
                <h1 id="hero-heading" className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Start Your
                  <span className={`bg-gradient-to-r ${currentBrand?.color} bg-clip-text text-transparent`}>
                    {' '}Franchise Journey
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of successful entrepreneurs with our proven franchise systems.
                  Low capital, high returns, complete support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
                    <Link to="/apply">
                      Apply Now
                      <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white focus:ring-2 focus:ring-gray-500"
                    aria-label="Watch demonstration video"
                  >
                    <PlayCircle className="mr-2 w-5 h-5" aria-hidden="true" />
                    Watch Demo
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className={`bg-gradient-to-br ${currentBrand?.color} rounded-2xl p-8 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{currentBrand?.name}</h3>
                  <p className="text-lg opacity-90 mb-6">{currentBrand?.tagline}</p>
                  <AccessibleImage
                    src={currentBrand?.image || ''}
                    alt={`${currentBrand?.name} franchise showcase`}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Selector */}
        <section id="brands" className="py-16 bg-gray-50" aria-labelledby="brands-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="brands-heading" className="text-3xl font-bold text-gray-900 mb-4">Choose Your Brand</h2>
              <p className="text-lg text-gray-600">Multiple proven brands, one platform</p>
            </div>

            <Tabs value={selectedBrand} onValueChange={setSelectedBrand} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8" role="tablist" aria-label="Brand selection">
                {brands.map((brand) => (
                  <TabsTrigger
                    key={brand.id}
                    value={brand.id}
                    className="text-sm focus:ring-2 focus:ring-blue-500"
                    role="tab"
                    aria-selected={selectedBrand === brand.id}
                  >
                    {brand.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {brands.map((brand) => (
                <TabsContent key={brand.id} value={brand.id} role="tabpanel">
                  <div className={`bg-gradient-to-br ${brand.color} rounded-2xl text-white p-8 mb-8`}>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-3xl font-bold mb-4">{brand.name}</h3>
                        <p className="text-xl opacity-90 mb-6">{brand.tagline}</p>
                        <ul className="space-y-3 mb-6" role="list">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" aria-hidden="true" />
                            <span>Proven business model</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" aria-hidden="true" />
                            <span>Comprehensive training</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5" aria-hidden="true" />
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
                          alt={`${brand.name} brand showcase and products`}
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
                    <ul className="space-y-2 mb-6" role="list">
                      {pkg.inclusions.map((item, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="w-full focus:ring-2 focus:ring-blue-500"
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
                  <div
                    className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                    aria-label={`Step ${item.step}`}
                  >
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
              <h2 id="why-franchise-heading" className="text-3xl font-bold text-gray-900 mb-4">Why Franchise With Us</h2>
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
                    <item.icon className="w-8 h-8 text-blue-600" aria-hidden="true" />
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
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.brand} - {testimonial.location}</p>
                      </div>
                    </div>
                    <div className="flex mb-3" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="md" className="text-white" />
              </div>
              <p className="text-gray-400 mb-4">
                The leading multi-brand franchising platform in the Philippines.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2">
                  <li><Link to="/apply" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Apply Now</Link></li>
                  <li><a href="#brands" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Brands</a></li>
                  <li><a href="#packages" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Packages</a></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded">Contact</Link></li>
                </ul>
              </nav>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <address className="space-y-2 not-italic">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {config.contact.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <a
                    href={`mailto:${config.contact.email}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {config.contact.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span className="text-gray-400">{config.contact.address.split(',').slice(-2).join(',').trim()}</span>
                </div>
              </address>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Get updates on new franchise opportunities</p>
              <form className="flex" aria-label="Newsletter subscription">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email"
                  required
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                  aria-label="Subscribe to newsletter"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {config.app.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {isFeatureEnabled('chatSupport') && <ChatAssistant />}
    </div>
  );
};

export default Index;
