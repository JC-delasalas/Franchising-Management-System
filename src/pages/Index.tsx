
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Star, Users, MapPin, TrendingUp } from 'lucide-react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/home/HeroSection';
import BrandSelector from '@/components/home/BrandSelector';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import SuccessStoriesSection from '@/components/home/SuccessStoriesSection';
import { Footer } from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const Index = () => {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FranchiseHub",
    "description": "Your gateway to franchise success. Connect with leading brands and grow your business with comprehensive franchise solutions.",
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "logo": "/placeholder.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-FRANCHISE",
      "contactType": "customer service"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="FranchiseHub - Your Gateway to Franchise Success"
        description="Connect with leading franchise brands and grow your business with our comprehensive franchise solutions. Start your franchise journey today."
        structuredData={homeStructuredData}
      />
      <Navigation />
      
      <main>
        <HeroSection />
        
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

        <BrandSelector />
        <HowItWorksSection />
        <WhyChooseUsSection />
        <SuccessStoriesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
