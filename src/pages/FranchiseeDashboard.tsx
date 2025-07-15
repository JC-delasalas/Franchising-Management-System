
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsAPI } from '@/api/analytics';
import { FranchiseAPI } from '@/api/franchises';
import { useAuth } from '@/hooks/useAuth';
import ChatAssistant from '@/components/ChatAssistant';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { MilestonesSection } from '@/components/dashboard/MilestonesSection';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';

const FranchiseeDashboard = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user } = useAuth();

  // Get the user's primary location ID for KPI data
  const locationId = user?.metadata?.primary_location_id;

  // Fetch user's franchise locations
  const { data: locations } = useQuery({
    queryKey: ['franchise-locations', user?.id],
    queryFn: () => FranchiseAPI.getLocationsByFranchisee(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Use first location if no primary location set
  const effectiveLocationId = locationId || locations?.[0]?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <DashboardHeader 
            showUpgrade={showUpgrade}
            onToggleUpgrade={() => setShowUpgrade(!showUpgrade)}
          />

          {/* Upgrade Package Banner */}
          <UpgradeBanner showUpgrade={showUpgrade} onClose={() => setShowUpgrade(false)} />

          {/* KPI Cards */}
          <KPICards locationId={effectiveLocationId} />

          {/* Milestones Section */}
          <MilestonesSection />

          {/* Main Tabs */}
          <DashboardTabs />
        </div>
      </div>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default FranchiseeDashboard;
