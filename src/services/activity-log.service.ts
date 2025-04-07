import { supabase } from '@/lib/supabase';

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export interface ActivityLogFilter {
  user_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Activity logging service for tracking user actions
 */
export const activityLogService = {
  /**
   * Log an activity
   * @param data - Activity data
   * @returns Created activity log entry
   */
  async logActivity(data: {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
  }): Promise<ActivityLogEntry | null> {
    try {
      // Get user information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', data.user_id)
        .single();
      
      if (userError) {
        console.warn('Error fetching user data for activity log:', userError);
      }
      
      // Create activity log entry
      const { data: logData, error: logError } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: data.user_id,
          user_email: userData?.email,
          user_name: userData?.full_name,
          action: data.action,
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          details: data.details,
          ip_address: '127.0.0.1', // In a real implementation, this would be the actual IP
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (logError) throw new Error(logError.message);
      
      return logData;
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return null;
    }
  },
  
  /**
   * Get activity logs with filtering
   * @param filter - Activity log filter
   * @returns Activity log entries
   */
  async getActivityLogs(filter: ActivityLogFilter = {}): Promise<ActivityLogEntry[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }
      
      if (filter.action) {
        query = query.eq('action', filter.action);
      }
      
      if (filter.entity_type) {
        query = query.eq('entity_type', filter.entity_type);
      }
      
      if (filter.entity_id) {
        query = query.eq('entity_id', filter.entity_id);
      }
      
      if (filter.start_date) {
        query = query.gte('created_at', filter.start_date);
      }
      
      if (filter.end_date) {
        query = query.lte('created_at', filter.end_date);
      }
      
      // Apply pagination
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      
      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  },
  
  /**
   * Get activity log entry by ID
   * @param id - Activity log entry ID
   * @returns Activity log entry
   */
  async getActivityLogById(id: string): Promise<ActivityLogEntry | null> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching activity log ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Get recent activity logs for a user
   * @param userId - User ID
   * @param limit - Maximum number of logs to return
   * @returns Recent activity log entries
   */
  async getUserRecentActivity(userId: string, limit: number = 5): Promise<ActivityLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw new Error(error.message);
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching recent activity for user ${userId}:`, error);
      return [];
    }
  }
};
