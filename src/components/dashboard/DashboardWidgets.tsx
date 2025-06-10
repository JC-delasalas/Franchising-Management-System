
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  AlertTriangle,
  Clock,
  Target,
  Zap,
  Activity
} from 'lucide-react';

interface WidgetData {
  sales: { date: string; amount: number; target: number }[];
  customers: { month: string; new: number; returning: number }[];
  revenue: { category: string; amount: number; color: string }[];
  performance: { metric: string; current: number; target: number; trend: 'up' | 'down' }[];
  alerts: { id: string; type: 'warning' | 'error' | 'info'; message: string; time: string }[];
  liveMetrics: { visitors: number; sales: number; conversion: number };
}

// Mock real-time data generator
const generateMockData = (): WidgetData => {
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 5000) + 1000,
      target: 4000
    };
  }).reverse();

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      new: Math.floor(Math.random() * 100) + 50,
      returning: Math.floor(Math.random() * 80) + 30
    };
  }).reverse();

  return {
    sales: last7Days,
    customers: last6Months,
    revenue: [
      { category: 'Food Sales', amount: 45000, color: '#8884d8' },
      { category: 'Beverages', amount: 25000, color: '#82ca9d' },
      { category: 'Merchandise', amount: 15000, color: '#ffc658' },
      { category: 'Delivery', amount: 10000, color: '#ff7300' }
    ],
    performance: [
      { metric: 'Monthly Revenue', current: 85000, target: 100000, trend: 'up' },
      { metric: 'Customer Satisfaction', current: 92, target: 95, trend: 'up' },
      { metric: 'Order Fulfillment', current: 88, target: 90, trend: 'down' },
      { metric: 'Inventory Turnover', current: 75, target: 80, trend: 'up' }
    ],
    alerts: [
      { id: '1', type: 'warning', message: 'Low inventory: Siomai packs', time: '2 hours ago' },
      { id: '2', type: 'info', message: 'New customer feedback received', time: '4 hours ago' },
      { id: '3', type: 'error', message: 'Payment processing delay', time: '6 hours ago' }
    ],
    liveMetrics: {
      visitors: Math.floor(Math.random() * 50) + 20,
      sales: Math.floor(Math.random() * 10) + 5,
      conversion: Math.floor(Math.random() * 5) + 2
    }
  };
};

export const DashboardWidgets: React.FC = () => {
  const [data, setData] = useState<WidgetData>(generateMockData());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setData(prev => ({
          ...prev,
          liveMetrics: {
            visitors: Math.floor(Math.random() * 50) + 20,
            sales: Math.floor(Math.random() * 10) + 5,
            conversion: Math.floor(Math.random() * 5) + 2
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLive]);

  const MetricCard: React.FC<{ 
    title: string; 
    value: string | number; 
    change?: string; 
    trend?: 'up' | 'down';
    icon: React.ReactNode;
    live?: boolean;
  }> = ({ title, value, change, trend, icon, live }) => (
    <Card className={`relative ${live ? 'border-green-200 bg-green-50' : ''}`}>
      {live && (
        <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1">
          LIVE
        </Badge>
      )}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="text-blue-600">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Live Metrics */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Dashboard</h3>
        <Button
          variant={isLive ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsLive(!isLive)}
        >
          <Activity className="w-4 h-4 mr-2" />
          {isLive ? 'Live' : 'Paused'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Active Visitors"
          value={data.liveMetrics.visitors}
          icon={<Users className="w-6 h-6" />}
          live={isLive}
        />
        <MetricCard
          title="Orders Today"
          value={data.liveMetrics.sales}
          icon={<ShoppingCart className="w-6 h-6" />}
          live={isLive}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${data.liveMetrics.conversion}%`}
          icon={<Target className="w-6 h-6" />}
          live={isLive}
        />
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.performance.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {metric.current.toLocaleString()} / {metric.target.toLocaleString()}
                    </span>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={(metric.current / metric.target) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
          <TabsTrigger value="customers">Customer Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Mix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="target" stroke="#e5e7eb" fill="#f3f4f6" />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.customers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="new" fill="#3b82f6" />
                  <Bar dataKey="returning" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.revenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {data.revenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Recent Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'error' ? 'bg-red-500' :
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
