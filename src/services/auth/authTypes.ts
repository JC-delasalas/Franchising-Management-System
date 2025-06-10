
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
