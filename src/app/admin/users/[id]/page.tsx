"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiSave, FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiUserCheck, FiUserX } from 'react-icons/fi';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/user';
import { ROUTES } from '@/app/routes';
import { USER_ROLES } from '@/lib/supabase';

export default function UserEdit({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    role: '',
    status: 'active'
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await userService.getUserById(id);
        setUser(userData);
        
        // Initialize form data
        setFormData({
          full_name: userData.full_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          address: userData.address || '',
          role: userData.role || '',
          status: userData.status || 'active'
        });
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Update user
      const updatedUser = await userService.updateUser(id, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        address: formData.address,
        role: formData.role,
        status: formData.status as 'active' | 'inactive'
      });
      
      // Update local user data
      setUser(updatedUser);
      
      // Show success message
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">
            {loading ? 'Loading User...' : `Edit User: ${user?.full_name || 'Unknown'}`}
          </h1>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.ADMIN_USERS)}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Users
          </Button>
        </div>

        {error && (
          <div className="bg-terracotta/10 p-4 rounded-md text-terracotta mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 p-4 rounded-md text-green-700 mb-6 flex items-center">
            <FiUserCheck className="mr-2" />
            User updated successfully
          </div>
        )}

        {loading ? (
          <Card className="p-6">
            <div className="text-center py-8">Loading user data...</div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiUser className="text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiMail className="text-text-muted" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md bg-slate-gray/5 cursor-not-allowed"
                      placeholder="Email"
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FiPhone className="text-text-muted" />
                    </div>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="">Select Role</option>
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                    <option value={USER_ROLES.ASSISTANT_PROJECT_OFFICER}>Assistant Project Officer</option>
                    <option value={USER_ROLES.PROJECT_MANAGER}>Project Manager</option>
                    <option value={USER_ROLES.HEAD_OF_PROGRAMS}>Head of Programs</option>
                    <option value={USER_ROLES.DIRECTOR}>Director</option>
                    <option value={USER_ROLES.CEO}>CEO</option>
                    <option value={USER_ROLES.PATRON}>Patron</option>
                    <option value={USER_ROLES.USER}>User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <FiMapPin className="text-text-muted" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      placeholder="Address"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Status
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="flex items-center">
                        <FiUserCheck className="mr-1 text-forest-green" />
                        Active
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="flex items-center">
                        <FiUserX className="mr-1 text-terracotta" />
                        Inactive
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-6 border-t border-slate-gray/10">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={saving}
                  className="flex items-center"
                >
                  {saving ? (
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
            </Card>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
