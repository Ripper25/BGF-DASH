"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiSave, FiUser, FiMail, FiLock, FiBell, FiGlobe, FiDatabase, FiTrash2, FiCheck } from 'react-icons/fi';
import { useNotifications } from '@/contexts/NotificationContext';

// Notification controls component
const NotificationControls = () => {
  const { markAllAsRead, deleteAllNotifications } = useNotifications();

  return (
    <div className="flex space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={markAllAsRead}
      >
        <FiCheck className="mr-2" />
        Mark all read
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={deleteAllNotifications}
        className="text-terracotta border-terracotta hover:bg-terracotta/10"
      >
        <FiTrash2 className="mr-2" />
        Clear all
      </Button>
    </div>
  );
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<string>('general');

  return (
    <DashboardLayout title="Settings">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="p-0">
            <ul className="divide-y divide-slate-gray/10">
              <li>
                <button
                  className={`w-full text-left px-6 py-4 flex items-center ${activeTab === 'general' ? 'bg-slate-gray/5 border-l-[3px] border-bgf-burgundy' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <FiGlobe className="mr-3" />
                  <span>General</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-6 py-4 flex items-center ${activeTab === 'account' ? 'bg-slate-gray/5 border-l-[3px] border-bgf-burgundy' : ''}`}
                  onClick={() => setActiveTab('account')}
                >
                  <FiUser className="mr-3" />
                  <span>Account</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-6 py-4 flex items-center ${activeTab === 'security' ? 'bg-slate-gray/5 border-l-[3px] border-bgf-burgundy' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <FiLock className="mr-3" />
                  <span>Security</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-6 py-4 flex items-center ${activeTab === 'notifications' ? 'bg-slate-gray/5 border-l-[3px] border-bgf-burgundy' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FiBell className="mr-3" />
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button
                  className={`w-full text-left px-6 py-4 flex items-center ${activeTab === 'database' ? 'bg-slate-gray/5 border-l-[3px] border-bgf-burgundy' : ''}`}
                  onClick={() => setActiveTab('database')}
                >
                  <FiDatabase className="mr-3" />
                  <span>Database</span>
                </button>
              </li>
            </ul>
          </Card>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">General Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Bridging Gaps Foundation"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@bridginggaps.org"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold">
                    <option value="Africa/Harare">Africa/Harare (GMT+2:00)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2:00)</option>
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1:00)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (GMT+3:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button variant="primary">
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'account' && (
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Account Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@bridginggaps.org"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue="Administrator"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold bg-slate-gray/5"
                    disabled
                  />
                </div>

                <div className="pt-4">
                  <Button variant="primary">
                    <FiSave className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Security Settings</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div className="pt-4">
                  <Button variant="primary">
                    <FiSave className="mr-2" />
                    Update Password
                  </Button>
                </div>

                <div className="border-t border-slate-gray/10 pt-6 mt-6">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Two-Factor Authentication</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-primary">Enhance your account security with two-factor authentication.</p>
                      <p className="text-text-muted text-sm mt-1">You'll be asked for an additional authentication code when logging in.</p>
                    </div>

                    <div className="ml-4">
                      <Button variant="secondary">Enable 2FA</Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-playfair font-semibold">Notification Settings</h2>
                <NotificationControls />
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">Email Notifications</h3>
                    <p className="text-text-muted text-sm mt-1">Receive email notifications for important updates.</p>
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-gray/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">New Request Notifications</h3>
                    <p className="text-text-muted text-sm mt-1">Receive notifications when new requests are submitted.</p>
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-gray/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">Approval Notifications</h3>
                    <p className="text-text-muted text-sm mt-1">Receive notifications for approval requests and updates.</p>
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-gray/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary">System Notifications</h3>
                    <p className="text-text-muted text-sm mt-1">Receive notifications about system updates and maintenance.</p>
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-gray/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bgf-burgundy"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary">
                    <FiSave className="mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'database' && (
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Database Settings</h2>

              <div className="space-y-6">
                <div className="bg-slate-gray/5 p-4 rounded-md">
                  <h3 className="font-medium text-text-primary mb-2">Database Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-text-muted text-sm">Provider:</p>
                      <p className="font-medium">Supabase</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Status:</p>
                      <p className="font-medium text-forest-green">Connected</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Project ID:</p>
                      <p className="font-medium">roqzswykxwyzyoeazqiu</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-sm">Region:</p>
                      <p className="font-medium">eu-central-1</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-text-primary mb-4">Database Maintenance</h3>

                  <div className="space-y-4">
                    <Button variant="secondary" className="mr-4">
                      Backup Database
                    </Button>

                    <Button variant="secondary" className="mr-4">
                      Clear Cache
                    </Button>

                    <Button variant="secondary" className="text-terracotta border-terracotta">
                      Reset Database
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-gray/10 pt-6 mt-6">
                  <h3 className="font-medium text-text-primary mb-4">API Configuration</h3>

                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      API URL
                    </label>
                    <input
                      type="text"
                      defaultValue="https://roqzswykxwyzyoeazqiu.supabase.co"
                      className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold bg-slate-gray/5"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
