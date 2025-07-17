/**
 * Session Manager - Enhanced session control and security
 * 
 * Provides utilities for managing user sessions with security controls
 */

import { supabase } from '@/lib/supabase';
import { logError } from '@/lib/errors';

export interface SessionInfo {
  isActive: boolean;
  user: any;
  expiresAt?: string;
  lastActivity?: string;
}

export class SessionManager {
  private static readonly SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before expiry
  private static readonly ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
  private static lastActivityTime = Date.now();

  /**
   * Get current session information
   */
  static async getSessionInfo(): Promise<SessionInfo> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logError(error, { context: 'session_info_check' });
        return { isActive: false, user: null };
      }

      if (!session) {
        return { isActive: false, user: null };
      }

      return {
        isActive: true,
        user: session.user,
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
        lastActivity: new Date(this.lastActivityTime).toISOString(),
      };
    } catch (error) {
      logError(error as Error, { context: 'session_info_error' });
      return { isActive: false, user: null };
    }
  }

  /**
   * Check if user has an existing session and show appropriate message
   */
  static async checkExistingSession(): Promise<{
    hasSession: boolean;
    user?: any;
    shouldShowWarning: boolean;
    message?: string;
  }> {
    const sessionInfo = await this.getSessionInfo();
    
    if (!sessionInfo.isActive) {
      return { hasSession: false, shouldShowWarning: false };
    }

    // Check if session is close to expiry
    const expiresAt = new Date(sessionInfo.expiresAt!).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < this.SESSION_WARNING_TIME) {
      return {
        hasSession: true,
        user: sessionInfo.user,
        shouldShowWarning: true,
        message: `Your session will expire in ${Math.round(timeUntilExpiry / 60000)} minutes. Please save your work.`
      };
    }

    return {
      hasSession: true,
      user: sessionInfo.user,
      shouldShowWarning: false,
      message: `You are currently logged in as ${sessionInfo.user.email}`
    };
  }

  /**
   * Safely sign out user with cleanup
   */
  static async signOut(redirectTo: string = '/'): Promise<void> {
    try {
      // Clear any local state
      this.lastActivityTime = 0;
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logError(error, { context: 'sign_out_error' });
      }

      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Redirect to specified page
      window.location.href = redirectTo;
    } catch (error) {
      logError(error as Error, { context: 'sign_out_cleanup_error' });
      // Force redirect even if cleanup fails
      window.location.href = redirectTo;
    }
  }

  /**
   * Update last activity time
   */
  static updateActivity(): void {
    this.lastActivityTime = Date.now();
  }

  /**
   * Start activity monitoring
   */
  static startActivityMonitoring(): void {
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Periodic session validation
    setInterval(async () => {
      const sessionInfo = await this.getSessionInfo();
      
      if (!sessionInfo.isActive) {
        console.warn('Session expired - redirecting to login');
        this.signOut('/login');
      }
    }, this.ACTIVITY_CHECK_INTERVAL);
  }

  /**
   * Force session refresh
   */
  static async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logError(error, { context: 'session_refresh_error' });
        return false;
      }

      return !!data.session;
    } catch (error) {
      logError(error as Error, { context: 'session_refresh_failed' });
      return false;
    }
  }

  /**
   * Check if current session is valid and not expired
   */
  static async validateSession(): Promise<boolean> {
    const sessionInfo = await this.getSessionInfo();
    
    if (!sessionInfo.isActive) {
      return false;
    }

    // Check if session is expired
    const expiresAt = new Date(sessionInfo.expiresAt!).getTime();
    const now = Date.now();
    
    if (now >= expiresAt) {
      console.warn('Session expired');
      await this.signOut('/login');
      return false;
    }

    return true;
  }

  /**
   * Get session expiry warning message
   */
  static getSessionExpiryWarning(expiresAt: string): string | null {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    
    if (timeUntilExpiry < this.SESSION_WARNING_TIME) {
      const minutesLeft = Math.round(timeUntilExpiry / 60000);
      return `Your session will expire in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}. Please save your work.`;
    }
    
    return null;
  }

  /**
   * Initialize session manager
   */
  static initialize(): void {
    this.startActivityMonitoring();
    console.log('Session manager initialized');
  }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
  SessionManager.initialize();
}

export default SessionManager;
