"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiPlus, FiArrowLeft, FiCalendar, FiClock, FiSend, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import { scheduledNotificationService, ScheduledNotification, ScheduledNotificationInput } from '@/services/scheduled-notification.service';
import { userService } from '@/services/user.service';
import { ROUTES } from '@/app/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function ScheduledNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<ScheduledNotification | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // Fetch scheduled notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const notificationsData = await scheduledNotificationService.getScheduledNotifications();
        setNotifications(notificationsData);
      } catch (err) {
        console.error('Error fetching scheduled notifications:', err);
        setError('Failed to load scheduled notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  // Fetch users and roles for recipient selection
  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        // Fetch users
        const usersData = await userService.getUsers();
        setUsers(usersData);
        
        // Set roles (hardcoded for now, would come from API in a real implementation)
        setRoles([
          'user',
          'admin',
          'assistant_project_officer',
          'project_manager',
          'head_of_programs',
          'director'
        ]);
      } catch (err) {
        console.error('Error fetching users and roles:', err);
      }
    };
    
    if (showCreateModal || editingNotification) {
      fetchUsersAndRoles();
    }
  }, [showCreateModal, editingNotification]);

  // Handle create notification
  const handleCreateNotification = async (data: ScheduledNotificationInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const notification = await scheduledNotificationService.createScheduledNotification(data);
      
      if (notification) {
        setNotifications(prev => [notification, ...prev]);
        setShowCreateModal(false);
      } else {
        setError('Failed to create scheduled notification');
      }
    } catch (err) {
      console.error('Error creating scheduled notification:', err);
      setError('An error occurred while creating the scheduled notification');
    } finally {
      setLoading(false);
    }
  };

  // Handle update notification
  const handleUpdateNotification = async (id: string, data: Partial<ScheduledNotificationInput>) => {
    try {
      setLoading(true);
      setError(null);
      
      const notification = await scheduledNotificationService.updateScheduledNotification(id, data);
      
      if (notification) {
        setNotifications(prev => prev.map(n => n.id === id ? notification : n));
        setEditingNotification(null);
      } else {
        setError('Failed to update scheduled notification');
      }
    } catch (err) {
      console.error('Error updating scheduled notification:', err);
      setError('An error occurred while updating the scheduled notification');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled notification?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const success = await scheduledNotificationService.deleteScheduledNotification(id);
      
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        setError('Failed to delete scheduled notification');
      }
    } catch (err) {
      console.error('Error deleting scheduled notification:', err);
      setError('An error occurred while deleting the scheduled notification');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel notification
  const handleCancelNotification = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled notification?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const notification = await scheduledNotificationService.cancelScheduledNotification(id);
      
      if (notification) {
        setNotifications(prev => prev.map(n => n.id === id ? notification : n));
      } else {
        setError('Failed to cancel scheduled notification');
      }
    } catch (err) {
      console.error('Error cancelling scheduled notification:', err);
      setError('An error occurred while cancelling the scheduled notification');
    } finally {
      setLoading(false);
    }
  };

  // Handle send notification now
  const handleSendNotificationNow = async (id: string) => {
    if (!confirm('Are you sure you want to send this notification now?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const notification = await scheduledNotificationService.sendScheduledNotificationNow(id);
      
      if (notification) {
        setNotifications(prev => prev.map(n => n.id === id ? notification : n));
      } else {
        setError('Failed to send scheduled notification');
      }
    } catch (err) {
      console.error('Error sending scheduled notification:', err);
      setError('An error occurred while sending the scheduled notification');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get recipient display name
  const getRecipientDisplay = (notification: ScheduledNotification) => {
    if (notification.recipient_type === 'all') {
      return 'All Users';
    } else if (notification.recipient_type === 'role') {
      return `Role: ${notification.recipient_id}`;
    } else if (notification.recipient_id) {
      const recipient = users.find(u => u.id === notification.recipient_id);
      return recipient ? recipient.full_name : notification.recipient_id;
    } else {
      return 'Unknown';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Scheduled Notifications</h1>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => router.push(ROUTES.NOTIFICATIONS)}
              className="flex items-center"
            >
              <FiArrowLeft className="mr-2" />
              Back to Notifications
            </Button>
            
            {user?.role === 'admin' || user?.role === 'head_of_programs' && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center"
              >
                <FiPlus className="mr-2" />
                Schedule Notification
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-6 bg-terracotta/10 text-terracotta p-4 rounded-md">
            {error}
          </div>
        )}
        
        <Card className="p-6">
          {loading && notifications.length === 0 ? (
            <div className="text-center py-8">Loading scheduled notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No scheduled notifications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-gray/10">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Recipient</th>
                    <th className="px-4 py-3 text-left">Scheduled For</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Channels</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="border-t border-slate-gray/10">
                      <td className="px-4 py-3">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-text-muted">{notification.message}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getRecipientDisplay(notification)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(notification.scheduled_for)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {notification.send_email && (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Email
                            </span>
                          )}
                          {notification.send_push && (
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              Push
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {notification.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleSendNotificationNow(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Send Now"
                              >
                                <FiSend size={16} />
                              </button>
                              <button
                                onClick={() => setEditingNotification(notification)}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleCancelNotification(notification.id)}
                                className="p-1 text-yellow-600 hover:text-yellow-800"
                                title="Cancel"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-1 text-terracotta hover:text-deep-terracotta"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
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
      
      {/* Create/Edit Modal */}
      {(showCreateModal || editingNotification) && (
        <ScheduledNotificationModal
          notification={editingNotification}
          users={users}
          roles={roles}
          onClose={() => {
            setShowCreateModal(false);
            setEditingNotification(null);
          }}
          onSubmit={(data) => {
            if (editingNotification) {
              handleUpdateNotification(editingNotification.id, data);
            } else {
              handleCreateNotification(data as ScheduledNotificationInput);
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Scheduled Notification Modal Component
interface ScheduledNotificationModalProps {
  notification: ScheduledNotification | null;
  users: any[];
  roles: string[];
  onClose: () => void;
  onSubmit: (data: ScheduledNotificationInput | Partial<ScheduledNotificationInput>) => void;
}

function ScheduledNotificationModal({
  notification,
  users,
  roles,
  onClose,
  onSubmit
}: ScheduledNotificationModalProps) {
  const [formData, setFormData] = useState<ScheduledNotificationInput>({
    title: notification?.title || '',
    message: notification?.message || '',
    type: notification?.type || 'info',
    scheduled_for: notification?.scheduled_for ? new Date(notification.scheduled_for).toISOString().slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    recipient_type: notification?.recipient_type || 'all',
    recipient_id: notification?.recipient_id || '',
    send_email: notification?.send_email ?? true,
    send_push: notification?.send_push ?? true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle recipient type change
  const handleRecipientTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, recipient_type: value as 'user' | 'role' | 'all', recipient_id: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    if (!formData.scheduled_for) {
      newErrors.scheduled_for = 'Scheduled date and time is required';
    } else {
      const scheduledDate = new Date(formData.scheduled_for);
      const now = new Date();
      
      if (scheduledDate <= now) {
        newErrors.scheduled_for = 'Scheduled date and time must be in the future';
      }
    }
    
    if (formData.recipient_type === 'user' && !formData.recipient_id) {
      newErrors.recipient_id = 'User is required';
    }
    
    if (formData.recipient_type === 'role' && !formData.recipient_id) {
      newErrors.recipient_id = 'Role is required';
    }
    
    if (!formData.send_email && !formData.send_push) {
      newErrors.channels = 'At least one notification channel must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-playfair font-semibold">
            {notification ? 'Edit Scheduled Notification' : 'Schedule New Notification'}
          </h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Title <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.title ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                placeholder="Notification title"
              />
              {errors.title && <p className="text-terracotta text-sm mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Message <span className="text-terracotta">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${errors.message ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                placeholder="Notification message"
                rows={3}
              />
              {errors.message && <p className="text-terracotta text-sm mt-1">{errors.message}</p>}
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Scheduled For <span className="text-terracotta">*</span>
              </label>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiCalendar className="text-text-muted" />
                  </div>
                  <input
                    type="datetime-local"
                    name="scheduled_for"
                    value={formData.scheduled_for}
                    onChange={handleChange}
                    className={`w-full pl-10 px-4 py-3 border ${errors.scheduled_for ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                  />
                </div>
              </div>
              {errors.scheduled_for && <p className="text-terracotta text-sm mt-1">{errors.scheduled_for}</p>}
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Recipient
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    value={formData.recipient_type}
                    onChange={handleRecipientTypeChange}
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="all">All Users</option>
                    <option value="user">Specific User</option>
                    <option value="role">User Role</option>
                  </select>
                </div>
                
                {formData.recipient_type !== 'all' && (
                  <div>
                    <select
                      name="recipient_id"
                      value={formData.recipient_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${errors.recipient_id ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                    >
                      <option value="">Select {formData.recipient_type === 'user' ? 'User' : 'Role'}</option>
                      {formData.recipient_type === 'user' ? (
                        users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name}
                          </option>
                        ))
                      ) : (
                        roles.map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.recipient_id && <p className="text-terracotta text-sm mt-1">{errors.recipient_id}</p>}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Notification Channels <span className="text-terracotta">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_email"
                    name="send_email"
                    checked={formData.send_email}
                    onChange={handleCheckboxChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="send_email">Send Email</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="send_push"
                    name="send_push"
                    checked={formData.send_push}
                    onChange={handleCheckboxChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="send_push">Send Push Notification</label>
                </div>
              </div>
              {errors.channels && <p className="text-terracotta text-sm mt-1">{errors.channels}</p>}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-gray/10">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              {notification ? 'Update Notification' : 'Schedule Notification'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
