import { supabase } from '@/lib/supabase';

export interface LoginSession {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device: string;
  browser: string;
  location: string;
  created_at: string;
  last_active_at: string;
  is_current: boolean;
}

/**
 * Login history service for handling login session-related operations
 */
export const loginHistoryService = {
  /**
   * Get all login sessions for the current user
   * @returns Array of login sessions
   */
  async getLoginSessions(): Promise<LoginSession[]> {
    try {
      // Get user and session from Supabase
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('User not found');

      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);

      // Create a mock session based on the current session
      const currentSession: LoginSession = {
        id: sessionData.session?.id || 'current-session',
        user_id: authData.user.id,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        device: this.getDeviceInfo(),
        browser: this.getBrowserInfo(),
        location: 'Unknown',
        created_at: sessionData.session?.created_at || new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        is_current: true
      };

      // Return an array with just the current session
      return [currentSession];
    } catch (error: any) {
      console.error('Error fetching login sessions:', error);
      return [];
    }
  },

  /**
   * Sign out from all devices
   * @returns Success status
   */
  async signOutAllDevices(): Promise<boolean> {
    try {
      // Sign out from all devices with Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) throw new Error(error.message);

      return true;
    } catch (error: any) {
      console.error('Error signing out from all devices:', error);
      return false;
    }
  },

  /**
   * Sign out from a specific session
   * @param sessionId - Session ID
   * @returns Success status
   */
  async signOutSession(sessionId: string): Promise<boolean> {
    try {
      // Sign out from a specific session with Supabase
      // Note: Supabase doesn't support signing out from a specific session
      // So we'll sign out from all sessions if the session is the current one
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);

      if (sessionData.session?.id === sessionId) {
        const { error } = await supabase.auth.signOut();

        if (error) throw new Error(error.message);

        return true;
      }

      // If it's not the current session, we can't sign it out with Supabase
      throw new Error('Cannot sign out from a non-current session with Supabase');
    } catch (error: any) {
      console.error('Error signing out from session:', error);
      return false;
    }
  },

  /**
   * Get device information from user agent
   * @returns Device information
   */
  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;

    if (/Android/i.test(userAgent)) {
      return 'Android';
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'iOS';
    }

    if (/Windows/i.test(userAgent)) {
      return 'Windows';
    }

    if (/Mac/i.test(userAgent)) {
      return 'Mac';
    }

    if (/Linux/i.test(userAgent)) {
      return 'Linux';
    }

    return 'Unknown';
  },

  /**
   * Get browser information from user agent
   * @returns Browser information
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;

    if (/Chrome/i.test(userAgent)) {
      return 'Chrome';
    }

    if (/Firefox/i.test(userAgent)) {
      return 'Firefox';
    }

    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      return 'Safari';
    }

    if (/Edge/i.test(userAgent)) {
      return 'Edge';
    }

    if (/Opera|OPR/i.test(userAgent)) {
      return 'Opera';
    }

    return 'Unknown';
  }
};
