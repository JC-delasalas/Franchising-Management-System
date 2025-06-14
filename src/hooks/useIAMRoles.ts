
import { useState, useEffect } from 'react';
import { IAMRole, IAMPermission } from '@/services/iam/iamTypes';
import { 
  getIAMRoles, 
  getAllPermissions, 
  createCustomRole, 
  updateRole, 
  deleteRole 
} from '@/services/iam/iamService';
import { useToast } from '@/hooks/use-toast';

export const useIAMRoles = () => {
  const [roles, setRoles] = useState<IAMRole[]>([]);
  const [permissions, setPermissions] = useState<IAMPermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadData = () => {
    setRoles(getIAMRoles());
    setPermissions(getAllPermissions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRole = async (roleData: { name: string; description: string; permissions: IAMPermission[] }) => {
    if (!roleData.name || !roleData.description || roleData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select at least one permission.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const result = await createCustomRole(roleData);
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
        description: "Failed to create role",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (roleId: string, roleData: Partial<IAMRole>) => {
    setIsLoading(true);
    try {
      const result = await updateRole(roleId, roleData);
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
        description: "Failed to update role",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return false;

    setIsLoading(true);
    try {
      const result = await deleteRole(roleId);
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
        description: "Failed to delete role",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    roles,
    permissions,
    isLoading,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    loadData
  };
};
