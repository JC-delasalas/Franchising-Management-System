
export interface AuthUser {
  id: string;
  email: string;
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
      const user = users.find((u: AuthUser) => u.email === loginData.email);

      if (!user) {
        resolve({
          success: false,
          message: 'No account found with this email address.'
        });
        return;
      }

      // In real app, password would be properly hashed and verified
      // For demo, we'll simulate successful login
      if (!user.isEmailVerified) {
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
