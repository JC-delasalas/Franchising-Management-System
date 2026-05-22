
import { useState, useEffect } from 'react';
import { IAMUser, IAMRole, CreateUserData, UpdateUserData } from '@/services/iam/iamTypes';
import { 
  getIAMUsers, 
  getIAMRoles, 
  createIAMUser, 
  updateIAMUser, 
  deleteIAMUser 
} from '@/services/iam/iamService';
import { useToast } from '@/hooks/use-toast';

export const useIAMUsers = () => {
  const [users, setUsers] = useState<IAMUser[]>([]);
  const [roles, setRoles] = useState<IAMRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    setUsers(getIAMUsers());
    setRoles(getIAMRoles());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (userData: CreateUserData) => {
    if (!userData.email || !userData.firstName || !userData.lastName || userData.roleIds.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select at least one role.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await createIAMUser(userData);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadData();
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updateData: UpdateUserData) => {
    setIsLoading(true);
    try {
      const result = await updateIAMUser(userId, updateData);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadData();
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return false;

    setIsLoading(true);
    try {
      const result = await deleteIAMUser(userId);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        loadData();
        return true;
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    roles,
    isLoading,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    loadData
  };
};
