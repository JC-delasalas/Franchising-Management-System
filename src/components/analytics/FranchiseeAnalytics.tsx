import React from 'react';
import { DollarSign, ShoppingCart, Target, Award, TrendingUp } from 'lucide-react';
import { useFranchiseeAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency, getPerformanceStatus } from '@/utils/analytics';
import PeriodSelector from './ui/PeriodSelector';
import KPICard from './ui/KPICard';
import InsightCard, { ChampionProduct, GrowthMetric } from './ui/InsightCard';
import KPISummary from './KPISummary';

interface FranchiseeAnalyticsProps {
  franchiseeName?: string;
}

const FranchiseeAnalytics: React.FC<FranchiseeAnalyticsProps> = ({
  franchiseeName = "Siomai King - Makati Branch"
}) => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    currentKPI,
    targetAchievement,
    productDataToUse
  } = useFranchiseeAnalytics();

  const performanceStatus = getPerformanceStatus(targetAchievement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Performance Dashboard</h2>
          <p className="text-gray-600">{franchiseeName}</p>
        </div>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          title=""
        />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPICard
          title={`Sales (${selectedPeriod})`}
          value={currentKPI.totalSales}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          growth={currentKPI.growth}
        />

        <KPICard
          title="Target Achievement"
          value={`${targetAchievement.toFixed(1)}%`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          subtitle={`Target: ${formatCurrency(currentKPI.target)}`}
          target={currentKPI.target}
          showProgress={true}
        />

        <KPICard
          title="Total Orders"
          value={currentKPI.orders.toLocaleString()}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          subtitle={`Avg: ${formatCurrency(currentKPI.avgOrderValue)} per order`}
        />

        <KPICard
          title="Performance Status"
          value=""
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
          subtitle={`Top Product: ${currentKPI.topProduct}`}
          badge={{
            text: performanceStatus.status,
            color: performanceStatus.color
          }}
        />
      </div>



      {/* Business Insights - Streamlined */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Performance Status */}
        <InsightCard
          title="Performance Status"
          icon={<Target className="w-6 h-6 mr-3 text-purple-600" />}
          gradient="bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <div className="text-center space-y-4">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{targetAchievement.toFixed(1)}%</div>
              <p className="text-gray-600 mt-1">Target Achievement</p>
              <div className={`mt-3 px-4 py-2 rounded-full text-sm font-medium ${performanceStatus.color}`}>
                {performanceStatus.status}
              </div>
            </div>
          </div>
        </InsightCard>

        {/* Star Product */}
        <InsightCard
          title="Star Product"
          icon={<Award className="w-6 h-6 mr-3 text-yellow-600" />}
          gradient="bg-gradient-to-br from-yellow-50 to-orange-50"
        >
          <ChampionProduct
            productName="Siomai King Special"
            revenue={productDataToUse[0]?.sales || 0}
            badges={[
              { text: "38% of sales", color: "bg-green-100 text-green-800" },
              { text: "4.9★ rating", color: "bg-blue-100 text-blue-800" }
            ]}
            formatCurrency={formatCurrency}
          />
        </InsightCard>

        {/* Growth Metrics */}
        <InsightCard
          title="Growth Highlights"
          icon={<TrendingUp className="w-6 h-6 mr-3 text-emerald-600" />}
          gradient="bg-gradient-to-br from-emerald-50 to-teal-50"
        >
          <div className="space-y-4">
            <GrowthMetric
              label="Revenue Growth"
              value={`+${currentKPI.growth}%`}
              color="text-emerald-600"
            />
            <GrowthMetric
              label="Avg Order Value"
              value={formatCurrency(currentKPI.avgOrderValue)}
              color="text-blue-600"
            />
            <GrowthMetric
              label="Customer Rating"
              value={`${currentKPI.customerSatisfaction}★`}
              color="text-purple-600"
            />
          </div>
        </InsightCard>
      </div>

      {/* KPI Summary */}
      <div className="mt-8">
        <KPISummary period={selectedPeriod} userType="franchisee" />
      </div>
    </div>
  );
};

export default FranchiseeAnalytics;
