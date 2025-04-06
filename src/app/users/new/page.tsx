"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiArrowLeft, FiSave, FiUser, FiMail, FiLock, FiPhone, FiMapPin } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';
import { USER_ROLES } from '@/lib/supabase';
import { ROUTES } from '@/app/routes';

export default function NewUser() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: USER_ROLES.USER,
    phone_number: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // In a real application, we would send this to the API
      // const userData = await userService.createUser({
      //   full_name: formData.full_name,
      //   email: formData.email,
      //   password: formData.password,
      //   role: formData.role,
      //   phone_number: formData.phone_number || undefined,
      //   address: formData.address || undefined,
      // });

      // For now, we'll just show an alert
      alert('User created successfully!');

      // Redirect to users list
      router.push(ROUTES.USERS);
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert(`Error: ${err.message || 'Failed to create user'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="New User">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.USERS)}>
          <FiArrowLeft className="mr-2" />
          Back to Users
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">User Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Full Name <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-text-muted" />
                    </div>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.full_name ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.full_name && <p className="text-terracotta text-sm mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-text-secondary font-medium mb-2">
                    Email Address <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-text-muted" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && <p className="text-terracotta text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Password <span className="text-terracotta">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-text-muted" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                        placeholder="Enter password"
                      />
                    </div>
                    {errors.password && <p className="text-terracotta text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-text-secondary font-medium mb-2">
                      Confirm Password <span className="text-terracotta">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="text-text-muted" />
                      </div>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 border ${errors.confirm_password ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {errors.confirm_password && <p className="text-terracotta text-sm mt-1">{errors.confirm_password}</p>}
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
                    className={`w-full px-4 py-3 border ${errors.role ? 'border-terracotta' : 'border-slate-gray/30'} rounded-md focus:outline-none focus:ring-1 focus:ring-gold`}
                  >
                    <option value={USER_ROLES.USER}>User</option>
                    <option value={USER_ROLES.ASSISTANT_PROJECT_OFFICER}>Assistant Project Officer</option>
                    <option value={USER_ROLES.PROJECT_MANAGER}>Project Manager</option>
                    <option value={USER_ROLES.HEAD_OF_PROGRAMS}>Head of Programs</option>
                    <option value={USER_ROLES.DIRECTOR}>Director</option>
                    <option value={USER_ROLES.CEO}>CEO</option>
                    <option value={USER_ROLES.PATRON}>Patron</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                  </select>
                  {errors.role && <p className="text-terracotta text-sm mt-1">{errors.role}</p>}
                </div>
              </div>
            </Card>

            <Card className="mt-6">
              <h2 className="text-xl font-playfair font-semibold mb-6">Contact Information</h2>

              <div className="space-y-6">
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
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      placeholder="Enter phone number"
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
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                      rows={3}
                      placeholder="Enter address"
                    ></textarea>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-playfair font-semibold mb-6">Role Information</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Role Description</h3>
                  <div className="bg-slate-gray/5 p-4 rounded-md">
                    {formData.role === USER_ROLES.ADMIN && (
                      <p className="text-text-secondary">Administrators have full access to all features and settings of the system.</p>
                    )}
                    {formData.role === USER_ROLES.ASSISTANT_PROJECT_OFFICER && (
                      <p className="text-text-secondary">Assistant Project Officers handle the verification and due diligence of requests.</p>
                    )}
                    {formData.role === USER_ROLES.REGIONAL_PROJECT_MANAGER && (
                      <p className="text-text-secondary">Regional Project Managers oversee projects in specific regions and review requests.</p>
                    )}
                    {formData.role === USER_ROLES.HEAD_OF_PROGRAMS && (
                      <p className="text-text-secondary">Head of Programs manages all programs and is responsible for initial and final reviews of requests.</p>
                    )}
                    {formData.role === USER_ROLES.DIRECTOR && (
                      <p className="text-text-secondary">Directors review approved requests and forward them to the executive team.</p>
                    )}
                    {formData.role === USER_ROLES.CEO && (
                      <p className="text-text-secondary">The CEO has final approval authority for all requests and oversees all operations.</p>
                    )}
                    {formData.role === USER_ROLES.PATRON && (
                      <p className="text-text-secondary">Patrons have oversight of the foundation and can view all approved requests.</p>
                    )}
                    {formData.role === USER_ROLES.USER && (
                      <p className="text-text-secondary">Regular users can submit requests and track their status.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-gray/10 pt-6">
                  <h3 className="font-medium mb-3">Access Permissions</h3>
                  <ul className="space-y-2 text-text-secondary">
                    {formData.role === USER_ROLES.ADMIN && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Full system access</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>User management</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>System settings</span>
                        </li>
                      </>
                    )}
                    {(formData.role === USER_ROLES.ASSISTANT_PROJECT_OFFICER || formData.role === USER_ROLES.REGIONAL_PROJECT_MANAGER) && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Review assigned requests</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Conduct due diligence</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Submit verification reports</span>
                        </li>
                      </>
                    )}
                    {formData.role === USER_ROLES.HEAD_OF_PROGRAMS && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Initial review of all requests</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Assign requests to officers</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Final review before director approval</span>
                        </li>
                      </>
                    )}
                    {formData.role === USER_ROLES.DIRECTOR && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Review verified requests</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Forward to executive team</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Access to reports</span>
                        </li>
                      </>
                    )}
                    {(formData.role === USER_ROLES.CEO || formData.role === USER_ROLES.PATRON) && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Final approval authority</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>View all requests and reports</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Executive dashboard access</span>
                        </li>
                      </>
                    )}
                    {formData.role === USER_ROLES.USER && (
                      <>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Submit new requests</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Track request status</span>
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-forest-green rounded-full mr-2"></span>
                          <span>Update personal profile</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    type="submit"
                    disabled={loading}
                  >
                    <FiSave className="mr-2" />
                    {loading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
