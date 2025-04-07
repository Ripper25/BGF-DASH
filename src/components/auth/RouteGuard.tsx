"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasRouteAccess, ROUTES } from '@/app/routes';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, staffUser, loading, isStaffAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if route requires authentication
    const checkAuth = () => {
      // If still loading auth state, wait
      if (loading) return;

      // Public routes - allow access
      if (
        pathname === ROUTES.LOGIN ||
        pathname === ROUTES.STAFF_LOGIN ||
        pathname === ROUTES.LOGIN_GUIDE ||
        pathname === ROUTES.FORGOT_PASSWORD ||
        pathname === ROUTES.RESET_PASSWORD ||
        pathname === '/' ||
        pathname === '/register'
      ) {
        setAuthorized(true);
        return;
      }

      // Check for staff authentication first
      if (isStaffAuthenticated() && staffUser) {
        console.log('RouteGuard: Staff user authenticated', staffUser);
        // Check if staff user has access to this route based on their role
        if (hasRouteAccess(pathname, staffUser.role)) {
          console.log('RouteGuard: Staff user has access to route', { role: staffUser.role, pathname });
          setAuthorized(true);
        } else {
          console.log('RouteGuard: Staff user does not have access to route', { role: staffUser.role, pathname });
          setAuthorized(false);
          router.push(ROUTES.DASHBOARD);
        }
        return;
      }

      // No regular user, redirect to login
      if (!user) {
        console.log('RouteGuard: No authenticated user found');
        setAuthorized(false);
        router.push(ROUTES.LOGIN);
        return;
      }

      // Check if regular user has access to this route
      if (hasRouteAccess(pathname, user.role)) {
        console.log('RouteGuard: User has access to route', { role: user.role, pathname });
        setAuthorized(true);
      } else {
        console.log('RouteGuard: User does not have access to route', { role: user.role, pathname });
        setAuthorized(false);
        router.push(ROUTES.DASHBOARD);
      }
    };

    checkAuth();
  }, [user, staffUser, loading, pathname, router, isStaffAuthenticated]);

  // Show loading or unauthorized message
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-playfair font-bold text-bgf-burgundy mb-2">Access Denied</h1>
          <p className="text-text-secondary mb-4">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push(ROUTES.DASHBOARD)}
            className="bg-bgf-burgundy text-white py-2 px-4 rounded-sm hover:bg-deep-burgundy transition-colors duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If authorized, render children
  return <>{children}</>;
};

export default RouteGuard;
