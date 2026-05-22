
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AccessibleImage from '@/components/AccessibleImage';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  location: string;
  brand: string;
  rating: number;
  comment: string;
  image: string;
}

interface SuccessStoriesSectionProps {
  testimonials: Testimonial[];
  isLoading: boolean;
}

export const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({ testimonials, isLoading }) => {
  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 h-48"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50" aria-labelledby="success-stories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 id="success-stories-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Hear from our successful franchisees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <AccessibleImage
                    src={testimonial.image}
                    alt={`${testimonial.name} - successful franchisee`}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">{testimonial.brand} - {testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-3" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-sm sm:text-base text-gray-700 italic">"{testimonial.comment}"</blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
