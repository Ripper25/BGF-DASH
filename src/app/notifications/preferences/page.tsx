"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiSave, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { emailService, EmailPreference } from '@/services/email.service';
import { ROUTES } from '@/app/routes';

// Dynamically import the PushNotificationToggle component
const PushNotificationToggle = dynamic(() => import('@/components/notifications/PushNotificationToggle'), {
  ssr: false,
});

// Define notification types
const NOTIFICATION_TYPES = {
  REQUEST_STATUS_CHANGE: 'request_status_change',
  REQUEST_COMMENT: 'request_comment',
  REQUEST_ASSIGNMENT: 'request_assignment',
  ACCOUNT_ACTIVITY: 'account_activity',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

// Define notification type labels
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  [NOTIFICATION_TYPES.REQUEST_STATUS_CHANGE]: 'Request Status Changes',
  [NOTIFICATION_TYPES.REQUEST_COMMENT]: 'Request Comments',
  [NOTIFICATION_TYPES.REQUEST_ASSIGNMENT]: 'Request Assignments',
  [NOTIFICATION_TYPES.ACCOUNT_ACTIVITY]: 'Account Activity',
  [NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT]: 'System Announcements'
};

export default function NotificationPreferences() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch email preferences from the API
        const emailPreferences = await emailService.getEmailPreferences();

        // Convert to a record of notification type to boolean
        const preferencesRecord: Record<string, boolean> = {};

        // Initialize with defaults (all enabled)
        Object.keys(NOTIFICATION_TYPES).forEach(key => {
          const notificationType = NOTIFICATION_TYPES[key as keyof typeof NOTIFICATION_TYPES];
          preferencesRecord[notificationType] = true;
        });

        // Override with user preferences
        emailPreferences.forEach(preference => {
          preferencesRecord[preference.notification_type] = preference.email_enabled;
        });

        setPreferences(preferencesRecord);
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Handle preference change
  const handlePreferenceChange = (notificationType: string, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [notificationType]: enabled
    }));
  };

  // Handle save preferences
  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Save preferences to the API
      await emailService.updateEmailPreferences(preferences);

      // Show success message
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Notification Preferences</h1>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.NOTIFICATIONS)}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Notifications
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading preferences...</div>
          ) : (
            <>
              <p className="mb-6">
                Configure which notifications you want to receive via email. All notifications will still be available in the app.
              </p>

              {error && (
                <div className="mb-6 bg-terracotta/10 text-terracotta p-4 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
                  <FiCheck className="mr-2" />
                  Notification preferences saved successfully
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-lg font-medium">Email Notifications</h2>

                <div className="space-y-4">
                  {Object.entries(NOTIFICATION_TYPES).map(([key, value]) => (
                    <div key={value} className="flex items-center justify-between p-4 bg-slate-gray/5 rounded-md">
                      <div>
                        <h3 className="font-medium">{NOTIFICATION_TYPE_LABELS[value]}</h3>
                        <p className="text-sm text-text-muted">
                          {getNotificationDescription(value)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm">
                          {preferences[value] ? 'Enabled' : 'Disabled'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences[value] || false}
                            onChange={(e) => handlePreferenceChange(value, e.target.checked)}
                            disabled={saving}
                          />
                          <div className="w-11 h-6 bg-slate-gray/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-gray/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-gray/10">
                  <h2 className="text-lg font-medium mb-6">Push Notifications</h2>
                  <PushNotificationToggle />
                </div>

                <div className="flex justify-end pt-4 mt-8">
                  <Button
                    variant="primary"
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="flex items-center"
                  >
                    <FiSave className="mr-2" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Helper function to get notification description
function getNotificationDescription(notificationType: string): string {
  switch (notificationType) {
    case NOTIFICATION_TYPES.REQUEST_STATUS_CHANGE:
      return 'Receive emails when the status of your requests changes';
    case NOTIFICATION_TYPES.REQUEST_COMMENT:
      return 'Receive emails when someone comments on your requests';
    case NOTIFICATION_TYPES.REQUEST_ASSIGNMENT:
      return 'Receive emails when a request is assigned to you';
    case NOTIFICATION_TYPES.ACCOUNT_ACTIVITY:
      return 'Receive emails about account activity such as password changes';
    case NOTIFICATION_TYPES.SYSTEM_ANNOUNCEMENT:
      return 'Receive emails about system announcements and updates';
    default:
      return 'Receive emails for this notification type';
  }
}
