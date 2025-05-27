import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InsightCardProps {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  icon,
  gradient,
  children
}) => {
  return (
    <Card className={`border-0 shadow-xl ${gradient}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface RegionalLeaderItemProps {
  region: string;
  franchisees: number;
  sales: number;
  growth: number;
  formatCurrency: (value: number) => string;
}

export const RegionalLeaderItem: React.FC<RegionalLeaderItemProps> = ({
  region,
  franchisees,
  sales,
  growth,
  formatCurrency
}) => (
  <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
    <div>
      <p className="font-bold text-gray-800">{region}</p>
      <p className="text-sm text-gray-600">{franchisees} locations</p>
    </div>
    <div className="text-right">
      <p className="font-bold text-lg">{formatCurrency(sales)}</p>
      <p className="text-sm text-green-600">+{growth}%</p>
    </div>
  </div>
);

interface ChampionProductProps {
  productName: string;
  revenue: number;
  badges: Array<{ text: string; color: string }>;
  formatCurrency: (value: number) => string;
}

export const ChampionProduct: React.FC<ChampionProductProps> = ({
  productName,
  revenue,
  badges,
  formatCurrency
}) => (
  <div className="text-center space-y-4">
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <div className="text-2xl font-bold text-gray-800">{productName}</div>
      <div className="text-3xl font-bold text-yellow-600 mt-2">{formatCurrency(revenue)}</div>
      <p className="text-gray-600 mt-1">Network Revenue (YTD)</p>
      <div className="flex justify-center space-x-4 mt-4">
        {badges.map((badge, index) => (
          <Badge key={index} className={`${badge.color} px-3 py-1`}>
            {badge.text}
          </Badge>
        ))}
      </div>
    </div>
  </div>
);

interface GrowthMetricProps {
  label: string;
  value: string;
  color: string;
}

export const GrowthMetric: React.FC<GrowthMetricProps> = ({
  label,
  value,
  color
}) => (
  <div className="p-4 bg-white rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  </div>
);

export default InsightCard;
