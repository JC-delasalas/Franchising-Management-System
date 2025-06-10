
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IAMUserManagement } from './IAMUserManagement';
import { IAMRoleManagement } from './IAMRoleManagement';
import { Users, Shield, UserCheck, Clock } from 'lucide-react';

export const IAMDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* IAM Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">75% of total users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+4 system roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Main IAM Management Interface */}
      <Tabs defaultValue="users" className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-lg p-1 gap-1">
            <TabsTrigger
              value="users"
              className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
            >
              <Users className="w-4 h-4 mr-2" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger
              value="roles"
              className="flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 hover:bg-white/50"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span>Role Management</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
