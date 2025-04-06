import { apiService } from './api';
import { RequestData } from './request.service';

export interface DashboardStats {
  total_requests: number;
  pending_approvals: number;
  approved_requests: number;
  rejected_requests: number;
  requests_by_status: Record<string, number>;
  requests_by_type: Record<string, number>;
  recent_requests: RequestData[];
}

/**
 * Dashboard service for handling dashboard-related operations
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/dashboard/stats');
  },

  /**
   * Get recent requests
   * @param limit - Number of requests to return
   */
  async getRecentRequests(limit: number = 5): Promise<RequestData[]> {
    return apiService.get<RequestData[]>('/dashboard/recent-requests', { limit });
  },
};
