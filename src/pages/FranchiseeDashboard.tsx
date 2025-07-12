
import { useState, useEffect } from 'react';
import ChatAssistant from '@/components/ChatAssistant';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { KPICards } from '@/components/dashboard/KPICards';
import { MilestonesSection } from '@/components/dashboard/MilestonesSection';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import { useAuth } from '@/hooks/useAuth';

const FranchiseeDashboard = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { user, signIn } = useAuth();

  // Auto-login demo user for testing functionality
  useEffect(() => {
    if (!user) {
      console.log('Auto-logging in demo user for testing...');
      signIn('demo@franchisee.com', 'demo123').catch(console.error);
    }
  }, [user, signIn]);

  const salesData = {
    today: '₱45,250',
    thisWeek: '₱342,100',
    thisMonth: '₱1,370,000',
    target: '₱1,000,000'
  };

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
          <KPICards salesData={salesData} />

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
