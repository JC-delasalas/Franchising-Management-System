import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle } from 'lucide-react';

interface KPISummaryProps {
  period: 'MTD' | 'QTD' | 'YTD';
  userType?: 'franchisor' | 'franchisee';
}

const KPISummary: React.FC<KPISummaryProps> = ({ period, userType = 'franchisor' }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const insights = {
    franchisor: {
      MTD: {
        totalSales: 13700000,
        growth: 22.1,
        target: 10000000,
        franchisees: 83,
        topPerformer: 'Siomai King - BGC',
        insights: [
          { type: 'success', message: 'Sales exceeded target by 37% - Outstanding performance!' },
          { type: 'success', message: '5 new premium franchisees added this month' },
          { type: 'info', message: 'Network expansion accelerating in Metro Manila' }
        ]
      },
      QTD: {
        totalSales: 44520000,
        growth: 18.9,
        target: 37000000,
        franchisees: 83,
        topPerformer: 'Coffee Masters - Ortigas',
        insights: [
          { type: 'success', message: 'Quarter target exceeded by 20.3% - Record breaking!' },
          { type: 'success', message: 'Best quarter performance in company history' },
          { type: 'success', message: 'Coffee Masters brand leading with 31% growth' }
        ]
      },
      YTD: {
        totalSales: 203990000,
        growth: 20.7,
        target: 179000000,
        franchisees: 97,
        topPerformer: 'Siomai King Network',
        insights: [
          { type: 'success', message: 'Annual target exceeded by ₱25M - Phenomenal year!' },
          { type: 'success', message: '22 new franchisees added - 29% network growth' },
          { type: 'success', message: 'Ready for IPO with ₱200M+ revenue milestone' }
        ]
      }
    },
    franchisee: {
      MTD: {
        totalSales: 1370000,
        growth: 22.1,
        target: 1000000,
        orders: 5854,
        topProduct: 'Siomai King Special',
        insights: [
          { type: 'success', message: 'Monthly target exceeded by 37% - Top performer!' },
          { type: 'success', message: 'Average order value: ₱234 - Premium positioning' },
          { type: 'success', message: 'Customer satisfaction: 4.8/5 stars' }
        ]
      },
      QTD: {
        totalSales: 4452000,
        growth: 18.9,
        target: 3700000,
        orders: 18930,
        topProduct: 'Siomai King Special',
        insights: [
          { type: 'success', message: 'Best quarter in franchise history - Top 3% network!' },
          { type: 'success', message: 'Customer retention rate: 92% - Exceptional loyalty' },
          { type: 'success', message: 'Qualified for Platinum Franchisee status' }
        ]
      },
      YTD: {
        totalSales: 20399000,
        growth: 20.7,
        target: 17900000,
        orders: 86109,
        topProduct: 'Siomai King Special',
        insights: [
          { type: 'success', message: 'Annual target exceeded by ₱2.5M - Elite performer!' },
          { type: 'success', message: 'Top 1% performer in entire network - Hall of Fame!' },
          { type: 'success', message: 'Eligible for ₱500K performance bonus + expansion rights' }
        ]
      }
    }
  };

  const currentData = insights[userType][period];
  const targetAchievement = (currentData.totalSales / currentData.target) * 100;

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
      default:
        return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Performance Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(currentData.totalSales)}
            </div>
            <p className="text-sm text-gray-600">Total Sales ({period})</p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            {currentData.growth > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`font-medium ${currentData.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentData.growth > 0 ? '+' : ''}{currentData.growth}%
            </span>
            <span className="text-gray-600">vs last period</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Target Achievement</span>
              <span className="font-medium">{targetAchievement.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${targetAchievement >= 100 ? 'bg-green-500' : targetAchievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(targetAchievement, 100)}%` }}
              ></div>
            </div>
          </div>

          <Badge className={targetAchievement >= 100 ? 'bg-green-100 text-green-800' : targetAchievement >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
            {targetAchievement >= 100 ? 'Exceeding Target' : targetAchievement >= 80 ? 'On Track' : 'Below Target'}
          </Badge>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(currentData.target)}
              </div>
              <p className="text-xs text-gray-600">Target</p>
            </div>

            {userType === 'franchisor' ? (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {currentData.franchisees}
                </div>
                <p className="text-xs text-gray-600">Active Franchisees</p>
              </div>
            ) : (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {currentData.orders?.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">Total Orders</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {userType === 'franchisor' ? 'Top Performer' : 'Best Product'}
            </p>
            <p className="text-xs text-blue-700">
              {userType === 'franchisor' ? currentData.topPerformer : currentData.topProduct}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentData.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getInsightIcon(insight.type)}
                  <p className="text-sm font-medium">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPISummary;
