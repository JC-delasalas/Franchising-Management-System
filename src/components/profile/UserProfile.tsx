
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Camera, Save, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, userProfile, signOut, updateProfile } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    defaultValues: {
      firstName: userProfile?.first_name || '',
      lastName: userProfile?.last_name || '',
      email: userProfile?.email || '',
    }
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!userProfile) return;

    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
      });
      setIsEditing(false);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout?.();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userProfile) {
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
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>User Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileImage} alt={`${userProfile.first_name} ${userProfile.last_name}`} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {userProfile.first_name.charAt(0)}{userProfile.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
              <Camera className="w-3 h-3" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{userProfile.first_name} {userProfile.last_name}</h3>
            <p className="text-gray-600 capitalize">{userProfile.account_type}</p>
          </div>
        </div>

        <Separator />

        {/* Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isEditing}
                        className={!isEditing ? "bg-gray-50" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <div className="space-x-2">
                {!isEditing ? (
                  <Button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>

              <Button 
                type="button" 
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
