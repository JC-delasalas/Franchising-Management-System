import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';
import { useAuth } from '@/hooks/useAuth';
import {
  generateFranchiseeSalesData,
  generateProductData,
  franchiseeKpiData,
  type PeriodType,
  type ProductDataPoint
} from '@/data/analytics/franchiseeData';
import {
  generateSalesData,
  franchisorKpiData,
  brandPerformanceData,
  networkProductData,
  regionalData
} from '@/data/analytics/franchisorData';
import { calculateTargetAchievement } from '@/utils/analytics';

export const useFranchiseeAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('MTD');
  const { user } = useAuth();

  // Get user's primary location
  const locationId = user?.metadata?.primary_location_id;

  // Fetch real analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['franchisee-analytics', locationId],
    queryFn: () => AnalyticsAPI.getFranchiseeAnalytics(locationId!),
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });

  // Use real database data - no more mock fallbacks
  const currentData = useMemo(() => {
    // Return empty array if no real data available
    return analyticsData?.salesData || [];
  }, [analyticsData, selectedPeriod]);

  const currentProductData = useMemo(() => {
    // Return empty array if no real data available
    return analyticsData?.productData || [];
  }, [analyticsData, selectedPeriod]);

  // Use real KPI data from database
  const currentKPI = useMemo(() => {
    if (analyticsData) {
      return {
        totalSales: `₱${analyticsData.sales.month.toLocaleString()}`,
        growth: analyticsData.sales.change_percentage,
        target: `₱${(analyticsData.sales.month * 1.2).toLocaleString()}`, // 20% higher target
        orders: analyticsData.orders.total,
        avgOrderValue: `₱${analyticsData.orders.avg_value.toLocaleString()}`
      };
    }
    return franchiseeKpiData[selectedPeriod];
  }, [selectedPeriod, analyticsData]);

  const targetAchievement = useMemo(() =>
    calculateTargetAchievement(currentKPI.totalSales, currentKPI.target),
    [currentKPI]
  );

  // Enhanced product data that scales with period
  const getProductDataForPeriod = (period: PeriodType): ProductDataPoint[] => {
    const baseData = currentProductData && currentProductData.length > 0 ? currentProductData : [
      { name: 'Siomai King Special', sales: 520000, orders: 2156, percentage: 38, growth: 24.5, profit: 187200, rating: 4.9, category: 'Signature' },
      { name: 'Spicy Siomai Deluxe', sales: 370000, orders: 1642, percentage: 27, growth: 31.2, profit: 133200, rating: 4.8, category: 'Signature' },
      { name: 'Premium Rice Meals', sales: 274000, orders: 1012, percentage: 20, growth: 18.7, profit: 93160, rating: 4.7, category: 'Meals' },
      { name: 'Fresh Beverages', sales: 206000, orders: 1044, percentage: 15, growth: 22.1, profit: 82400, rating: 4.6, category: 'Beverages' }
    ];

    // Scale data based on period
    const multiplier = period === 'YTD' ? 12 : period === 'QTD' ? 3 : 1;
    return baseData.map(item => ({
      ...item,
      sales: Math.round(item.sales * multiplier),
      orders: Math.round(item.orders * multiplier),
      profit: Math.round(item.profit * multiplier)
    }));
  };

  const productDataToUse = useMemo(() => getProductDataForPeriod(selectedPeriod), [selectedPeriod]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    currentData,
    currentProductData,
    currentKPI,
    targetAchievement,
    productDataToUse
  };
};

export const useFranchisorAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('MTD');

  const currentData = useMemo(() => generateSalesData(selectedPeriod), [selectedPeriod]);
  const currentKPI = useMemo(() => franchisorKpiData[selectedPeriod], [selectedPeriod]);
  const targetAchievement = useMemo(() => 
    calculateTargetAchievement(currentKPI.totalSales, currentKPI.target), 
    [currentKPI]
  );

  // Ensure data is always available
  const brandDataToUse = useMemo(() => brandPerformanceData || [], []);
  const networkProductDataToUse = useMemo(() => networkProductData || [], []);
  const regionalDataToUse = useMemo(() => regionalData || [], []);

  return {
    selectedPeriod,
    setSelectedPeriod,
    currentData,
    currentKPI,
    targetAchievement,
    brandDataToUse,
    networkProductDataToUse,
    regionalDataToUse
  };
};
