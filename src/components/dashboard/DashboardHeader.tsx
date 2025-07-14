
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, PlusCircle, ArrowUp, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import SimpleUserProfile from '@/components/profile/SimpleUserProfile';

interface DashboardHeaderProps {
  showUpgrade: boolean;
  onToggleUpgrade: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  showUpgrade,
  onToggleUpgrade
}) => {
  const [showProfile, setShowProfile] = useState(false);
  const { user } = useSimpleAuth();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user ? `${user.first_name}!` : 'User!'}
        </h1>
        <p className="text-gray-600">
          {user?.account_type === 'franchisor' ? 'Franchise Management Portal' : 'Franchise Dashboard'}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <Dialog open={showProfile} onOpenChange={setShowProfile}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            <SimpleUserProfile onLogout={() => setShowProfile(false)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleUpgrade}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none hover:from-purple-700 hover:to-pink-700"
        >
          <ArrowUp className="w-4 h-4 mr-2" />
          Upgrade Package
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/franchisee/support-requests">
            <Bell className="w-4 h-4 mr-2" />
            Support
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/franchisee/sales-upload">
            <PlusCircle className="w-4 h-4 mr-2" />
            Upload Sales
          </Link>
        </Button>
      </div>
    </div>
  );
};
