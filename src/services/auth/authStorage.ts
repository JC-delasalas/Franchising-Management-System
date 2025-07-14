
import { AuthUser } from './authTypes';

// Storage keys
const USERS_KEY = 'franchise_users';
const CURRENT_USER_KEY = 'current_user';
const PASSWORDS_KEY = 'demo_passwords';

export const getUsers = (): AuthUser[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const saveUsers = (users: AuthUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getPasswords = (): Record<string, string> => {
  return JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
};

export const savePasswords = (passwords: Record<string, string>): void => {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
};

export const getCurrentUserFromStorage = (): AuthUser | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const saveCurrentUser = (user: AuthUser): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const findUserByEmail = (email: string): AuthUser | undefined => {
  const users = getUsers();
  return users.find((u: AuthUser) => u.email === email || u.username === email);
};

export const updateUser = (updatedUser: AuthUser): void => {
  const users = getUsers();
  const userIndex = users.findIndex((user: AuthUser) => user.id === updatedUser.id);
  
  if (userIndex !== -1) {
    users[userIndex] = updatedUser;
    saveUsers(users);
  }
};
