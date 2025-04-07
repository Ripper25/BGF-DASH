/**
 * User interface for both regular users and staff users
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  isStaff: boolean;
  staffNumber?: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
  staffNumber?: string;
}

/**
 * Registration request interface
 */
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  phone_number?: string;
  address?: string;
}

/**
 * Profile update request interface
 */
export interface ProfileUpdateRequest {
  full_name?: string;
  phone_number?: string;
  address?: string;
  avatar_url?: string;
}

/**
 * Password change request interface
 */
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}
