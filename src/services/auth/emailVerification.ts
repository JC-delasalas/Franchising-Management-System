
import { updateUser, findUserByEmail } from './authStorage';

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
  const user = findUserByEmail(email);
  
  if (user) {
    const updatedUser = { ...user, isEmailVerified: true };
    updateUser(updatedUser);
    console.log(`Email verified for: ${email}`);
  }
};
