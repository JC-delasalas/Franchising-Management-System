import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { PageLoading } from '@/components/ui/loading';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash or search params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate('/login');
          return;
        }

        if (data.session) {
          // User is authenticated, get their profile to determine role
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Default to franchisee dashboard if profile fetch fails
            navigate('/franchisee-dashboard');
            return;
          }

          // Redirect based on user role
          const role = profile?.role || 'franchisee';
          switch (role) {
            case 'franchisor':
              navigate('/franchisor-dashboard');
              break;
            case 'franchisee':
              navigate('/franchisee-dashboard');
              break;
            case 'admin':
              navigate('/iam-management');
              break;
            default:
              navigate('/franchisee-dashboard');
          }

          toast({
            title: "Welcome!",
            description: "You have been successfully authenticated.",
          });
        } else {
          // No session found, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <PageLoading />
        <p className="mt-4 text-muted-foreground">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
