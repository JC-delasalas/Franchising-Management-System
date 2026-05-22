
import React from 'react';
import Navigation from '@/components/Navigation';
import KPICharts from '@/components/analytics/KPICharts';

const FranchisorAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Franchisor Analytics</h1>
            <p className="text-gray-600 mt-2">Monitor your franchise network performance and growth</p>
          </div>
          
          <KPICharts userType="franchisor" />
        </div>
      </main>
    </div>
  );
};

export default FranchisorAnalytics;
