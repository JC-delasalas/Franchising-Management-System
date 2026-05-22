// Franchisee Analytics Mock Data
export type PeriodType = 'MTD' | 'QTD' | 'YTD';

export interface SalesDataPoint {
  name: string;
  sales: number;
  target: number;
  orders: number;
  avgOrder: number;
  growth: number;
}

export interface ProductDataPoint {
  name: string;
  sales: number;
  orders: number;
  percentage: number;
  growth: number;
  profit: number;
  rating: number;
  category: string;
}

export interface KPIData {
  totalSales: number;
  growth: number;
  target: number;
  orders: number;
  avgOrderValue: number;
  topProduct: string;
  ranking: string;
  customerSatisfaction: number;
}

// Enhanced franchisee analytics with impressive demo data
export const generateFranchiseeSalesData = (period: PeriodType): SalesDataPoint[] => {
  const baseData = {
    MTD: [
      { name: 'Week 1', sales: 285000, target: 250000, orders: 1245, avgOrder: 229, growth: 18.5 },
      { name: 'Week 2', sales: 342000, target: 250000, orders: 1468, avgOrder: 233, growth: 22.8 },
      { name: 'Week 3', sales: 318000, target: 250000, orders: 1352, avgOrder: 235, growth: 19.2 },
      { name: 'Week 4', sales: 425000, target: 250000, orders: 1789, avgOrder: 238, growth: 28.4 }
    ],
    QTD: [
      { name: 'January', sales: 1285000, target: 1150000, orders: 5643, avgOrder: 228, growth: 15.2 },
      { name: 'February', sales: 1492000, target: 1200000, orders: 6298, avgOrder: 237, growth: 18.7 },
      { name: 'March', sales: 1675000, target: 1350000, orders: 6989, avgOrder: 240, growth: 22.4 }
    ],
    YTD: [
      { name: 'Q1 2024', sales: 4452000, target: 3700000, orders: 18930, avgOrder: 235, growth: 20.3 },
      { name: 'Q2 2024', sales: 5215000, target: 4200000, orders: 21987, avgOrder: 237, growth: 24.2 },
      { name: 'Q3 2024', sales: 5842000, target: 4800000, orders: 24591, avgOrder: 238, growth: 21.8 },
      { name: 'Q4 2024', sales: 4890000, target: 5200000, orders: 20601, avgOrder: 237, growth: 16.5 }
    ]
  };
  return baseData[period];
};

// Enhanced product performance data with comprehensive metrics
export const generateProductData = (period: PeriodType): ProductDataPoint[] => {
  const baseData = {
    MTD: [
      { name: 'Siomai King Special', sales: 520000, orders: 2156, percentage: 38, growth: 24.5, profit: 187200, rating: 4.9, category: 'Signature' },
      { name: 'Spicy Siomai Deluxe', sales: 370000, orders: 1642, percentage: 27, growth: 31.2, profit: 133200, rating: 4.8, category: 'Signature' },
      { name: 'Premium Rice Meals', sales: 274000, orders: 1012, percentage: 20, growth: 18.7, profit: 93160, rating: 4.7, category: 'Meals' },
      { name: 'Fresh Beverages', sales: 206000, orders: 1044, percentage: 15, growth: 22.1, profit: 82400, rating: 4.6, category: 'Beverages' }
    ],
    QTD: [
      { name: 'Siomai King Special', sales: 1692000, orders: 7256, percentage: 38, growth: 24.5, profit: 609120, rating: 4.9, category: 'Signature' },
      { name: 'Spicy Siomai Deluxe', sales: 1202000, orders: 5892, percentage: 27, growth: 31.2, profit: 432720, rating: 4.8, category: 'Signature' },
      { name: 'Premium Rice Meals', sales: 890000, orders: 3634, percentage: 20, growth: 18.7, profit: 320400, rating: 4.7, category: 'Meals' },
      { name: 'Fresh Beverages', sales: 668000, orders: 4124, percentage: 15, growth: 22.1, profit: 267200, rating: 4.6, category: 'Beverages' }
    ],
    YTD: [
      { name: 'Siomai King Special', sales: 7751000, orders: 32856, percentage: 38, growth: 24.5, profit: 2790360, rating: 4.9, category: 'Signature' },
      { name: 'Spicy Siomai Deluxe', sales: 5508000, orders: 26742, percentage: 27, growth: 31.2, profit: 1982880, rating: 4.8, category: 'Signature' },
      { name: 'Premium Rice Meals', sales: 4080000, orders: 16489, percentage: 20, growth: 18.7, profit: 1468800, rating: 4.7, category: 'Meals' },
      { name: 'Fresh Beverages', sales: 3060000, orders: 18722, percentage: 15, growth: 22.1, profit: 1224000, rating: 4.6, category: 'Beverages' }
    ]
  };
  return baseData[period];
};

export const franchiseeKpiData: Record<PeriodType, KPIData> = {
  MTD: {
    totalSales: 1370000,
    growth: 22.1,
    target: 1000000,
    orders: 5854,
    avgOrderValue: 234,
    topProduct: 'Siomai King Special',
    ranking: 'Top 5%',
    customerSatisfaction: 4.8
  },
  QTD: {
    totalSales: 4452000,
    growth: 18.9,
    target: 3700000,
    orders: 18930,
    avgOrderValue: 235,
    topProduct: 'Siomai King Special',
    ranking: 'Top 3%',
    customerSatisfaction: 4.9
  },
  YTD: {
    totalSales: 20399000,
    growth: 20.7,
    target: 17900000,
    orders: 86109,
    avgOrderValue: 237,
    topProduct: 'Siomai King Special',
    ranking: 'Top 1%',
    customerSatisfaction: 4.9
  }
};

// Additional product categories for comprehensive visualization
export const productCategoryData = [
  { category: 'Signature Items', sales: 13259000, percentage: 65, items: 8, avgPrice: 185 },
  { category: 'Rice Meals', sales: 4080000, percentage: 20, items: 12, avgPrice: 247 },
  { category: 'Beverages', sales: 3060000, percentage: 15, items: 15, avgPrice: 163 }
];

// Top selling items across all categories
export const topSellingItems = [
  { name: 'Siomai King Special (6pcs)', sales: 2890000, orders: 12456, price: 232, category: 'Signature' },
  { name: 'Spicy Siomai Deluxe (6pcs)', sales: 2618000, orders: 11287, price: 232, category: 'Signature' },
  { name: 'Premium Beef Rice Bowl', sales: 1845000, orders: 7234, price: 255, category: 'Meals' },
  { name: 'Chicken Teriyaki Rice', sales: 1634000, orders: 6892, price: 237, category: 'Meals' },
  { name: 'Fresh Lemonade (Large)', sales: 1289000, orders: 8456, price: 152, category: 'Beverages' },
  { name: 'Iced Coffee Premium', sales: 1156000, orders: 7234, price: 160, category: 'Beverages' },
  { name: 'Siomai King Combo', sales: 1089000, orders: 4567, price: 238, category: 'Signature' },
  { name: 'Pork Sisig Rice', sales: 967000, orders: 4123, price: 234, category: 'Meals' }
];

// Product performance trends over time
export const productTrendData = [
  { month: 'Jan', siomaiSpecial: 2450000, spicyDeluxe: 1890000, riceMeals: 1234000, beverages: 987000 },
  { month: 'Feb', siomaiSpecial: 2680000, spicyDeluxe: 2100000, riceMeals: 1345000, beverages: 1089000 },
  { month: 'Mar', siomaiSpecial: 2890000, spicyDeluxe: 2280000, riceMeals: 1456000, beverages: 1178000 },
  { month: 'Apr', siomaiSpecial: 3120000, spicyDeluxe: 2450000, riceMeals: 1567000, beverages: 1267000 },
  { month: 'May', siomaiSpecial: 3350000, spicyDeluxe: 2620000, riceMeals: 1678000, beverages: 1356000 },
  { month: 'Jun', siomaiSpecial: 3180000, spicyDeluxe: 2580000, riceMeals: 1634000, beverages: 1289000 }
];
