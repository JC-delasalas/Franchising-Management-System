
import React from 'react';
import Navigation from '@/components/Navigation';
import BrandImageGenerator from '@/components/admin/BrandImageGenerator';
import { RequireSupabaseAuth } from '@/components/auth/SupabaseAuthGuard';

const BrandImageManager = () => {
  return (
    <RequireSupabaseAuth>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Brand Image Manager</h1>
              <p className="text-gray-600 mt-2">Generate and manage images for your franchise brands</p>
            </div>
            <BrandImageGenerator />
          </div>
        </main>
      </div>
    </RequireSupabaseAuth>
  );
};

export default BrandImageManager;
