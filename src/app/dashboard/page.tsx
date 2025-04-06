"use client";

import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, supabase } from '@/lib/supabase';
import UserDashboard from '@/components/dashboards/UserDashboard';
import OfficerDashboard from '@/components/dashboards/OfficerDashboard';
import ManagerDashboard from '@/components/dashboards/ManagerDashboard';
import ExecutiveDashboard from '@/components/dashboards/ExecutiveDashboard';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, staffUser, isStaffAuthenticated, isUserAuthenticated } = useAuth();
  const router = useRouter();

  // Check if user is authenticated on component mount
  useEffect(() => {
    // This code runs only in the browser
    if (typeof window === 'undefined') return;

    // Use the auth context to check authentication
    if (!isStaffAuthenticated() && !isUserAuthenticated()) {
      console.log('Dashboard: No authenticated user found, redirecting to home');
      // Redirect to home page to show both login options
      router.push('/');
    } else {
      console.log('Dashboard: Authenticated user found', {
        isStaff: isStaffAuthenticated(),
        isRegularUser: isUserAuthenticated(),
        staffUser,
        user
      });
    }
  }, [isStaffAuthenticated, isUserAuthenticated, staffUser, user, router]);

  // Render the appropriate dashboard based on user role
  const renderDashboard = () => {
    // Check for staff authentication first
    if (isStaffAuthenticated() && staffUser) {
      console.log('Dashboard: Rendering dashboard for staff', staffUser);

      // Determine which dashboard to show based on staff role
      switch (staffUser.role) {
        case USER_ROLES.ASSISTANT_PROJECT_OFFICER:
        case USER_ROLES.PROJECT_MANAGER:
          return <OfficerDashboard />;

        case USER_ROLES.HEAD_OF_PROGRAMS:
          return <ManagerDashboard />;

        case USER_ROLES.DIRECTOR:
        case USER_ROLES.CEO:
        case USER_ROLES.PATRON:
        case USER_ROLES.ADMIN:
          return <ExecutiveDashboard />;

        default:
          return <UserDashboard />;
      }
    }

    // Fall back to regular user authentication
    if (!user) {
      console.log('Dashboard: No user found in context');
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading user information...</p>
          </div>
        </div>
      );
    }

    console.log('Dashboard: User found, role:', user.role);
    switch (user.role) {
      case USER_ROLES.ASSISTANT_PROJECT_OFFICER:
      case USER_ROLES.REGIONAL_PROJECT_MANAGER:
        return <OfficerDashboard />;

      case USER_ROLES.HEAD_OF_PROGRAMS:
        return <ManagerDashboard />;

      case USER_ROLES.DIRECTOR:
      case USER_ROLES.CEO:
      case USER_ROLES.PATRON:
      case USER_ROLES.ADMIN:
        return <ExecutiveDashboard />;

      case USER_ROLES.USER:
      default:
        return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {renderDashboard()}
    </DashboardLayout>
  );
}
