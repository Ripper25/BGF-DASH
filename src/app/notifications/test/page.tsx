"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { notificationService } from '@/services/notification.service';
import { FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiTag } from 'react-icons/fi';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_CATEGORY_LABELS } from '@/constants/notification-categories';

export default function TestNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [category, setCategory] = useState(NOTIFICATION_CATEGORIES.SYSTEM_ANNOUNCEMENT);

  // Set email recipient to user's email when user is loaded
  useEffect(() => {
    if (user?.email) {
      setEmailRecipient(user.email);
    }
  }, [user]);

  const createTestNotification = async (type: 'info' | 'success' | 'warning' | 'error') => {
    try {
      setLoading(true);
      setResult(null);

      // Validate email if send email is enabled
      if (sendEmail && !emailRecipient) {
        setResult('Please enter an email address to send the notification to');
        setLoading(false);
        return;
      }

      const notification = await notificationService.createTestNotification(
        type,
        sendEmail,
        emailRecipient,
        category
      );

      if (notification) {
        let resultMessage = `Successfully created ${type} notification with ID: ${notification.id}`;
        if (sendEmail) {
          resultMessage += ` and sent email to ${emailRecipient}`;
        }
        resultMessage += ` (Category: ${NOTIFICATION_CATEGORY_LABELS[category] || category})`;
        setResult(resultMessage);
      } else {
        setResult(`Failed to create ${type} notification`);
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      setResult('An error occurred while creating the test notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-playfair font-semibold mb-6">Test Real-time Notifications</h1>

        <Card className="p-6">
          <p className="mb-6">
            Use the buttons below to create test notifications of different types. These notifications will be delivered in real-time.
          </p>

          <div className="mb-6 p-4 bg-slate-gray/5 rounded-md">
            <h3 className="font-medium mb-3">Notification Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Email Options</h4>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="sendEmail">Send email notification</label>
                </div>

                {sendEmail && (
                  <div>
                    <label htmlFor="emailRecipient" className="block mb-2 text-sm font-medium">
                      Email Recipient
                    </label>
                    <input
                      type="email"
                      id="emailRecipient"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    />
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Category Options</h4>
                <div>
                  <label htmlFor="category" className="block mb-2 text-sm font-medium">
                    Notification Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    {Object.entries(NOTIFICATION_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-muted mt-1">
                    <FiTag className="inline mr-1" size={12} />
                    Categories help organize notifications and allow filtering
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button
              variant="secondary"
              onClick={() => createTestNotification('info')}
              disabled={loading}
              className="flex items-center justify-center"
            >
              <FiInfo className="mr-2 text-blue-500" />
              Info Notification
            </Button>

            <Button
              variant="secondary"
              onClick={() => createTestNotification('success')}
              disabled={loading}
              className="flex items-center justify-center"
            >
              <FiCheckCircle className="mr-2 text-green-500" />
              Success Notification
            </Button>

            <Button
              variant="secondary"
              onClick={() => createTestNotification('warning')}
              disabled={loading}
              className="flex items-center justify-center"
            >
              <FiAlertTriangle className="mr-2 text-yellow-500" />
              Warning Notification
            </Button>

            <Button
              variant="secondary"
              onClick={() => createTestNotification('error')}
              disabled={loading}
              className="flex items-center justify-center"
            >
              <FiAlertOctagon className="mr-2 text-terracotta" />
              Error Notification
            </Button>
          </div>

          {result && (
            <div className="bg-slate-gray/5 p-4 rounded-md">
              <p className="text-text-secondary">{result}</p>
            </div>
          )}

          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-700 mb-2">How Notifications Work</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-2">
              <li>Notifications are delivered in real-time using Supabase's real-time features</li>
              <li>When a notification is created, it's immediately pushed to all connected clients</li>
              <li>Browser notifications are shown if permission is granted</li>
              <li>Toast notifications appear in the bottom-right corner of the screen</li>
              <li>Notifications are also stored in the database and can be viewed in the notifications panel</li>
              <li>Email notifications can be sent in addition to in-app notifications</li>
              <li>Email notifications use the same content as in-app notifications for consistency</li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
