
import React from 'react';
import Navigation from '@/components/Navigation';
import FranchiseeAnalytics from '@/components/analytics/FranchiseeAnalytics';

const FranchiseeAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FranchiseeAnalytics />
        </div>
      </main>
    </div>
  );
};

export default FranchiseeAnalyticsPage;
