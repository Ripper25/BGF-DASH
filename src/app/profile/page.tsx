"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave, FiCamera, FiUpload, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import components
const DeleteAccountModal = dynamic(() => import('@/components/auth/DeleteAccountModal'), {
  ssr: false,
});

const LoginSessionsList = dynamic(() => import('@/components/auth/LoginSessionsList'), {
  ssr: false,
});
import { USER_ROLES } from '@/lib/supabase';
import Avatar from '@/components/ui/Avatar';
import { avatarService } from '@/services/avatar.service';
import { authService } from '@/services/auth.service';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone_number: '',
    address: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      // Try to get the avatar URL from the user object first
      if (user.avatar_url) {
        setAvatarUrl(user.avatar_url);
      } else {
        // Otherwise, fetch it from the avatar service
        const fetchAvatarUrl = async () => {
          try {
            const url = await avatarService.getAvatarUrl(user.id);
            setAvatarUrl(url);

            // Update the user object with the avatar URL
            if (url && setUser) {
              setUser({ ...user, avatar_url: url });
            }
          } catch (error) {
            console.error('Error fetching avatar URL:', error);
          }
        };

        fetchAvatarUrl();
      }
    }
  }, [user?.id, user?.avatar_url]);

  // Initialize profile data from user object
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id || !event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload the avatar
      const url = await avatarService.uploadAvatar(user.id, file);

      // Update the avatar URL in the UI
      setAvatarUrl(url);

      // Update the user object with the new avatar URL
      if (setUser) {
        setUser({ ...user, avatar_url: url });
      }

      // Show success message or notification
      console.log('Avatar uploaded successfully');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      setUploadError(error.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    // Trigger the file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile save
  const handleProfileSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Call the API to update the user profile
      const updatedUser = await authService.updateProfile(user.id, profileData);

      // Update the user in the context
      if (updatedUser && setUser) {
        setUser({
          ...user,
          ...updatedUser
        });
      }

      // Show success message
      setSaveSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

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
                {/* Hidden file input for avatar upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                />

                {/* Avatar display */}
                <div className="relative">
                  <Avatar
                    url={avatarUrl}
                    size="xl"
                    alt={user?.full_name || 'User avatar'}
                  />

                  {/* Upload button */}
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-slate-gray/20 hover:bg-gray-100 transition-colors"
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    aria-label="Upload avatar"
                  >
                    {isUploading ? (
                      <div className="w-[18px] h-[18px] border-2 border-t-transparent border-bgf-burgundy rounded-full animate-spin" />
                    ) : (
                      <FiCamera size={18} />
                    )}
                  </button>
                </div>

                {/* Error message */}
                {uploadError && (
                  <p className="text-red-500 text-xs mt-2">{uploadError}</p>
                )}
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
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleProfileChange}
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
                        name="phone_number"
                        value={profileData.phone_number}
                        onChange={handleProfileChange}
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
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange as any}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4">
                  {saveError && (
                    <div className="mb-4 bg-terracotta/10 text-terracotta p-3 rounded-md">
                      {saveError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center">
                      <FiCheckCircle className="mr-2" />
                      Profile updated successfully!
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={handleProfileSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Save Changes
                      </>
                    )}
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

                  <LoginSessionsList />
                </div>

                <div className="border-t border-slate-gray/10 pt-6 mt-6">
                  <h3 className="text-lg font-playfair font-semibold mb-4 text-terracotta">Danger Zone</h3>

                  <div className="bg-terracotta/5 p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-text-muted text-sm mt-1">
                          Permanently delete your account and all associated data.
                          This action cannot be undone.
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}
    </DashboardLayout>
  );
}
