/**
 * Notification categories for organizing notifications
 */
export const NOTIFICATION_CATEGORIES = {
  // Request-related notifications
  REQUEST_STATUS: 'request_status',
  REQUEST_COMMENT: 'request_comment',
  REQUEST_ASSIGNMENT: 'request_assignment',
  REQUEST_DOCUMENT: 'request_document',
  
  // Account-related notifications
  ACCOUNT_ACTIVITY: 'account_activity',
  ACCOUNT_SECURITY: 'account_security',
  
  // System notifications
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  
  // Other notifications
  OTHER: 'other'
};

/**
 * Notification category labels for display
 */
export const NOTIFICATION_CATEGORY_LABELS: Record<string, string> = {
  [NOTIFICATION_CATEGORIES.REQUEST_STATUS]: 'Request Status',
  [NOTIFICATION_CATEGORIES.REQUEST_COMMENT]: 'Request Comments',
  [NOTIFICATION_CATEGORIES.REQUEST_ASSIGNMENT]: 'Request Assignments',
  [NOTIFICATION_CATEGORIES.REQUEST_DOCUMENT]: 'Request Documents',
  [NOTIFICATION_CATEGORIES.ACCOUNT_ACTIVITY]: 'Account Activity',
  [NOTIFICATION_CATEGORIES.ACCOUNT_SECURITY]: 'Account Security',
  [NOTIFICATION_CATEGORIES.SYSTEM_ANNOUNCEMENT]: 'System Announcements',
  [NOTIFICATION_CATEGORIES.SYSTEM_MAINTENANCE]: 'System Maintenance',
  [NOTIFICATION_CATEGORIES.OTHER]: 'Other'
};

/**
 * Notification category icons for display
 */
export const NOTIFICATION_CATEGORY_ICONS: Record<string, string> = {
  [NOTIFICATION_CATEGORIES.REQUEST_STATUS]: 'status',
  [NOTIFICATION_CATEGORIES.REQUEST_COMMENT]: 'comment',
  [NOTIFICATION_CATEGORIES.REQUEST_ASSIGNMENT]: 'assignment',
  [NOTIFICATION_CATEGORIES.REQUEST_DOCUMENT]: 'document',
  [NOTIFICATION_CATEGORIES.ACCOUNT_ACTIVITY]: 'account',
  [NOTIFICATION_CATEGORIES.ACCOUNT_SECURITY]: 'security',
  [NOTIFICATION_CATEGORIES.SYSTEM_ANNOUNCEMENT]: 'announcement',
  [NOTIFICATION_CATEGORIES.SYSTEM_MAINTENANCE]: 'maintenance',
  [NOTIFICATION_CATEGORIES.OTHER]: 'other'
};

/**
 * Notification category colors for display
 */
export const NOTIFICATION_CATEGORY_COLORS: Record<string, string> = {
  [NOTIFICATION_CATEGORIES.REQUEST_STATUS]: 'bg-blue-100 text-blue-800',
  [NOTIFICATION_CATEGORIES.REQUEST_COMMENT]: 'bg-green-100 text-green-800',
  [NOTIFICATION_CATEGORIES.REQUEST_ASSIGNMENT]: 'bg-purple-100 text-purple-800',
  [NOTIFICATION_CATEGORIES.REQUEST_DOCUMENT]: 'bg-yellow-100 text-yellow-800',
  [NOTIFICATION_CATEGORIES.ACCOUNT_ACTIVITY]: 'bg-indigo-100 text-indigo-800',
  [NOTIFICATION_CATEGORIES.ACCOUNT_SECURITY]: 'bg-red-100 text-red-800',
  [NOTIFICATION_CATEGORIES.SYSTEM_ANNOUNCEMENT]: 'bg-orange-100 text-orange-800',
  [NOTIFICATION_CATEGORIES.SYSTEM_MAINTENANCE]: 'bg-gray-100 text-gray-800',
  [NOTIFICATION_CATEGORIES.OTHER]: 'bg-slate-gray/10 text-text-secondary'
};
