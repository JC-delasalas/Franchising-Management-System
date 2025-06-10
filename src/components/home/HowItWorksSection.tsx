
import React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    { step: 1, title: 'Choose Brand', desc: 'Select your preferred franchise brand' },
    { step: 2, title: 'Select Package', desc: 'Pick the package that fits your budget' },
    { step: 3, title: 'Submit Application', desc: 'Complete our simple application form' },
    { step: 4, title: 'Attend Training', desc: 'Learn operations and best practices' },
    { step: 5, title: 'Start Selling', desc: 'Launch your franchise and earn profits' }
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-gray-50" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Simple 5-step process to franchise success</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                aria-label={`Step ${item.step}`}
              >
                {item.step}
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
