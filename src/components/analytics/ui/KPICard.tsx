import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, getGrowthColor, formatGrowth, getProgressBarColor } from '@/utils/analytics';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  growth?: number;
  target?: number;
  showProgress?: boolean;
  badge?: {
    text: string;
    color: string;
  };
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  subtitle,
  growth,
  target,
  showProgress = false,
  badge
}) => {
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value;
  const achievement = target ? (Number(value) / target) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        
        {growth !== undefined && (
          <div className="flex items-center space-x-2 text-xs">
            {growth > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={getGrowthColor(growth)}>
              {formatGrowth(growth)} vs last period
            </span>
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}

        {target && (
          <div className="text-xs text-muted-foreground">
            Target: {formatCurrency(target)}
          </div>
        )}

        {showProgress && target && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${getProgressBarColor(achievement)}`}
              style={{ width: `${Math.min(achievement, 100)}%` }}
            ></div>
          </div>
        )}

        {badge && (
          <Badge className={`mt-2 ${badge.color}`}>
            {badge.text}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
