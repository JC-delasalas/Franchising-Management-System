
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const useNotifications = () => {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'border-green-200 bg-green-50 text-green-800',
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'border-blue-200 bg-blue-50 text-blue-800',
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'default',
      className: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    });
  };

  // Standardized messages for common actions
  const notifications = {
    application: {
      submitted: () => showSuccess(
        'Application Submitted',
        'Your franchise application has been submitted successfully. We will review it and contact you within 2-3 business days.'
      ),
      saved: () => showSuccess(
        'Application Saved',
        'Your application progress has been saved. You can continue later.'
      ),
      error: () => showError(
        'Application Error',
        'There was an error submitting your application. Please try again.'
      )
    },
    auth: {
      loginSuccess: () => showSuccess(
        'Welcome Back',
        'You have successfully logged in to your account.'
      ),
      loginError: () => showError(
        'Login Failed',
        'Invalid email or password. Please check your credentials and try again.'
      ),
      signupSuccess: () => showSuccess(
        'Account Created',
        'Your account has been created successfully. Please check your email to verify your account.'
      ),
      signupError: () => showError(
        'Registration Failed',
        'There was an error creating your account. Please try again.'
      ),
      logoutSuccess: () => showInfo(
        'Logged Out',
        'You have been successfully logged out.'
      )
    },
    contact: {
      sent: () => showSuccess(
        'Message Sent',
        'Your message has been sent successfully. We will get back to you within 24 hours.'
      ),
      error: () => showError(
        'Message Failed',
        'There was an error sending your message. Please try again.'
      )
    },
    general: {
      saveSuccess: () => showSuccess('Saved', 'Changes saved successfully.'),
      saveError: () => showError('Save Failed', 'Failed to save changes. Please try again.'),
      loadError: () => showError('Loading Error', 'Failed to load data. Please refresh the page.'),
      networkError: () => showError(
        'Network Error',
        'Please check your internet connection and try again.'
      ),
      maintenance: () => showWarning(
        'Maintenance Notice',
        'The system is currently under maintenance. Some features may be temporarily unavailable.'
      )
    }
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifications
  };
};
