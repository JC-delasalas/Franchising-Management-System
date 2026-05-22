// Analytics Utility Functions

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateTargetAchievement = (actual: number, target: number): number => {
  return (actual / target) * 100;
};

export const getPerformanceStatus = (achievement: number): {
  status: string;
  color: string;
  message: string;
} => {
  if (achievement >= 100) {
    return {
      status: 'Exceeding',
      color: 'bg-green-100 text-green-800',
      message: '🎉 Great performance!'
    };
  } else if (achievement >= 80) {
    return {
      status: 'On Track',
      color: 'bg-yellow-100 text-yellow-800',
      message: '📈 Good progress'
    };
  } else {
    return {
      status: 'Below Target',
      color: 'bg-red-100 text-red-800',
      message: '⚠️ Needs attention'
    };
  }
};

export const getProgressBarColor = (achievement: number): string => {
  if (achievement >= 100) return 'bg-green-500';
  if (achievement >= 80) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getGrowthColor = (growth: number): string => {
  return growth > 0 ? 'text-green-600' : 'text-red-600';
};

export const getGrowthIcon = (growth: number): 'up' | 'down' => {
  return growth > 0 ? 'up' : 'down';
};

export const formatGrowth = (growth: number): string => {
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth}%`;
};
