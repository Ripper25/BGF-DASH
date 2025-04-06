import { USER_ROLES } from '@/lib/supabase';

// Define route access by role
export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  STAFF_LOGIN: '/staff-login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  LOGIN_GUIDE: '/login-guide',

  // Protected routes - Dashboard
  DASHBOARD: '/dashboard',

  // Protected routes - Requests
  REQUESTS: '/requests',
  REQUEST_DETAILS: (id: string) => `/requests/${id}`,
  NEW_REQUEST: '/requests/new',

  // Protected routes - Users
  USERS: '/users',
  USER_DETAILS: (id: string) => `/users/${id}`,
  NEW_USER: '/users/new',

  // Protected routes - Workflow
  APPROVALS: '/approvals',
  APPROVAL_DETAILS: (id: string) => `/approvals/${id}`,

  // Protected routes - Reports
  REPORTS: '/reports',

  // Protected routes - Notifications
  NOTIFICATIONS: '/notifications',

  // Protected routes - Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
};

// Define route access by role
export const ROUTE_ACCESS = {
  [ROUTES.DASHBOARD]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
  [ROUTES.REQUESTS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
  [ROUTES.USERS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS
  ],
  [ROUTES.APPROVALS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON
  ],
  [ROUTES.REPORTS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON
  ],
  [ROUTES.SETTINGS]: [
    USER_ROLES.ADMIN
  ],
  [ROUTES.PROFILE]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
};

// Check if a user has access to a route
export const hasRouteAccess = (route: string, userRole?: string): boolean => {
  if (!userRole) return false;

  // Find the matching route pattern
  const routePattern = Object.keys(ROUTE_ACCESS).find(pattern => {
    if (pattern === route) return true;

    // Handle dynamic routes
    if (pattern.includes(':')) {
      const regex = new RegExp(
        '^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$'
      );
      return regex.test(route);
    }

    return false;
  });

  if (!routePattern) return false;

  return ROUTE_ACCESS[routePattern as keyof typeof ROUTE_ACCESS].includes(userRole as any);
};
