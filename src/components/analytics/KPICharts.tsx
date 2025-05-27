import React from 'react';
import { DollarSign, Users, Package, Target, Award, TrendingUp } from 'lucide-react';
import { useFranchisorAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency, getPerformanceStatus } from '@/utils/analytics';
import PeriodSelector from './ui/PeriodSelector';
import KPICard from './ui/KPICard';
import InsightCard, { RegionalLeaderItem, ChampionProduct, GrowthMetric } from './ui/InsightCard';
import KPISummary from './KPISummary';

interface KPIChartsProps {
  userType?: 'franchisor' | 'franchisee';
}

const KPICharts: React.FC<KPIChartsProps> = ({ userType = 'franchisor' }) => {
  const {
    selectedPeriod,
    setSelectedPeriod,
    currentKPI,
    targetAchievement,
    regionalDataToUse
  } = useFranchisorAnalytics();

  const performanceStatus = getPerformanceStatus(targetAchievement);

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        title="Analytics Dashboard"
      />

      {/* KPI Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPICard
          title={`Total Sales (${selectedPeriod})`}
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
          title="Active Franchisees"
          value={currentKPI.franchisees.toString()}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          subtitle={`Avg: ${formatCurrency(currentKPI.avgPerFranchisee)} per franchisee`}
        />

        <KPICard
          title="Performance Status"
          value=""
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          subtitle={performanceStatus.message}
          badge={{
            text: performanceStatus.status,
            color: performanceStatus.color
          }}
        />
      </div>



      {/* Key Business Insights - Streamlined */}
      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Regional Performance */}
        <InsightCard
          title="Regional Leaders"
          icon={<Target className="w-6 h-6 mr-3 text-purple-600" />}
          gradient="bg-gradient-to-br from-purple-50 to-pink-50"
        >
          <div className="space-y-4">
            {regionalDataToUse.slice(0, 3).map((region, index) => (
              <RegionalLeaderItem
                key={index}
                region={region.region}
                franchisees={region.franchisees}
                sales={region.sales}
                growth={region.growth}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </InsightCard>

        {/* Network Champion */}
        <InsightCard
          title="Network Champion"
          icon={<Award className="w-6 h-6 mr-3 text-yellow-600" />}
          gradient="bg-gradient-to-br from-yellow-50 to-orange-50"
        >
          <ChampionProduct
            productName="Siomai King Special"
            revenue={28650000}
            badges={[
              { text: "125.6K Orders", color: "bg-green-100 text-green-800" },
              { text: "32 Locations", color: "bg-blue-100 text-blue-800" }
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
              label="Network Growth"
              value="+26.8%"
              color="text-emerald-600"
            />
            <GrowthMetric
              label="New Franchisees"
              value="+18"
              color="text-blue-600"
            />
            <GrowthMetric
              label="Product Portfolio"
              value="156"
              color="text-purple-600"
            />
          </div>
        </InsightCard>
      </div>

      {/* KPI Summary */}
      <div className="mt-8">
        <KPISummary period={selectedPeriod} userType={userType} />
      </div>
    </div>
  );
};

export default KPICharts;
