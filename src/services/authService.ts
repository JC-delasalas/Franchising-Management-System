
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  accountType: 'franchisee' | 'franchisor';
  isEmailVerified: boolean;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  accountType: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Simulate user storage (in real app, this would be handled by backend)
const USERS_KEY = 'franchise_users';
const CURRENT_USER_KEY = 'current_user';

// Initialize predefined accounts
const initializePredefinedAccounts = () => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  const predefinedAccounts = [
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

  // Check if predefined accounts already exist
  predefinedAccounts.forEach(account => {
    const existingUser = users.find((user: any) => 
      user.username === account.username || user.email === account.email
    );
    
    if (!existingUser) {
      const { password, ...userWithoutPassword } = account;
      users.push(userWithoutPassword);
    }
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Store passwords separately for demo purposes (in real app, these would be hashed)
  const passwords = JSON.parse(localStorage.getItem('demo_passwords') || '{}');
  predefinedAccounts.forEach(account => {
    passwords[account.username] = account.password;
  });
  localStorage.setItem('demo_passwords', JSON.stringify(passwords));
};

// Initialize accounts on module load
initializePredefinedAccounts();

export const signupUser = async (userData: SignupData): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      // Check if user already exists
      const existingUser = users.find((user: AuthUser) => user.email === userData.email);
      if (existingUser) {
        resolve({
          success: false,
          message: 'An account with this email already exists.'
        });
        return;
      }

      // Create new user
      const newUser: AuthUser = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.email, // Use email as username for new signups
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountType: userData.accountType as 'franchisee' | 'franchisor',
        isEmailVerified: false
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Send verification email (simulated)
      sendVerificationEmail(userData.email);

      resolve({
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        requiresVerification: true
      });
    }, 2000);
  });
};

export const loginUser = async (loginData: LoginData): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const passwords = JSON.parse(localStorage.getItem('demo_passwords') || '{}');
      
      // Check for username or email login
      const user = users.find((u: AuthUser) => 
        u.email === loginData.email || u.username === loginData.email
      );

      if (!user) {
        resolve({
          success: false,
          message: 'No account found with this username or email address.'
        });
        return;
      }

      // Check password for predefined accounts
      if (user.username === 'Franchisor' || user.username === 'Franchisee') {
        const correctPassword = passwords[user.username];
        if (loginData.password !== correctPassword) {
          resolve({
            success: false,
            message: 'Invalid password.'
          });
          return;
        }
      }

      // Check email verification for new signups
      if (!user.isEmailVerified && user.username !== 'Franchisor' && user.username !== 'Franchisee') {
        resolve({
          success: false,
          message: 'Please verify your email address before logging in. Check your inbox for verification link.'
        });
        return;
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      
      resolve({
        success: true,
        message: 'Login successful!',
        user
      });
    }, 1500);
  });
};

export const sendVerificationEmail = async (email: string): Promise<boolean> => {
  // Simulate sending verification email
  console.log(`Verification email sent to: ${email}`);
  
  // For demo purposes, auto-verify after 3 seconds
  setTimeout(() => {
    verifyEmail(email);
  }, 3000);
  
  return true;
};

export const verifyEmail = (email: string): void => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const userIndex = users.findIndex((user: AuthUser) => user.email === email);
  
  if (userIndex !== -1) {
    users[userIndex].isEmailVerified = true;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log(`Email verified for: ${email}`);
  }
};

export const getCurrentUser = (): AuthUser | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
