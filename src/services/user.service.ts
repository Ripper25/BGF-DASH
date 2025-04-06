import { apiService } from './api';
import { UserProfile } from './auth.service';

/**
 * User service for handling user-related operations
 */
export const userService = {
  /**
   * Get all users with optional role filter
   * @param role - Optional role filter
   */
  async getAllUsers(role?: string): Promise<UserProfile[]> {
    return apiService.get<UserProfile[]>('/users', { role });
  },

  /**
   * Get a user by ID
   * @param userId - User ID
   */
  async getUserById(userId: string): Promise<UserProfile> {
    return apiService.get<UserProfile>(`/users/${userId}`);
  },

  /**
   * Create a new user (admin only)
   * @param userData - User data
   */
  async createUser(userData: any): Promise<UserProfile> {
    return apiService.post<UserProfile>('/users', userData);
  },

  /**
   * Update a user (admin only)
   * @param userId - User ID
   * @param userData - Updated user data
   */
  async updateUser(userId: string, userData: Partial<UserProfile>): Promise<UserProfile> {
    return apiService.put<UserProfile>(`/users/${userId}`, userData);
  },

  /**
   * Delete a user (admin only)
   * @param userId - User ID
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/users/${userId}`);
  },
};
