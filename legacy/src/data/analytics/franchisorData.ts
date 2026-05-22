// Franchisor Analytics Mock Data
export type PeriodType = 'MTD' | 'QTD' | 'YTD';

export interface SalesDataPoint {
  name: string;
  sales: number;
  target: number;
  franchisees: number;
  growth: number;
}

export interface BrandPerformanceData {
  name: string;
  value: number;
  sales: number;
  color: string;
  growth: number;
  locations: number;
  avgRevenue: number;
  topProduct: string;
}

export interface NetworkProductData {
  name: string;
  sales: number;
  orders: number;
  brands: number;
  avgPrice: number;
  category: string;
}

export interface RegionalData {
  region: string;
  sales: number;
  franchisees: number;
  growth: number;
  topBrand: string;
}

export interface FranchisorKPIData {
  totalSales: number;
  growth: number;
  target: number;
  franchisees: number;
  avgPerFranchisee: number;
  newFranchisees: number;
  topPerformer: string;
}

// Enhanced mock data with realistic business patterns
export const generateSalesData = (period: PeriodType): SalesDataPoint[] => {
  const baseData = {
    MTD: [
      { name: 'Week 1', sales: 2850000, target: 2500000, franchisees: 78, growth: 18.5 },
      { name: 'Week 2', sales: 3420000, target: 2500000, franchisees: 79, growth: 22.8 },
      { name: 'Week 3', sales: 3180000, target: 2500000, franchisees: 81, growth: 19.2 },
      { name: 'Week 4', sales: 4250000, target: 2500000, franchisees: 83, growth: 28.4 }
    ],
    QTD: [
      { name: 'January', sales: 12850000, target: 11500000, franchisees: 78, growth: 15.2 },
      { name: 'February', sales: 14920000, target: 12000000, franchisees: 81, growth: 18.7 },
      { name: 'March', sales: 16750000, target: 13500000, franchisees: 83, growth: 22.4 }
    ],
    YTD: [
      { name: 'Q1 2024', sales: 44520000, target: 37000000, franchisees: 83, growth: 20.3 },
      { name: 'Q2 2024', sales: 52150000, target: 42000000, franchisees: 89, growth: 24.2 },
      { name: 'Q3 2024', sales: 58420000, target: 48000000, franchisees: 94, growth: 21.8 },
      { name: 'Q4 2024', sales: 48900000, target: 52000000, franchisees: 97, growth: 16.5 }
    ]
  };
  return baseData[period];
};

export const brandPerformanceData: BrandPerformanceData[] = [
  { name: 'Siomai King', value: 38, sales: 77520000, color: '#ef4444', growth: 24.5, locations: 32, avgRevenue: 2422500, topProduct: 'Siomai King Special' },
  { name: 'Coffee Masters', value: 29, sales: 59157000, color: '#f59e0b', growth: 31.2, locations: 25, avgRevenue: 2366280, topProduct: 'Premium Iced Coffee' },
  { name: 'Burger Express', value: 21, sales: 42838000, color: '#10b981', growth: 18.7, locations: 19, avgRevenue: 2254631, topProduct: 'Signature Burger' },
  { name: 'Fresh Juice Bar', value: 12, sales: 24479000, color: '#8b5cf6', growth: 22.1, locations: 15, avgRevenue: 1631933, topProduct: 'Fresh Lemonade' }
];

// Network-wide product performance
export const networkProductData: NetworkProductData[] = [
  { name: 'Siomai King Special', sales: 28650000, orders: 125600, brands: 32, avgPrice: 228, category: 'Signature' },
  { name: 'Premium Iced Coffee', sales: 22340000, orders: 142800, brands: 25, avgPrice: 156, category: 'Beverages' },
  { name: 'Signature Burger', sales: 18920000, orders: 78400, brands: 19, avgPrice: 241, category: 'Meals' },
  { name: 'Spicy Siomai Deluxe', sales: 16780000, orders: 72300, brands: 32, avgPrice: 232, category: 'Signature' },
  { name: 'Premium Rice Bowls', sales: 14560000, orders: 58900, brands: 19, avgPrice: 247, category: 'Meals' },
  { name: 'Fresh Lemonade', sales: 12890000, orders: 84600, brands: 15, avgPrice: 152, category: 'Beverages' },
  { name: 'Chicken Teriyaki', sales: 11230000, orders: 47800, brands: 19, avgPrice: 235, category: 'Meals' },
  { name: 'Iced Tea Premium', sales: 9870000, orders: 65800, brands: 25, avgPrice: 150, category: 'Beverages' }
];

// Regional performance data
export const regionalData: RegionalData[] = [
  { region: 'Metro Manila', sales: 89650000, franchisees: 42, growth: 28.4, topBrand: 'Siomai King' },
  { region: 'Cebu', sales: 45230000, franchisees: 18, growth: 31.2, topBrand: 'Coffee Masters' },
  { region: 'Davao', sales: 32180000, franchisees: 15, growth: 24.7, topBrand: 'Burger Express' },
  { region: 'Iloilo', sales: 21890000, franchisees: 12, growth: 26.1, topBrand: 'Fresh Juice Bar' },
  { region: 'Baguio', sales: 15040000, franchisees: 10, growth: 22.3, topBrand: 'Coffee Masters' }
];

export const franchisorKpiData: Record<PeriodType, FranchisorKPIData> = {
  MTD: {
    totalSales: 13700000,
    growth: 22.1,
    target: 10000000,
    franchisees: 83,
    avgPerFranchisee: 165060,
    newFranchisees: 5,
    topPerformer: 'Siomai King - BGC'
  },
  QTD: {
    totalSales: 44520000,
    growth: 18.9,
    target: 37000000,
    franchisees: 83,
    avgPerFranchisee: 536385,
    newFranchisees: 8,
    topPerformer: 'Coffee Masters - Ortigas'
  },
  YTD: {
    totalSales: 203990000,
    growth: 20.7,
    target: 179000000,
    franchisees: 97,
    avgPerFranchisee: 2103000,
    newFranchisees: 22,
    topPerformer: 'Siomai King Network'
  }
};
