
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight, Download, Star, TrendingUp, Users, Shield, ArrowLeft } from 'lucide-react';

const brandData = {
  'siomai-king': {
    name: 'Siomai King',
    tagline: 'The Royal Taste of Asia',
    color: 'from-red-600 to-red-800',
    description: 'Experience the authentic taste of premium siomai with our signature recipes that have delighted Filipino families for over a decade.',
    heroImage: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Proven market demand with loyal customer base',
      'Low operational complexity',
      'High profit margins on signature products',
      'Comprehensive training and support system'
    ],
    faqs: [
      {
        question: 'What is the minimum investment required?',
        answer: 'The minimum investment starts at ₱50,000 for Package A (Entry Level), which includes a food cart setup and initial inventory.'
      },
      {
        question: 'How long does it take to set up?',
        answer: 'Typically 2-4 weeks from approval to opening, depending on the package selected and location preparation.'
      },
      {
        question: 'Do you provide training?',
        answer: 'Yes, we provide comprehensive training covering product preparation, operations, and business management.'
      }
    ]
  },
  'juicy-lemon': {
    name: 'Juicy Lemon',
    tagline: 'Fresh. Natural. Refreshing.',
    color: 'from-yellow-500 to-orange-500',
    description: 'Refresh your customers with our premium natural fruit drinks made from the finest ingredients.',
    heroImage: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Growing health-conscious market segment',
      'Year-round demand for refreshing beverages',
      'Simple operations with consistent quality',
      'Strong brand recognition and marketing support'
    ],
    faqs: [
      {
        question: 'What products can I sell?',
        answer: 'Our menu includes fresh lemonades, fruit teas, smoothies, and seasonal specialty drinks.'
      },
      {
        question: 'Is equipment included?',
        answer: 'Yes, all packages include the necessary equipment for beverage preparation and service.'
      },
      {
        question: 'What about seasonal variations?',
        answer: 'We regularly introduce seasonal flavors and promotional items to keep the menu fresh and exciting.'
      }
    ]
  },
  'cafe-supremo': {
    name: 'Café Supremo',
    tagline: 'Premium Coffee Experience',
    color: 'from-amber-700 to-amber-900',
    description: 'Bring the premium coffee shop experience to your community with our expertly crafted blends and cozy atmosphere.',
    heroImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Premium positioning in growing coffee market',
      'Multiple revenue streams (beverages, food, retail)',
      'Strong community gathering place concept',
      'Comprehensive barista training program'
    ],
    faqs: [
      {
        question: 'Do I need coffee experience?',
        answer: 'No prior experience needed. We provide complete barista training and ongoing support.'
      },
      {
        question: 'What about coffee supply?',
        answer: 'We provide premium coffee beans and ensure consistent supply through our established network.'
      },
      {
        question: 'Can I customize the menu?',
        answer: 'The core menu is standardized, but we allow limited local customization with approval.'
      }
    ]
  },
  'bite-go-burgers': {
    name: 'Bite & Go Burgers',
    tagline: 'Fast. Fresh. Flavorful.',
    color: 'from-green-600 to-green-800',
    description: 'Satisfy the growing demand for quality fast food with our gourmet burgers made from premium ingredients.',
    heroImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Fast-growing burger market opportunity',
      'Premium quality at competitive prices',
      'Efficient operations for quick service',
      'Strong delivery and takeout focus'
    ],
    faqs: [
      {
        question: 'What makes your burgers different?',
        answer: 'We use premium beef patties, fresh ingredients, and signature sauces that set us apart from competitors.'
      },
      {
        question: 'Is this suitable for delivery?',
        answer: 'Absolutely! Our packaging and recipes are optimized for delivery and takeout orders.'
      },
      {
        question: 'What about kitchen requirements?',
        answer: 'We provide detailed kitchen specifications and equipment lists based on your chosen package.'
      }
    ]
  }
};

const packages = [
  {
    id: 'A',
    name: 'Entry Level',
    price: '₱50,000',
    setup: 'Food Cart',
    inclusions: ['Food Cart Setup', '₱20,000 Initial Inventory', 'Basic Training', 'Starter Marketing Kit']
  },
  {
    id: 'B', 
    name: 'Mid Tier',
    price: '₱120,000',
    setup: 'Kiosk',
    inclusions: ['Kiosk Setup', 'POS System', 'Complete Marketing Kit', '30-Day Support', 'Branded Uniforms']
  },
  {
    id: 'C',
    name: 'Advanced',
    price: '₱250,000',
    setup: 'Food Stall',
    inclusions: ['Food Stall Setup', 'Premium POS System', 'Full Branding Package', '60-Day Support', 'Staff Training']
  },
  {
    id: 'D',
    name: 'Investor Tier',
    price: '₱500,000+',
    setup: 'Mini Branch',
    inclusions: ['Mini Branch Setup', 'Advanced POS & Analytics', 'Premium Support', '90-Day Training', 'Territory Rights']
  }
];

const BrandMicrosite = () => {
  const { brandId } = useParams();
  const brand = brandData[brandId as keyof typeof brandData];

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <span className="text-xl font-bold text-gray-900">{brand.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild className={`bg-gradient-to-r ${brand.color.replace('from-', 'from-').replace('to-', 'to-')} hover:opacity-90`}>
                <Link to="/apply">Apply Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`bg-gradient-to-br ${brand.color} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  Premium Franchise Opportunity
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  {brand.name}
                </h1>
                <p className="text-xl lg:text-2xl text-white/90">
                  {brand.tagline}
                </p>
                <p className="text-lg text-white/80 leading-relaxed">
                  {brand.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
                  <Link to="/apply">
                    Apply Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Download className="mr-2 h-5 w-5" />
                  Download Brochure
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={brand.heroImage} 
                alt={brand.name}
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Franchise Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose {brand.name}?</h2>
            <p className="text-xl text-gray-600">Join a proven business model with exceptional support</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brand.benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 leading-relaxed">{benefit}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Package Comparison */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Package</h2>
            <p className="text-xl text-gray-600">Find the perfect investment level for your business goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                    {pkg.id}
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <p className="text-gray-600 text-sm">{pkg.setup} Setup</p>
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
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <Link to="/apply">Apply for This Package</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Package Comparison</h2>
            <p className="text-xl text-gray-600">Detailed breakdown of features included in each package</p>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-medium text-gray-900">Features</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-900">Package A</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-900">Package B</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-900">Package C</th>
                      <th className="px-6 py-4 text-center font-medium text-gray-900">Package D</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      ['Initial Investment', '₱50,000', '₱120,000', '₱250,000', '₱500,000+'],
                      ['Setup Type', 'Food Cart', 'Kiosk', 'Food Stall', 'Mini Branch'],
                      ['POS System', '❌', '✅', '✅ Premium', '✅ Advanced'],
                      ['Training Duration', '3 days', '1 week', '2 weeks', '1 month'],
                      ['Support Period', '2 weeks', '1 month', '2 months', '3 months'],
                      ['Marketing Kit', 'Basic', 'Complete', 'Premium', 'Full Package'],
                      ['Territory Rights', '❌', '❌', 'Limited', 'Exclusive']
                    ].map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 font-medium text-gray-900">{row[0]}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{row[1]}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{row[2]}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{row[3]}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{row[4]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions about {brand.name} franchise</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {brand.faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r ${brand.color} text-white`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Join {brand.name}?</h2>
          <p className="text-xl mb-8">Start your journey to business ownership today</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" asChild>
              <Link to="/apply">
                Apply Now <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Download className="mr-2 h-5 w-5" />
              Download Brochure
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BrandMicrosite;
