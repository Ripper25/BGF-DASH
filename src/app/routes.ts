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
  BULK_REQUEST: '/requests/bulk',
  BATCH_PROCESS: '/requests/batch',

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
  NOTIFICATION_PREFERENCES: '/notifications/preferences',
  SCHEDULED_NOTIFICATIONS: '/notifications/scheduled',

  // Protected routes - Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Protected routes - Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAILS: (id: string) => `/admin/users/${id}`,
  ADMIN_USER_NEW: '/admin/users/new',
  ADMIN_ACTIVITY_LOGS: '/admin/activity-logs',
  ADMIN_SETTINGS: '/admin/settings',
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
  [ROUTES.NEW_REQUEST]: [
    USER_ROLES.USER
  ],
  [ROUTES.BULK_REQUEST]: [
    USER_ROLES.USER
  ],
  [ROUTES.BATCH_PROCESS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR
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
  [ROUTES.NOTIFICATIONS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
  [ROUTES.NOTIFICATION_PREFERENCES]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
  [ROUTES.SCHEDULED_NOTIFICATIONS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.ASSISTANT_PROJECT_OFFICER,
    USER_ROLES.PROJECT_MANAGER,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO,
    USER_ROLES.PATRON,
    USER_ROLES.USER
  ],
  [ROUTES.ADMIN_DASHBOARD]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS
  ],
  [ROUTES.ADMIN_USERS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS
  ],
  [ROUTES.ADMIN_USER_NEW]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS
  ],
  [ROUTES.ADMIN_ACTIVITY_LOGS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS,
    USER_ROLES.DIRECTOR,
    USER_ROLES.CEO
  ],
  [ROUTES.ADMIN_SETTINGS]: [
    USER_ROLES.ADMIN,
    USER_ROLES.HEAD_OF_PROGRAMS
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
