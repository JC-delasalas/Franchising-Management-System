
export interface IAMRole {
  id: string;
  name: string;
  description: string;
  permissions: IAMPermission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAMPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface IAMUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: IAMRole[];
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAMInvitation {
  id: string;
  email: string;
  roles: string[];
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  status?: 'active' | 'inactive';
}
