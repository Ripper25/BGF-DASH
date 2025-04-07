"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiSearch, FiFilter, FiDownload, FiClock, FiUser, FiActivity, FiDatabase } from 'react-icons/fi';
import { activityLogService, ActivityLogEntry, ActivityLogFilter } from '@/services/activity-log.service';
import { userService } from '@/services/user.service';
import { ROUTES } from '@/app/routes';
import { formatDistanceToNow } from 'date-fns';

export default function ActivityLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<ActivityLogFilter>({
    limit: 50
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch activity logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const logsData = await activityLogService.getActivityLogs(filter);
        setLogs(logsData);
      } catch (err: any) {
        console.error('Error fetching activity logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [filter]);

  // Fetch users for filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (err: any) {
        console.error('Error fetching users:', err);
      }
    };
    
    fetchUsers();
  }, []);

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Already handled by the useEffect dependency on filter
  };

  // Reset filters
  const resetFilters = () => {
    setFilter({
      limit: 50
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Get time ago for display
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Get action display name
  const getActionDisplay = (action: string) => {
    const actionMap: Record<string, string> = {
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'login': 'Logged In',
      'logout': 'Logged Out',
      'view': 'Viewed',
      'approve': 'Approved',
      'reject': 'Rejected',
      'assign': 'Assigned',
      'comment': 'Commented',
      'upload': 'Uploaded',
      'download': 'Downloaded'
    };
    
    return actionMap[action] || action;
  };

  // Get entity type display name
  const getEntityTypeDisplay = (entityType: string) => {
    const entityTypeMap: Record<string, string> = {
      'user': 'User',
      'request': 'Request',
      'document': 'Document',
      'comment': 'Comment',
      'workflow': 'Workflow',
      'notification': 'Notification',
      'system': 'System'
    };
    
    return entityTypeMap[entityType] || entityType;
  };

  // Export logs as CSV
  const exportLogs = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }
    
    // Create CSV content
    const headers = ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Date'];
    const rows = logs.map(log => [
      log.id,
      log.user_name || log.user_email || log.user_id,
      getActionDisplay(log.action),
      getEntityTypeDisplay(log.entity_type),
      log.entity_id || '',
      log.ip_address || '',
      formatDate(log.created_at)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Activity Logs</h1>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => router.push(ROUTES.ADMIN_DASHBOARD)}
              className="flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Admin
            </Button>
            <Button
              variant="secondary"
              onClick={exportLogs}
              className="flex items-center"
              disabled={logs.length === 0 || loading}
            >
              <FiDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Filters</h2>
            <Button
              variant="tertiary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <FiFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    User
                  </label>
                  <select
                    name="user_id"
                    value={filter.user_id || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Action
                  </label>
                  <select
                    name="action"
                    value={filter.action || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">All Actions</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="view">View</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="assign">Assign</option>
                    <option value="comment">Comment</option>
                    <option value="upload">Upload</option>
                    <option value="download">Download</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Entity Type
                  </label>
                  <select
                    name="entity_type"
                    value={filter.entity_type || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">All Entity Types</option>
                    <option value="user">User</option>
                    <option value="request">Request</option>
                    <option value="document">Document</option>
                    <option value="comment">Comment</option>
                    <option value="workflow">Workflow</option>
                    <option value="notification">Notification</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Entity ID
                  </label>
                  <input
                    type="text"
                    name="entity_id"
                    value={filter.entity_id || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Entity ID"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={filter.start_date || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={filter.end_date || ''}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          {error && (
            <div className="bg-terracotta/10 p-4 rounded-md text-terracotta mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-text-muted text-sm">Loading activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No activity logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-gray/10">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Entity</th>
                    <th className="px-4 py-3 text-left">IP Address</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-slate-gray/10 hover:bg-slate-gray/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FiUser className="mr-2 text-bgf-burgundy" />
                          <div>
                            <div className="font-medium">{log.user_name || 'Unknown'}</div>
                            <div className="text-xs text-text-muted">{log.user_email || log.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FiActivity className="mr-2 text-gold" />
                          <span>{getActionDisplay(log.action)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FiDatabase className="mr-2 text-navy-blue" />
                          <div>
                            <div>{getEntityTypeDisplay(log.entity_type)}</div>
                            {log.entity_id && (
                              <div className="text-xs text-text-muted">{log.entity_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.ip_address || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FiClock className="mr-2 text-forest-green" />
                          <div>
                            <div>{formatDate(log.created_at)}</div>
                            <div className="text-xs text-text-muted">{getTimeAgo(log.created_at)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
