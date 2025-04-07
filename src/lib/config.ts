// API URL for backend services
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// JWT secret for staff authentication
export const JWT_SECRET = process.env.JWT_SECRET || 'bgf-dashboard-secret-key';

// Staff token cookie name
export const STAFF_TOKEN_COOKIE = 'bgf-staff-token';

// Staff token expiration time in seconds (4 hours)
export const STAFF_TOKEN_EXPIRY = 60 * 60 * 4;
