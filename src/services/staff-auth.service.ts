// Import config values
import { API_URL, STAFF_TOKEN_COOKIE, STAFF_TOKEN_EXPIRY } from '@/config';

/**
 * Staff login credentials
 */
export interface StaffLoginCredentials {
  fullName: string;
  accessCode: string;
}

/**
 * Staff profile
 */
export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  staff_number: string;
  is_staff?: boolean;
  authenticated?: boolean;
  timestamp?: string;
}

/**
 * Staff access codes - matches the backend
 */
const STAFF_CODES: Record<string, { name: string; role: string }> = {
  'APO001': { name: 'Field Officer', role: 'assistant_project_officer' },
  'RPM001': { name: 'Project Manager', role: 'project_manager' },
  'HOP001': { name: 'Program Manager', role: 'head_of_programs' },
  'DIR001': { name: 'Director', role: 'director' },
  'CEO001': { name: 'Chief Executive', role: 'ceo' },
  'PAT001': { name: 'Patron', role: 'patron' },
  'ADM001': { name: 'Administrator', role: 'admin' },
  // Add the BGF codes with correct roles that match USER_ROLES exactly
  'BGF-STAFF-2023': { name: 'Staff Member', role: 'project_manager' },
  'BGF-ADMIN-2023': { name: 'Administrator', role: 'admin' },
  'BGF-CEO-2023': { name: 'Chief Executive', role: 'ceo' },
};

/**
 * Staff authentication service
 */
const staffAuthService = {
  /**
   * Login a staff member with access code
   * @param credentials - Staff login credentials
   */
  async login(credentials: StaffLoginCredentials): Promise<{ staff: StaffProfile; token: string }> {
    try {
      console.log('Staff auth service: Attempting login with credentials', {
        fullName: credentials.fullName,
        accessCode: credentials.accessCode
      });

      try {
        // First try to call the backend API
        const response = await fetch(`${API_URL}/api/staff-auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: credentials.fullName,
            accessCode: credentials.accessCode,
          }),
          // Add a timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Staff auth service: Login error from API', errorData);
          throw new Error(errorData.message || 'Staff login failed');
        }

        const data = await response.json();
        console.log('Staff auth service: Login successful', data);

        // Store the token in the unified localStorage key
        localStorage.setItem('bgf.auth.token', data.token);

        // Also store in the old key for backward compatibility
        this.setToken(data.token);
        this.setProfile(data.staff);

        return {
          staff: data.staff,
          token: data.token
        };
      } catch (fetchError) {
        console.error('Staff auth service: Error connecting to backend', fetchError);
        console.log('Staff auth service: Using fallback authentication');

        // Check if the access code is valid
        const staffCode = credentials.accessCode.toUpperCase();
        const staffInfo = STAFF_CODES[staffCode];

        if (!staffInfo) {
          throw new Error('Invalid staff access code');
        }

        // For fallback, we'll accept any name
        // This is more lenient than the backend but helps with development

        // Create a staff profile
        const staffProfile: StaffProfile = {
          id: `staff_${staffCode}`,
          name: credentials.fullName,
          role: staffInfo.role,
          staff_number: staffCode,
          is_staff: true,
          authenticated: true,
          timestamp: new Date().toISOString()
        };

        // Create a token (this would normally be done by the backend)
        const token = `dev_token_${staffCode}_${Date.now()}`;

        // Store the token in the unified localStorage key
        localStorage.setItem('bgf.auth.token', token);

        // Also store in the old key for backward compatibility
        this.setToken(token);
        this.setProfile(staffProfile);

        console.log('Staff auth service: Fallback login successful', { staff: staffProfile, token });

        return { staff: staffProfile, token };
      }
    } catch (error: any) {
      console.error('Staff auth service: Login error', error);
      throw error;
    }
  },

  /**
   * Verify staff token
   */
  async verifyToken(): Promise<StaffProfile | null> {
    try {
      const token = localStorage.getItem('bgf.staff.token');
      if (!token) return null;

      // Check if staff profile exists
      const staffData = localStorage.getItem('bgf.staff');
      if (!staffData) return null;

      try {
        // Parse staff data
        const staff = JSON.parse(staffData);

        // Check if staff data is valid
        if (!staff || !staff.authenticated) return null;

        // Check if timestamp is recent (within the last 24 hours)
        const timestamp = new Date(staff.timestamp).getTime();
        const now = new Date().getTime();
        const diff = now - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (diff > maxAge) {
          console.log('Staff token expired');
          return null;
        }

        return staff;
      } catch (error) {
        console.error('Error parsing staff data:', error);
        return null;
      }
    } catch (error) {
      console.error('Error verifying staff token:', error);
      return null;
    }
  },

  /**
   * Logout staff user
   */
  async logout(): Promise<void> {
    try {
      // Clear localStorage - both unified and legacy keys
      localStorage.removeItem('bgf.auth.token');
      localStorage.removeItem('bgf.staff.token');
      localStorage.removeItem('bgf.staff');

      // Clear cookie
      document.cookie = `${STAFF_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Strict`;

      console.log('Staff auth service: Logout successful');
    } catch (error) {
      console.error('Staff auth service: Logout error', error);
      throw error;
    }
  },

  /**
   * Set staff token
   * @param token - Staff token
   */
  setToken(token: string): void {
    try {
      // Store token in localStorage
      localStorage.setItem('bgf.staff.token', token);

      // Also store the token in a cookie for the middleware
      document.cookie = `${STAFF_TOKEN_COOKIE}=${token}; path=/; max-age=${STAFF_TOKEN_EXPIRY}; SameSite=Strict`;
    } catch (error) {
      console.error('Error setting staff token:', error);
    }
  },

  /**
   * Set staff profile
   * @param profile - Staff profile
   */
  setProfile(profile: StaffProfile): void {
    try {
      // Store staff info in localStorage
      localStorage.setItem('bgf.staff', JSON.stringify({
        ...profile,
        authenticated: true,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error setting staff profile:', error);
    }
  },

  /**
   * Get staff profile
   */
  getProfile(): StaffProfile | null {
    try {
      const staffData = localStorage.getItem('bgf.staff');
      if (!staffData) {
        throw new Error('Auth session missing!');
      }

      return JSON.parse(staffData);
    } catch (error) {
      console.error('Error getting staff profile:', error);
      throw error;
    }
  },

  /**
   * Check if staff is authenticated
   */
  isAuthenticated(): boolean {
    try {
      // First check for the unified token
      const unifiedToken = localStorage.getItem('bgf.auth.token');
      if (unifiedToken) {
        // Try to decode the token to check if it's a staff token
        try {
          const tokenParts = unifiedToken.split('.');
          if (tokenParts.length === 3) {
            // This looks like a JWT token, try to decode it
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.is_staff) {
              return true;
            }
          }
        } catch (tokenError) {
          console.warn('Error decoding token:', tokenError);
          // Continue with legacy check
        }
      }

      // Legacy check if token exists
      const token = localStorage.getItem('bgf.staff.token');
      if (!token) return false;

      // Check if staff profile exists
      const staffData = localStorage.getItem('bgf.staff');
      if (!staffData) return false;

      try {
        // Parse staff data
        const staff = JSON.parse(staffData);

        // Check if staff data is valid
        if (!staff || !staff.authenticated) return false;

        // Check if timestamp is recent (within the last 24 hours)
        const timestamp = new Date(staff.timestamp).getTime();
        const now = new Date().getTime();
        const diff = now - timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        return diff < maxAge;
      } catch (error) {
        console.error('Error parsing staff data:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking staff authentication:', error);
      return false;
    }
  }
};

export default staffAuthService;
