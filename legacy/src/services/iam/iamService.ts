
import { IAMRole, IAMPermission, IAMUser, IAMInvitation, CreateUserData, UpdateUserData } from './iamTypes';

// Predefined permissions
const PREDEFINED_PERMISSIONS: IAMPermission[] = [
  { id: 'perm-1', name: 'View Dashboard', description: 'Access to dashboard overview', resource: 'dashboard', action: 'read' },
  { id: 'perm-2', name: 'Manage Sales', description: 'Upload and manage sales data', resource: 'sales', action: 'write' },
  { id: 'perm-3', name: 'View Analytics', description: 'Access to analytics and reports', resource: 'analytics', action: 'read' },
  { id: 'perm-4', name: 'Manage Inventory', description: 'Order and manage inventory', resource: 'inventory', action: 'write' },
  { id: 'perm-5', name: 'Manage Marketing', description: 'Access marketing assets', resource: 'marketing', action: 'write' },
  { id: 'perm-6', name: 'Manage Users', description: 'Create and manage user accounts', resource: 'users', action: 'admin' },
  { id: 'perm-7', name: 'View Support', description: 'Access support requests', resource: 'support', action: 'read' },
  { id: 'perm-8', name: 'Manage Support', description: 'Handle support requests', resource: 'support', action: 'write' },
];

// Predefined roles
const PREDEFINED_ROLES: IAMRole[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full access to all features and user management',
    permissions: PREDEFINED_PERMISSIONS,
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Access to most features except user management',
    permissions: PREDEFINED_PERMISSIONS.filter(p => p.resource !== 'users'),
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-staff',
    name: 'Staff',
    description: 'Basic access to daily operations',
    permissions: PREDEFINED_PERMISSIONS.filter(p => 
      ['dashboard', 'sales', 'inventory', 'support'].includes(p.resource) && p.action !== 'admin'
    ),
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access to reports and analytics',
    permissions: PREDEFINED_PERMISSIONS.filter(p => p.action === 'read'),
    isSystemRole: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Storage keys
const IAM_USERS_KEY = 'iam_users';
const IAM_ROLES_KEY = 'iam_roles';
const IAM_INVITATIONS_KEY = 'iam_invitations';

// Initialize with predefined roles
const initializeIAMData = (): void => {
  if (!localStorage.getItem(IAM_ROLES_KEY)) {
    localStorage.setItem(IAM_ROLES_KEY, JSON.stringify(PREDEFINED_ROLES));
  }
  if (!localStorage.getItem(IAM_USERS_KEY)) {
    localStorage.setItem(IAM_USERS_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(IAM_INVITATIONS_KEY)) {
    localStorage.setItem(IAM_INVITATIONS_KEY, JSON.stringify([]));
  }
};

// Initialize on module load
initializeIAMData();

export const getIAMUsers = (): IAMUser[] => {
  return JSON.parse(localStorage.getItem(IAM_USERS_KEY) || '[]');
};

export const saveIAMUsers = (users: IAMUser[]): void => {
  localStorage.setItem(IAM_USERS_KEY, JSON.stringify(users));
};

export const getIAMRoles = (): IAMRole[] => {
  return JSON.parse(localStorage.getItem(IAM_ROLES_KEY) || '[]');
};

export const saveIAMRoles = (roles: IAMRole[]): void => {
  localStorage.setItem(IAM_ROLES_KEY, JSON.stringify(roles));
};

export const getIAMInvitations = (): IAMInvitation[] => {
  return JSON.parse(localStorage.getItem(IAM_INVITATIONS_KEY) || '[]');
};

export const saveIAMInvitations = (invitations: IAMInvitation[]): void => {
  localStorage.setItem(IAM_INVITATIONS_KEY, JSON.stringify(invitations));
};

export const getAllPermissions = (): IAMPermission[] => {
  return PREDEFINED_PERMISSIONS;
};

export const createIAMUser = async (userData: CreateUserData): Promise<{ success: boolean; message: string; user?: IAMUser }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getIAMUsers();
      const roles = getIAMRoles();
      
      // Check if user already exists
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        resolve({
          success: false,
          message: 'A user with this email already exists.'
        });
        return;
      }

      // Get selected roles
      const selectedRoles = roles.filter(role => userData.roleIds.includes(role.id));

      const newUser: IAMUser = {
        id: `iam-user-${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: selectedRoles,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      users.push(newUser);
      saveIAMUsers(users);

      // Create invitation
      const invitation: IAMInvitation = {
        id: `inv-${Date.now()}`,
        email: userData.email,
        roles: userData.roleIds,
        invitedBy: 'current-user', // In real app, this would be the current user's ID
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        createdAt: new Date().toISOString(),
      };

      const invitations = getIAMInvitations();
      invitations.push(invitation);
      saveIAMInvitations(invitations);

      resolve({
        success: true,
        message: 'User created and invitation sent successfully!',
        user: newUser
      });
    }, 1000);
  });
};

export const updateIAMUser = async (userId: string, updateData: UpdateUserData): Promise<{ success: boolean; message: string; user?: IAMUser }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getIAMUsers();
      const roles = getIAMRoles();
      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        resolve({
          success: false,
          message: 'User not found.'
        });
        return;
      }

      const user = users[userIndex];
      
      // Update user data
      if (updateData.firstName) user.firstName = updateData.firstName;
      if (updateData.lastName) user.lastName = updateData.lastName;
      if (updateData.status) user.status = updateData.status;
      if (updateData.roleIds) {
        user.roles = roles.filter(role => updateData.roleIds!.includes(role.id));
      }
      
      user.updatedAt = new Date().toISOString();
      users[userIndex] = user;
      saveIAMUsers(users);

      resolve({
        success: true,
        message: 'User updated successfully!',
        user
      });
    }, 1000);
  });
};

export const deleteIAMUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getIAMUsers();
      const filteredUsers = users.filter(user => user.id !== userId);
      
      if (users.length === filteredUsers.length) {
        resolve({
          success: false,
          message: 'User not found.'
        });
        return;
      }

      saveIAMUsers(filteredUsers);

      resolve({
        success: true,
        message: 'User deleted successfully!'
      });
    }, 1000);
  });
};

export const createCustomRole = async (roleData: Omit<IAMRole, 'id' | 'isSystemRole' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; message: string; role?: IAMRole }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roles = getIAMRoles();
      
      // Check if role name already exists
      const existingRole = roles.find(role => role.name.toLowerCase() === roleData.name.toLowerCase());
      if (existingRole) {
        resolve({
          success: false,
          message: 'A role with this name already exists.'
        });
        return;
      }

      const newRole: IAMRole = {
        id: `role-${Date.now()}`,
        ...roleData,
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      roles.push(newRole);
      saveIAMRoles(roles);

      resolve({
        success: true,
        message: 'Role created successfully!',
        role: newRole
      });
    }, 1000);
  });
};

export const updateRole = async (roleId: string, roleData: Partial<IAMRole>): Promise<{ success: boolean; message: string; role?: IAMRole }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roles = getIAMRoles();
      const roleIndex = roles.findIndex(role => role.id === roleId);

      if (roleIndex === -1) {
        resolve({
          success: false,
          message: 'Role not found.'
        });
        return;
      }

      const role = roles[roleIndex];
      
      // Check if it's a system role and prevent modification of critical properties
      if (role.isSystemRole && (roleData.name || roleData.permissions)) {
        resolve({
          success: false,
          message: 'Cannot modify system roles.'
        });
        return;
      }

      // Update role data
      Object.assign(role, roleData, {
        updatedAt: new Date().toISOString()
      });
      
      roles[roleIndex] = role;
      saveIAMRoles(roles);

      resolve({
        success: true,
        message: 'Role updated successfully!',
        role
      });
    }, 1000);
  });
};

export const deleteRole = async (roleId: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roles = getIAMRoles();
      const role = roles.find(r => r.id === roleId);
      
      if (!role) {
        resolve({
          success: false,
          message: 'Role not found.'
        });
        return;
      }

      if (role.isSystemRole) {
        resolve({
          success: false,
          message: 'Cannot delete system roles.'
        });
        return;
      }

      // Check if any users have this role
      const users = getIAMUsers();
      const usersWithRole = users.filter(user => user.roles.some(r => r.id === roleId));
      
      if (usersWithRole.length > 0) {
        resolve({
          success: false,
          message: `Cannot delete role. ${usersWithRole.length} user(s) still have this role.`
        });
        return;
      }

      const filteredRoles = roles.filter(r => r.id !== roleId);
      saveIAMRoles(filteredRoles);

      resolve({
        success: true,
        message: 'Role deleted successfully!'
      });
    }, 1000);
  });
};
