
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Star, Users, TrendingUp, Shield, Play } from 'lucide-react';

const brands = [
  {
    id: 'siomai-king',
    name: 'Siomai King',
    tagline: 'The Royal Taste of Asia',
    color: 'bg-gradient-to-br from-red-600 to-red-800',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'juicy-lemon',
    name: 'Juicy Lemon',
    tagline: 'Fresh. Natural. Refreshing.',
    color: 'bg-gradient-to-br from-yellow-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'cafe-supremo',
    name: 'Café Supremo',
    tagline: 'Premium Coffee Experience',
    color: 'bg-gradient-to-br from-amber-700 to-amber-900',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bite-go-burgers',
    name: 'Bite & Go Burgers',
    tagline: 'Fast. Fresh. Flavorful.',
    color: 'bg-gradient-to-br from-green-600 to-green-800',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
  }
];

const packages = {
  A: {
    name: 'Entry Level',
    price: '₱50,000',
    description: 'Perfect for first-time entrepreneurs',
    inclusions: ['Food Cart Setup', '₱20,000 Initial Inventory', 'Basic Training', 'Starter Marketing Kit']
  },
  B: {
    name: 'Mid Tier',
    price: '₱120,000',
    description: 'Ideal for small business expansion',
    inclusions: ['Kiosk Setup', 'POS System', 'Complete Marketing Kit', '30-Day Support', 'Branded Uniforms']
  },
  C: {
    name: 'Advanced',
    price: '₱250,000',
    description: 'Professional business establishment',
    inclusions: ['Food Stall Setup', 'Premium POS System', 'Full Branding Package', '60-Day Support', 'Staff Training']
  },
  D: {
    name: 'Investor Tier',
    price: '₱500,000+',
    description: 'Complete business solution',
    inclusions: ['Mini Branch Setup', 'Advanced POS & Analytics', 'Premium Support', '90-Day Training', 'Territory Rights']
  }
};

const steps = [
  { title: 'Choose Brand', description: 'Select your preferred franchise brand' },
  { title: 'Select Package', description: 'Pick the package that fits your budget' },
  { title: 'Submit Application', description: 'Complete our simple application form' },
  { title: 'Attend Training', description: 'Learn everything you need to succeed' },
  { title: 'Start Selling', description: 'Launch your profitable business' }
];

const testimonials = [
  {
    name: 'Maria Santos',
    brand: 'Siomai King',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b332c3c1?auto=format&fit=crop&w=150&q=80',
    quote: 'In just 6 months, I recovered my investment and now earning ₱15,000 monthly!',
    rating: 5
  },
  {
    name: 'Juan Dela Cruz',
    brand: 'Café Supremo',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    quote: 'The training was excellent and support team is always available.',
    rating: 5
  },
  {
    name: 'Ana Rodriguez',
    brand: 'Juicy Lemon',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    quote: 'Best business decision I ever made. The ROI is amazing!',
    rating: 5
  }
];

const Index = () => {
  const [selectedBrand, setSelectedBrand] = useState(brands[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">FranchiseHub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/franchisor-dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link to="/apply">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`${selectedBrand.color} text-white py-20`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    Premium Franchise Opportunity
                  </Badge>
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    {selectedBrand.name}
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/90">
                    {selectedBrand.tagline}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                    <Link to="/apply">
                      Apply Now <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                    <Link to={`/brand/${selectedBrand.id}`}>
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={selectedBrand.image} 
                  alt={selectedBrand.name}
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                <Button size="lg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Video
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Brand Tabs */}
        <div className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={selectedBrand.id} onValueChange={(value) => setSelectedBrand(brands.find(b => b.id === value) || brands[0])}>
              <TabsList className="grid w-full grid-cols-4 h-16">
                {brands.map((brand) => (
                  <TabsTrigger key={brand.id} value={brand.id} className="text-sm font-medium">
                    {brand.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Franchise Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Package</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the franchise package that best fits your budget and business goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(packages).map(([tier, pkg]) => (
              <Card key={tier} className="relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {tier}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {pkg.inclusions.map((item, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 space-y-2">
                    <Button className="w-full" asChild>
                      <Link to="/apply">Apply Now</Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      Compare Packages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start your franchise journey</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Franchise With Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Franchise With Us</h2>
            <p className="text-xl text-gray-600">Join thousands of successful franchisees</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, title: 'Low Capital', description: 'Start with as low as ₱50,000' },
              { icon: Star, title: 'Fast ROI', description: 'Recover investment in 6-12 months' },
              { icon: Users, title: 'National Reach', description: '500+ franchisees nationwide' },
              { icon: Shield, title: 'Full Support', description: '24/7 support and training' }
            ].map((item, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from our successful franchisees</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.brand} Franchisee</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Franchise Journey?</h2>
          <p className="text-xl mb-8">Join our network of successful entrepreneurs today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/apply">
                Apply Now <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold">FranchiseHub</span>
              </div>
              <p className="text-gray-400">
                Building successful franchise partnerships across the Philippines.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
                <li><Link to="/franchisor-dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Brands</h4>
              <ul className="space-y-2 text-gray-400">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link to={`/brand/${brand.id}`} className="hover:text-white transition-colors">
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p>📍 123 Business Ave, Makati City</p>
                <p>📞 (02) 8123-4567</p>
                <p>✉️ info@franchisehub.ph</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FranchiseHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
