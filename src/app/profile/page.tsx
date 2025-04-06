"use client";

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiCamera } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/lib/supabase';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');

  const getRoleName = (role?: string): string => {
    if (!role) return 'User';

    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Administrator';
      case USER_ROLES.ASSISTANT_PROJECT_OFFICER:
        return 'Assistant Project Officer';
      case USER_ROLES.PROJECT_MANAGER:
        return 'Project Manager';
      case USER_ROLES.HEAD_OF_PROGRAMS:
        return 'Head of Programs';
      case USER_ROLES.DIRECTOR:
        return 'Director';
      case USER_ROLES.CEO:
        return 'CEO';
      case USER_ROLES.PATRON:
        return 'Patron';
      case USER_ROLES.USER:
        return 'User';
      default:
        return role;
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-bgf-burgundy flex items-center justify-center text-cream">
                  <FiUser size={64} />
                </div>
                <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-slate-gray/20">
                  <FiCamera size={18} />
                </button>
              </div>

              <h2 className="text-xl font-playfair font-semibold">{user?.full_name || 'User Name'}</h2>
              <p className="text-text-muted mt-1">{getRoleName(user?.role)}</p>

              <div className="w-full mt-6">
                <ul className="space-y-2">
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'profile' ? 'bg-bgf-burgundy/10 text-bgf-burgundy' : ''}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <FiUser className="mr-3" />
                      <span>Profile Information</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-md flex items-center ${activeTab === 'security' ? 'bg-bgf-burgundy/10 text-bgf-burgundy' : ''}`}
                      onClick={() => setActiveTab('security')}
                    >
                      <FiLock className="mr-3" />
                      <span>Security</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Profile Information</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-text-muted" />
                      </div>
                      <input
                        type="text"
                        defaultValue={user?.full_name || ''}
                        className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="text-text-muted" />
                      </div>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="text-text-muted" />
                      </div>
                      <input
                        type="tel"
                        defaultValue={user?.phone_number || ''}
                        className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      defaultValue={getRoleName(user?.role)}
                      className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold bg-slate-gray/5"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <FiMapPin className="text-text-muted" />
                    </div>
                    <textarea
                      defaultValue={user?.address || ''}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      rows={3}
                    ></textarea>
                  </div>
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

                <div className="border-t border-slate-gray/10 pt-6 mt-6">
                  <h3 className="text-lg font-playfair font-semibold mb-4">Login Sessions</h3>

                  <div className="bg-slate-gray/5 p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-text-muted text-sm mt-1">Windows • Chrome • Zimbabwe</p>
                      </div>
                      <div className="text-forest-green font-medium">Active Now</div>
                    </div>
                  </div>

                  <Button variant="secondary" className="text-terracotta border-terracotta">
                    Sign Out All Devices
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
