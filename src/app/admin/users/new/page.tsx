"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiSave, FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiUserCheck } from 'react-icons/fi';
import { userService } from '@/services/user.service';
import { ROUTES } from '@/app/routes';
import { USER_ROLES } from '@/lib/supabase';

export default function NewUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    address: '',
    role: USER_ROLES.USER,
  });

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.full_name) {
      setError('Full name is required');
      return;
    }
    
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.role) {
      setError('Role is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create user
      await userService.createUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        address: formData.address,
        role: formData.role,
      });
      
      // Redirect to users list
      router.push(ROUTES.ADMIN_USERS);
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Add New User</h1>
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

        <form onSubmit={handleSubmit}>
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-text-secondary font-medium mb-2">
                  Full Name <span className="text-terracotta">*</span>
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
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-2">
                  Email <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiMail className="text-text-muted" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-2">
                  Password <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-text-muted" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary font-medium mb-2">
                  Confirm Password <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiLock className="text-text-muted" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Confirm Password"
                    required
                  />
                </div>
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
                  Role <span className="text-terracotta">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  required
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

              <div className="md:col-span-2">
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
            </div>

            <div className="flex justify-end mt-6 pt-6 border-t border-slate-gray/10">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FiUserCheck className="mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
