// Demo Data Generator for Impressive Analytics
// This file contains realistic and appealing data for franchise demos

export interface SalesDataPoint {
  name: string;
  sales: number;
  target: number;
  franchisees?: number;
  orders?: number;
  avgOrder?: number;
  growth: number;
  customerSatisfaction?: number;
}

export interface BrandData {
  name: string;
  value: number;
  sales: number;
  color: string;
  growth: number;
  locations: number;
  avgRevenue?: number;
  marketShare?: number;
}

export interface ProductData {
  name: string;
  sales: number;
  orders: number;
  percentage: number;
  growth: number;
  profit?: number;
  rating?: number;
}

// Franchise Network Performance Data
export const networkPerformanceData = {
  totalRevenue: 203990000,
  totalFranchisees: 97,
  totalOrders: 1250000,
  avgOrderValue: 163,
  customerSatisfaction: 4.7,
  marketPresence: {
    cities: 15,
    provinces: 8,
    regions: 3
  },
  growthMetrics: {
    revenueGrowth: 20.7,
    franchiseeGrowth: 29.3,
    marketExpansion: 35.2
  }
};

// Top Performing Locations
export const topLocations = [
  { name: 'Siomai King - BGC', sales: 2850000, growth: 28.4, rating: 4.9, orders: 12450 },
  { name: 'Coffee Masters - Ortigas', sales: 2650000, growth: 31.2, rating: 4.8, orders: 11200 },
  { name: 'Burger Express - Makati', sales: 2420000, growth: 24.7, rating: 4.7, orders: 10800 },
  { name: 'Fresh Juice - Alabang', sales: 2180000, growth: 26.1, rating: 4.8, orders: 9650 },
  { name: 'Siomai King - QC', sales: 2050000, growth: 22.3, rating: 4.6, orders: 9200 }
];

// Market Analysis Data
export const marketAnalysis = {
  totalMarketSize: 850000000,
  marketShare: 24.0,
  competitorAnalysis: [
    { name: 'FranchiseHub', share: 24.0, growth: 20.7, color: '#2563eb' },
    { name: 'Competitor A', share: 18.5, growth: 12.3, color: '#dc2626' },
    { name: 'Competitor B', share: 15.2, growth: 8.9, color: '#f59e0b' },
    { name: 'Others', share: 42.3, growth: 5.2, color: '#6b7280' }
  ],
  growthOpportunities: [
    'Digital ordering platform expansion',
    'Premium product line introduction',
    'Regional market penetration',
    'Corporate catering services'
  ]
};

// Customer Demographics
export const customerDemographics = {
  ageGroups: [
    { range: '18-25', percentage: 28, orders: 350000 },
    { range: '26-35', percentage: 35, orders: 437500 },
    { range: '36-45', percentage: 22, orders: 275000 },
    { range: '46-55', percentage: 12, orders: 150000 },
    { range: '55+', percentage: 3, orders: 37500 }
  ],
  preferences: [
    { category: 'Quick Service', percentage: 45 },
    { category: 'Value for Money', percentage: 38 },
    { category: 'Quality Food', percentage: 42 },
    { category: 'Convenience', percentage: 35 },
    { category: 'Healthy Options', percentage: 28 }
  ]
};

// Seasonal Trends Data
export const seasonalTrends = {
  monthly: [
    { month: 'Jan', sales: 15200000, orders: 95000, trend: 'High' },
    { month: 'Feb', sales: 13800000, orders: 86000, trend: 'Medium' },
    { month: 'Mar', sales: 16750000, orders: 105000, trend: 'High' },
    { month: 'Apr', sales: 17200000, orders: 108000, trend: 'High' },
    { month: 'May', sales: 18500000, orders: 116000, trend: 'Peak' },
    { month: 'Jun', sales: 16450000, orders: 103000, trend: 'High' },
    { month: 'Jul', sales: 19200000, orders: 120000, trend: 'Peak' },
    { month: 'Aug', sales: 18800000, orders: 118000, trend: 'Peak' },
    { month: 'Sep', sales: 17600000, orders: 110000, trend: 'High' },
    { month: 'Oct', sales: 16900000, orders: 106000, trend: 'High' },
    { month: 'Nov', sales: 18200000, orders: 114000, trend: 'High' },
    { month: 'Dec', sales: 21400000, orders: 134000, trend: 'Peak' }
  ],
  peakHours: [
    { time: '6AM-9AM', percentage: 15, description: 'Breakfast Rush' },
    { time: '11AM-2PM', percentage: 35, description: 'Lunch Peak' },
    { time: '3PM-5PM', percentage: 20, description: 'Afternoon Snack' },
    { time: '6PM-9PM', percentage: 25, description: 'Dinner Rush' },
    { time: '9PM-12AM', percentage: 5, description: 'Late Night' }
  ]
};

// Financial Projections
export const financialProjections = {
  nextQuarter: {
    projectedRevenue: 58500000,
    projectedGrowth: 23.5,
    confidence: 92
  },
  nextYear: {
    projectedRevenue: 245000000,
    projectedGrowth: 20.1,
    newLocations: 28,
    confidence: 88
  },
  fiveYear: {
    projectedRevenue: 650000000,
    projectedLocations: 250,
    marketShare: 35.0,
    confidence: 75
  }
};

// Operational Metrics
export const operationalMetrics = {
  efficiency: {
    avgOrderTime: 3.2, // minutes
    customerWaitTime: 2.8, // minutes
    orderAccuracy: 98.5, // percentage
    staffProductivity: 94.2 // percentage
  },
  quality: {
    foodQuality: 4.7,
    serviceQuality: 4.6,
    cleanliness: 4.8,
    overallExperience: 4.7
  },
  costs: {
    foodCostPercentage: 28.5,
    laborCostPercentage: 22.3,
    rentCostPercentage: 12.8,
    profitMargin: 18.4
  }
};

// Success Stories for Demo
export const successStories = [
  {
    franchisee: 'Maria Santos',
    location: 'Siomai King - BGC',
    achievement: 'Exceeded annual target by 45%',
    revenue: 2850000,
    story: 'Transformed from struggling startup to top performer in 18 months'
  },
  {
    franchisee: 'Juan Dela Cruz',
    location: 'Coffee Masters - Ortigas',
    achievement: 'Highest customer satisfaction (4.9/5)',
    revenue: 2650000,
    story: 'Built loyal customer base through exceptional service quality'
  },
  {
    franchisee: 'Ana Rodriguez',
    location: 'Burger Express - Makati',
    achievement: 'Fastest growing location (31% growth)',
    revenue: 2420000,
    story: 'Innovative marketing strategies drove unprecedented growth'
  }
];

// Export utility functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

// Generate random realistic data for demos
export const generateRandomGrowth = (base: number, variance: number = 5): number => {
  return base + (Math.random() - 0.5) * variance;
};

export const generateTrendingData = (baseValue: number, periods: number, growth: number = 0.05): number[] => {
  const data = [];
  let current = baseValue;
  
  for (let i = 0; i < periods; i++) {
    current = current * (1 + growth + (Math.random() - 0.5) * 0.02);
    data.push(Math.round(current));
  }
  
  return data;
};
