import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { User, Edit, Save, X, LogOut } from 'lucide-react';

interface SimpleUserProfileProps {
  onLogout?: () => void;
}

const SimpleUserProfile: React.FC<SimpleUserProfileProps> = ({ onLogout }) => {
  const { user, logout } = useSimpleAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

  const handleLogout = () => {
    logout();
    onLogout?.();
    window.location.href = '/register';
  };

  const handleSave = () => {
    // In a real implementation, you would update the database here
    // For now, we'll just update localStorage
    if (user) {
      const updatedUser = {
        ...user,
        first_name: editData.first_name,
        last_name: editData.last_name,
        email: editData.email
      };
      localStorage.setItem('franchise_user_session', JSON.stringify(updatedUser));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No user logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>User Profile</span>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="" alt={`${user.first_name} ${user.last_name}`} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
            <p className="text-gray-600 capitalize">{user.account_type}</p>
            <p className="text-sm text-gray-500">Status: {user.status}</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={editData.first_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user.first_name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={editData.last_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user.last_name}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            )}
          </div>

          <div>
            <Label>Account Type</Label>
            <p className="mt-1 text-sm text-gray-900 capitalize">{user.account_type}</p>
          </div>

          <div>
            <Label>User ID</Label>
            <p className="mt-1 text-sm text-gray-500 font-mono">{user.user_id}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleUserProfile;
