
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IAMUserManagement } from './IAMUserManagement';
import { IAMRoleManagement } from './IAMRoleManagement';
import { IAMStatistics } from './IAMStatistics';
import { IAMLoadingSkeleton } from './IAMLoadingSkeleton';
import { useIAMUsers } from '@/hooks/useIAMUsers';
import { useIAMRoles } from '@/hooks/useIAMRoles';
import { Users, Shield, BarChart3 } from 'lucide-react';

export const IAMDashboard: React.FC = () => {
  const { users, isLoading: usersLoading } = useIAMUsers();
  const { roles, isLoading: rolesLoading } = useIAMRoles();
  
  const isLoading = usersLoading || rolesLoading;

  if (isLoading) {
    return <IAMLoadingSkeleton type="dashboard" />;
  }

  return (
    <div className="space-y-6">
      <IAMStatistics />
      
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users ({users.length})</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Roles ({roles.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <IAMUserManagement />
        </TabsContent>
        
        <TabsContent value="roles">
          <IAMRoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
