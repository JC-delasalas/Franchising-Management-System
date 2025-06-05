
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, TrendingUp, Package } from 'lucide-react';

interface SalesData {
  today: string;
  thisWeek: string;
  thisMonth: string;
  target: string;
}

interface KPICardsProps {
  salesData: SalesData;
}

const KPICards: React.FC<KPICardsProps> = ({ salesData }) => {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{salesData.today}</div>
          <p className="text-xs text-muted-foreground">+15% from yesterday</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{salesData.thisWeek}</div>
          <p className="text-xs text-muted-foreground">+28% from last week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{salesData.thisMonth}</div>
          <p className="text-xs text-muted-foreground">Target: {salesData.target} (+37%)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">2 Low</div>
          <p className="text-xs text-muted-foreground">Items need reordering</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
