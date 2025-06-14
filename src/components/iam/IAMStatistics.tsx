
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIAMStatistics } from '@/hooks/useIAMStatistics';
import { 
  Users, 
  UserCheck, 
  UserClock, 
  Shield,
  ShieldCheck,
  TrendingUp 
} from 'lucide-react';

export const IAMStatistics: React.FC = () => {
  const {
    totalUsers,
    activeUsers,
    pendingUsers,
    customRoles,
    systemRoles,
    activeUserPercentage
  } = useIAMStatistics();

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      badge: `${activeUserPercentage}%`
    },
    {
      title: 'Pending Users',
      value: pendingUsers,
      icon: UserClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Custom Roles',
      value: customRoles,
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      badge: `${systemRoles} system`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {stat.badge}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
