"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// import { authService, UserProfile } from '@/services/auth.service';
import { simulatedAuthService as authService } from '@/services/simulated-auth.service';
import { User as UserProfile } from '@/types/user';
import staffAuthService, { StaffProfile } from '../services/staff-auth.service';

// Using StaffProfile from staff-auth.service.ts

interface AuthContextType {
  user: UserProfile | null;
  staffUser: StaffProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, staffNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  isStaffAuthenticated: () => boolean;
  isUserAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [staffUser, setStaffUser] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      // Set a safety timeout to ensure loading state is reset
      const safetyTimeout = setTimeout(() => {
        setLoading(false);
        console.log('Safety timeout triggered during auth check');
      }, 5000); // 5 seconds max loading time

      try {
        setLoading(true);

        // Direct check for staff authentication from localStorage
        if (typeof window !== 'undefined') {
          // Check if we have a staff token in localStorage
          const staffToken = localStorage.getItem('bgf.staff.token');
          const staffData = localStorage.getItem('bgf.staff');

          if (staffToken && staffData) {
            try {
              // Parse staff data
              const staffProfile = JSON.parse(staffData);
              console.log('Staff authentication found in localStorage:', staffProfile);
              setStaffUser(staffProfile);
              clearTimeout(safetyTimeout);
              setLoading(false);
              return; // Exit early if staff is authenticated
            } catch (parseError) {
              console.error('Error parsing staff data:', parseError);
              setStaffUser(null);
            }
          } else {
            console.log('No valid staff authentication found in localStorage');
            setStaffUser(null);
          }
        }

        // Direct check for regular user authentication from Supabase
        try {
          const { data } = await supabase.auth.getSession();

          if (data.session) {
            // Get user directly from Supabase
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
              const userProfile: UserProfile = {
                isStaff: false,
                id: userData.user.id,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || '',
                role: userData.user.user_metadata?.role || 'user',
                staffNumber: userData.user.user_metadata?.staff_number,
                phone_number: '',
                address: '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setUser(userProfile);
              console.log('User authenticated directly from Supabase:', userProfile);
            }
          } else {
            setUser(null);
            console.log('No active Supabase session found');
          }
        } catch (supabaseError) {
          console.error('Error checking Supabase authentication:', supabaseError);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setStaffUser(null);
      } finally {
        // Clear the safety timeout
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener for regular users
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      try {
        // Check if we have staff authentication first
        if (typeof window !== 'undefined') {
          try {
            if (staffAuthService.isAuthenticated()) {
              // If staff is authenticated, don't process regular auth events
              const staffProfile = staffAuthService.getProfile();
              if (staffProfile) {
                console.log('Staff is authenticated, ignoring regular auth events');
                setStaffUser(staffProfile);
                return;
              }
            }
          } catch (staffError) {
            console.error('Error checking staff authentication in auth listener:', staffError);
            // Continue with regular auth processing if staff auth check fails
          }
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
        // Continue processing the auth event even if there's an error
      }

      if (event === 'SIGNED_IN' && session) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setStaffUser(null); // Clear any staff user when regular user signs in
          console.log('User signed in:', profile);
          // Explicitly navigate to dashboard on sign in
          router.push('/dashboard');
        } catch (error) {
          console.error('Error getting user profile after sign in:', error);
          // If we can't get the profile but have a session, still consider the user logged in
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const fallbackProfile: UserProfile = {
              isStaff: false,
              id: userData.user.id,
              email: userData.user.email || '',
              full_name: userData.user.user_metadata?.full_name || '',
              role: userData.user.user_metadata?.role || 'user',
              staffNumber: userData.user.user_metadata?.staff_number,
              phone_number: '',
              address: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUser(fallbackProfile);
            setStaffUser(null); // Clear any staff user
            console.log('Using fallback profile after sign in:', fallbackProfile);
            router.push('/dashboard');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Don't clear staff user on regular user sign out
        console.log('User signed out, redirecting to login');
        router.push('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const login = async (email: string, password: string, staffNumber?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login for:', email);
      const { user } = await authService.login({ email, password, staffNumber });
      setUser(user);
      console.log('Login successful, user:', user);

      // Route to the appropriate dashboard based on user role
      if (user) {
        console.log('Redirecting to dashboard');
        // Use a slight delay to ensure state is updated before redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to login');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    // Immediately reset auth state to improve UI responsiveness
    setStaffUser(null);
    setUser(null);

    // Set a safety timeout to ensure loading state is reset
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      console.log('Safety timeout triggered to reset loading state');
    }, 3000); // 3 seconds max loading time

    try {
      // Direct logout operations
      // Clear staff authentication from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('bgf.staff.token');
        localStorage.removeItem('bgf.staff');
        console.log('Staff data cleared from localStorage');

        // Clear the staff cookie
        document.cookie = `bgf-staff-token=; path=/; max-age=0`;
        console.log('Staff cookie cleared');
      }

      // Logout regular user from Supabase
      try {
        await supabase.auth.signOut();
        console.log('Regular user logged out from Supabase');
      } catch (supabaseError) {
        console.error('Supabase logout error:', supabaseError);
      }

      // Do a full page navigation to ensure all state is cleared
      window.location.href = '/';
    } catch (error: any) {
      setError(error.message || 'Failed to logout');
      console.error('Logout error:', error);
    } finally {
      // Clear the safety timeout if we finish normally
      clearTimeout(safetyTimeout);
      setLoading(false);
    }
  };

  // Helper functions to check authentication status
  const isStaffAuthenticated = () => {
    try {
      // First check if we have a staff user in context
      if (!!staffUser) return true;

      // Direct check for staff token in localStorage
      if (typeof window !== 'undefined') {
        try {
          const staffToken = localStorage.getItem('bgf.staff.token');
          const staffData = localStorage.getItem('bgf.staff');

          if (staffToken && staffData) {
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
            } catch (parseError) {
              console.error('Error parsing staff data:', parseError);
              return false;
            }
          }
        } catch (storageError) {
          console.error('Error accessing localStorage:', storageError);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Unexpected error in isStaffAuthenticated:', error);
      return false;
    }
  };

  const isUserAuthenticated = () => {
    try {
      return !!user;
    } catch (error) {
      console.error('Error in isUserAuthenticated:', error);
      return false;
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);

    try {
      await authService.register(userData);
      router.push('/login');
    } catch (error: any) {
      setError(error.message || 'Failed to register');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    staffUser,
    loading,
    error,
    login,
    logout,
    register,
    isStaffAuthenticated,
    isUserAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
