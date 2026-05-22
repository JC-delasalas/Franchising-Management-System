
import { AuthUser } from './authTypes';
import { getUsers, saveUsers, getPasswords, savePasswords } from './authStorage';

const PREDEFINED_ACCOUNTS = [
  {
    id: 'franchisor-001',
    email: 'franchisor@example.com',
    username: 'Franchisor',
    firstName: 'Admin',
    lastName: 'Franchisor',
    accountType: 'franchisor' as const,
    isEmailVerified: true,
    password: 'WelcomeAdmin*123'
  },
  {
    id: 'franchisee-001',
    email: 'franchisee@example.com',
    username: 'Franchisee',
    firstName: 'Demo',
    lastName: 'Franchisee',
    accountType: 'franchisee' as const,
    isEmailVerified: true,
    password: 'Franchisee*123'
  }
];

export const initializePredefinedAccounts = (): void => {
  const users = getUsers();
  const passwords = getPasswords();

  PREDEFINED_ACCOUNTS.forEach(account => {
    const existingUser = users.find((user: AuthUser) => 
      user.username === account.username || user.email === account.email
    );
    
    if (!existingUser) {
      const { password, ...userWithoutPassword } = account;
      users.push(userWithoutPassword);
      passwords[account.username] = password;
    }
  });

  saveUsers(users);
  savePasswords(passwords);
};
