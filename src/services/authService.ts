
export { AuthUser, SignupData, LoginData } from './auth/authTypes';
import { AuthUser, SignupData, LoginData } from './auth/authTypes';
import { 
  getUsers, 
  saveUsers, 
  getPasswords, 
  getCurrentUserFromStorage, 
  saveCurrentUser, 
  removeCurrentUser,
  findUserByEmail 
} from './auth/authStorage';
import { initializePredefinedAccounts } from './auth/predefinedAccounts';
import { sendVerificationEmail } from './auth/emailVerification';

// Initialize accounts on module load
initializePredefinedAccounts();

export const signupUser = async (userData: SignupData): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getUsers();
      
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
      saveUsers(users);

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
      const passwords = getPasswords();
      const user = findUserByEmail(loginData.email);

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

      saveCurrentUser(user);
      
      resolve({
        success: true,
        message: 'Login successful!',
        user
      });
    }, 1500);
  });
};

export const getCurrentUser = (): AuthUser | null => {
  return getCurrentUserFromStorage();
};

export const logoutUser = (): void => {
  removeCurrentUser();
};

export { sendVerificationEmail, verifyEmail } from './auth/emailVerification';
