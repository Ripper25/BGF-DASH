import { supabase } from '@/lib/supabase';

export interface ExecutiveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalAmount: number;
}

export interface RequestTypeStats {
  type: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
  amount: number;
}

export interface PendingApproval {
  id: string;
  request_id: string;
  title: string;
  requester_name: string;
  amount: number;
  status: string;
  current_stage: string;
  created_at: string;
}

/**
 * Service for executive-specific operations
 */
export const executiveService = {
  /**
   * Get executive dashboard statistics
   * @param role - User role
   * @returns Dashboard statistics
   */
  async getDashboardStats(role: string): Promise<ExecutiveStats> {
    try {
      // Get total requests count
      const { count: total, error: totalError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw new Error(totalError.message);

      // Get pending requests count
      const { count: pending, error: pendingError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'in_review', 'under_review']);

      if (pendingError) throw new Error(pendingError.message);

      // Get approved requests count
      const { count: approved, error: approvedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (approvedError) throw new Error(approvedError.message);

      // Get rejected requests count
      const { count: rejected, error: rejectedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');

      if (rejectedError) throw new Error(rejectedError.message);

      // For total amount, we would need a financial_details table or amount field
      // For now, we'll use a placeholder value
      const totalAmount = 0;

      return {
        total: total || 0,
        pending: pending || 0,
        approved: approved || 0,
        rejected: rejected || 0,
        totalAmount
      };
    } catch (error: any) {
      console.error('Error fetching executive dashboard stats:', error);
      // Return default values in case of error
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalAmount: 0
      };
    }
  },

  /**
   * Get request type statistics
   * @returns Request type statistics
   */
  async getRequestTypeStats(): Promise<RequestTypeStats[]> {
    try {
      // Get request counts by type
      const { data, error } = await supabase
        .from('requests')
        .select('request_type, count')
        .select('request_type')
        .order('request_type');

      if (error) throw new Error(error.message);

      // Count occurrences of each request type
      const typeCounts: Record<string, number> = {};
      data.forEach(item => {
        const type = item.request_type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      // Calculate total
      const total = Object.values(typeCounts).reduce((sum, count) => sum + count, 0);

      // Convert to array with percentages
      return Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }));
    } catch (error: any) {
      console.error('Error fetching request type stats:', error);
      // Return empty array in case of error
      return [];
    }
  },

  /**
   * Get monthly request trends
   * @param months - Number of months to include
   * @returns Monthly trends
   */
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // Get requests within date range
      const { data, error } = await supabase
        .from('requests')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw new Error(error.message);

      // Initialize monthly counts
      const monthlyData: Record<string, { count: number; amount: number }> = {};
      
      // Initialize all months in the range
      for (let i = 0; i < months; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }

      // Count requests by month
      data.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].count += 1;
          // For amount, we would need a financial_details table or amount field
          // For now, we'll use a placeholder value
          monthlyData[monthKey].amount += 0;
        }
      });

      // Convert to array
      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount
      }));
    } catch (error: any) {
      console.error('Error fetching monthly trends:', error);
      // Return empty array in case of error
      return [];
    }
  },

  /**
   * Get pending approvals for executive
   * @param role - User role
   * @returns Pending approvals
   */
  async getPendingApprovals(role: string): Promise<PendingApproval[]> {
    try {
      let query = supabase
        .from('request_workflow')
        .select(`
          id,
          request_id,
          current_stage,
          created_at,
          requests(
            title,
            status,
            user_id
          )
        `);

      // Filter based on role and approval stage
      if (role === 'director') {
        query = query.eq('current_stage', 'director_review');
      } else if (role === 'ceo' || role === 'patron') {
        query = query.eq('current_stage', 'executive_approval');
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      // Get user names for the requests
      const userIds = data
        .map(item => item.requests?.user_id)
        .filter(Boolean) as string[];

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      if (userError) throw new Error(userError.message);

      // Create a map of user IDs to names
      const userMap = new Map(userData.map(user => [user.id, user.full_name]));

      // Transform the data
      return data.map(item => ({
        id: item.id,
        request_id: item.request_id,
        title: item.requests?.title || 'Unknown',
        requester_name: userMap.get(item.requests?.user_id) || 'Unknown',
        amount: 0, // Placeholder for amount
        status: item.requests?.status || 'Unknown',
        current_stage: item.current_stage,
        created_at: item.created_at
      }));
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      // Return empty array in case of error
      return [];
    }
  }
};
