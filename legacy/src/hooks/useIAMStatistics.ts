
import { useMemo } from 'react';
import { useIAMUsers } from './useIAMUsers';
import { useIAMRoles } from './useIAMRoles';
import { useErrorRecovery } from './useErrorRecovery';

export const useIAMStatistics = () => {
  const { users, isLoading: usersLoading, loadData: loadUsers } = useIAMUsers();
  const { roles, isLoading: rolesLoading, loadData: loadRoles } = useIAMRoles();

  const { error, retryCount, handleError, retry, reset } = useErrorRecovery({
    maxRetries: 3,
    onError: (err) => console.error('IAM Statistics error:', err)
  });

  const isLoading = usersLoading || rolesLoading;

  const statistics = useMemo(() => {
    try {
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      const pendingUsers = users.filter(user => user.status === 'pending').length;
      const customRoles = roles.filter(role => !role.isSystemRole).length;
      const systemRoles = roles.filter(role => role.isSystemRole).length;

      return {
        totalUsers,
        activeUsers,
        pendingUsers,
        customRoles,
        systemRoles,
        activeUserPercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
      };
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Failed to calculate statistics'));
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        customRoles: 0,
        systemRoles: 0,
        activeUserPercentage: 0
      };
    }
  }, [users, roles, handleError]);

  const refresh = () => {
    retry(async () => {
      loadUsers();
      loadRoles();
    });
  };

  return {
    ...statistics,
    isLoading,
    error,
    retryCount,
    refresh,
    retry: refresh,
    reset
  };
};
