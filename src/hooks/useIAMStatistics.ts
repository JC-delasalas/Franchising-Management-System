
import { useMemo } from 'react';
import { useIAMUsers } from './useIAMUsers';
import { useIAMRoles } from './useIAMRoles';

export const useIAMStatistics = () => {
  const { users } = useIAMUsers();
  const { roles } = useIAMRoles();

  const statistics = useMemo(() => {
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
  }, [users, roles]);

  return statistics;
};
