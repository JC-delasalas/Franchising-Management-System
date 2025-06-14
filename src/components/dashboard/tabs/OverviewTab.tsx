
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  ShoppingCart,
  Download,
  BookOpen
} from 'lucide-react';

const notices = [
  { title: 'New Product Launch', message: 'Introducing Spicy Siomai variant - now available for order!', date: '2024-01-15', type: 'info' },
  { title: 'Training Reminder', message: 'Monthly compliance training due by January 20th', date: '2024-01-14', type: 'warning' },
  { title: 'Promotion Update', message: 'Valentine\'s Day promo materials now ready for download', date: '2024-01-13', type: 'success' }
];

const getNoticeType = (type: string) => {
  switch (type) {
    case 'info': return 'bg-blue-100 text-blue-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'success': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const OverviewTab: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/sales-upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Today's Sales Report
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/inventory-order">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Order Inventory Items
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee/marketing-assets">
              <Download className="w-4 h-4 mr-2" />
              Download Marketing Materials
            </Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" asChild>
            <Link to="/franchisee-training">
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Training Modules
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements & Notices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notices.map((notice, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{notice.title}</h4>
                  <Badge className={getNoticeType(notice.type)}>
                    {notice.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notice.message}</p>
                <p className="text-xs text-gray-500">{notice.date}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
