
import { supabase } from '@/integrations/supabase/client';

export const createDemoUsers = async () => {
  try {
    console.log('Checking for demo users...');
    
    // Call the edge function to create demo users
    const { data, error } = await supabase.functions.invoke('create-demo-users');
    
    if (error) {
      console.error('Error creating demo users:', error);
      return false;
    }
    
    console.log('Demo users setup result:', data);
    return true;
  } catch (error) {
    console.error('Failed to setup demo users:', error);
    return false;
  }
};

export const DEMO_CREDENTIALS = {
  franchisee: {
    email: 'demo@franchisee.com',
    password: 'demo123'
  },
  franchisor: {
    email: 'demo@franchisor.com',
    password: 'demo123'
  }
};
