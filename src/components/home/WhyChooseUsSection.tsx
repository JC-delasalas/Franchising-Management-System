
import React from 'react';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';

export const WhyChooseUsSection: React.FC = () => {
  const features = [
    { icon: DollarSign, title: 'Low Capital', desc: 'Start from just ₱50,000' },
    { icon: TrendingUp, title: 'Fast ROI', desc: 'Return on investment in 6-12 months' },
    { icon: Users, title: 'National Reach', desc: 'Established brand recognition' },
    { icon: Award, title: 'Full Support', desc: '24/7 training and assistance' }
  ];

  return (
    <section className="py-12 sm:py-16" aria-labelledby="why-franchise-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 id="why-franchise-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Join thousands of successful franchisees</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
