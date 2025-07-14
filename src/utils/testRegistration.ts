import { supabase } from '@/integrations/supabase/client';

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  accountType: 'franchisee' | 'franchisor';
}

export const testRegistration = async (userData: TestUser) => {
  try {
    console.log('Testing registration with data:', userData);
    
    // Generate a temporary user ID for immediate access
    const tempUserId = crypto.randomUUID();
    
    // Create user profile with simplified structure matching current schema
    const { data, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: tempUserId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        account_type: userData.accountType,
        status: 'active' // Immediately active, no verification needed
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return {
        success: false,
        error: profileError.message,
        details: profileError
      };
    }

    console.log('User profile created successfully:', data);

    // Store user session in localStorage for immediate access
    const userSession = {
      user_id: tempUserId,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      account_type: userData.accountType,
      status: 'active'
    };
    
    localStorage.setItem('franchise_user_session', JSON.stringify(userSession));
    
    return {
      success: true,
      user: userSession,
      data
    };

  } catch (error) {
    console.error('Registration test error:', error);
    return {
      success: false,
      error: 'Unexpected error occurred',
      details: error
    };
  }
};

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('Database connection successful');
    return {
      success: true,
      message: 'Database connection working'
    };

  } catch (error) {
    console.error('Database test error:', error);
    return {
      success: false,
      error: 'Failed to connect to database',
      details: error
    };
  }
};

// Test data
export const testUsers: TestUser[] = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1-555-0123',
    accountType: 'franchisee'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@test.com',
    phone: '+1-555-0456',
    accountType: 'franchisor'
  }
];
