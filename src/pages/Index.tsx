
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/home/HeroSection';
import BrandSelector from '@/components/home/BrandSelector';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { WhyChooseUsSection } from '@/components/home/WhyChooseUsSection';
import { SuccessStoriesSection } from '@/components/home/SuccessStoriesSection';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const Index = () => {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FranchiseHub",
    "description": "Your gateway to franchise success. Connect with leading brands and grow your business with comprehensive franchise solutions.",
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "logo": "/lovable-uploads/0d3593a7-8ba8-4f74-9248-6fb0f7bac354.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-FRANCHISE",
      "contactType": "customer service"
    }
  };

  // Updated brand data with proper image URLs
  const sampleBrand = {
    id: "1",
    name: "FoodCorp",
    tagline: "Delicious food, proven success",
    color: "from-orange-500 to-red-600",
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop&auto=format"
  };

  const sampleBrands = [
    {
      id: "1", 
      name: "FoodCorp", 
      tagline: "Delicious food, proven success", 
      color: "from-orange-500 to-red-600", 
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=600&fit=crop&auto=format"
    },
    { 
      id: "2", 
      name: "RetailPlus", 
      tagline: "Retail made simple", 
      color: "from-blue-500 to-purple-600", 
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&auto=format"
    },
    { 
      id: "3", 
      name: "ServiceMax", 
      tagline: "Service excellence", 
      color: "from-green-500 to-teal-600", 
      image: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=800&h=600&fit=crop&auto=format"
    },
    { 
      id: "4", 
      name: "TechFlow", 
      tagline: "Technology solutions", 
      color: "from-purple-500 to-pink-600", 
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&auto=format"
    }
  ];

  const sampleTestimonials = [
    {
      name: "Maria Santos",
      location: "Manila, Philippines",
      brand: "FoodCorp",
      rating: 5,
      comment: "Best decision I ever made. The support is incredible!",
      image: "/placeholder.svg"
    },
    {
      name: "Juan Dela Cruz",
      location: "Cebu, Philippines", 
      brand: "RetailPlus",
      rating: 5,
      comment: "ROI exceeded expectations within 8 months.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="FranchiseHub - Your Gateway to Franchise Success"
        description="Connect with leading franchise brands and grow your business with our comprehensive franchise solutions. Start your franchise journey today."
        structuredData={homeStructuredData}
      />
      <Navigation />
      
      <main>
        <HeroSection currentBrand={sampleBrand} />
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Franchise Journey?</h2>
            <p className="text-xl mb-8">Join thousands of successful franchise owners who started with us.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary">
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                <Link to="/supabase-login">
                  Sign In to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <BrandSelector 
          brands={sampleBrands} 
          selectedBrand="1" 
          onBrandChange={() => {}} 
        />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <SuccessStoriesSection testimonials={sampleTestimonials} isLoading={false} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
