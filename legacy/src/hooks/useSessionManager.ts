
import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  refreshThresholdMinutes: number;
}

const DEFAULT_CONFIG: SessionConfig = {
  timeoutMinutes: 30,
  warningMinutes: 5,
  refreshThresholdMinutes: 10
};

export const useSessionManager = (config: Partial<SessionConfig> = {}) => {
  const { notifications } = useNotifications();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(finalConfig.timeoutMinutes * 60);
  const [showWarning, setShowWarning] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    lastActivityRef.current = Date.now();
    setTimeRemaining(finalConfig.timeoutMinutes * 60);
    setShowWarning(false);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      notifications.general.maintenance();
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
        const remaining = (finalConfig.timeoutMinutes * 60) - elapsed;
        
        if (remaining <= 0) {
          handleSessionTimeout();
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }, (finalConfig.timeoutMinutes - finalConfig.warningMinutes) * 60 * 1000);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout();
    }, finalConfig.timeoutMinutes * 60 * 1000);
  }, [finalConfig.timeoutMinutes, finalConfig.warningMinutes]);

  const handleSessionTimeout = useCallback(async () => {
    try {
      await signOut();
      setSessionActive(false);
      setShowWarning(false);
      notifications.auth.logoutSuccess();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during session timeout:', error);
      window.location.href = '/login';
    }
  }, [notifications]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        resetTimer();
        notifications.general.saveSuccess();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, [resetTimer, notifications]);

  const trackActivity = useCallback(() => {
    if (sessionActive) {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only reset if enough time has passed to avoid excessive resets
      if (timeSinceLastActivity > 30000) { // 30 seconds
        resetTimer();
      }
    }
  }, [sessionActive, resetTimer]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSessionActive(true);
        resetTimer();
      }
    };

    checkSession();
  }, [resetTimer]);

  useEffect(() => {
    if (sessionActive) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      events.forEach(event => {
        document.addEventListener(event, trackActivity, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, trackActivity, true);
        });
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
      };
    }
  }, [sessionActive, trackActivity]);

  return {
    sessionActive,
    timeRemaining,
    showWarning,
    refreshSession,
    handleSessionTimeout,
    formatTimeRemaining: () => {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};
