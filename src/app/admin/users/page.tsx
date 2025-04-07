"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiUserX } from 'react-icons/fi';
import { ROUTES } from '@/app/routes';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/types/user';
import { USER_ROLES } from '@/lib/supabase';

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all users
        const usersData = await userService.getAllUsers();
        setUsers(usersData);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' ||
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'Admin';
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
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">User Management</h1>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.ADMIN_USER_NEW)}
            className="flex items-center"
          >
            <FiPlus className="mr-2" />
            Add User
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-text-muted" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold w-full md:w-64"
              />
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <label className="text-text-secondary whitespace-nowrap">Filter by role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold w-full"
              >
                <option value="all">All Roles</option>
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
          </div>

          {error && (
            <div className="bg-terracotta/10 p-4 rounded-md text-terracotta mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              No users found matching your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-gray/10">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-gray/10">
                      <td className="px-4 py-3">
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{getRoleDisplayName(user.role)}</td>
                      <td className="px-4 py-3">
                        {user.status === 'inactive' ? (
                          <span className="flex items-center text-terracotta">
                            <FiUserX className="mr-1" />
                            Inactive
                          </span>
                        ) : (
                          <span className="flex items-center text-forest-green">
                            <FiUserCheck className="mr-1" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(ROUTES.ADMIN_USER_DETAILS(user.id))}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit User"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                // Delete user functionality would go here
                                alert('Delete functionality not implemented yet');
                              }
                            }}
                            className="p-1 text-terracotta hover:text-deep-terracotta"
                            title="Delete User"
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
    </DashboardLayout>
  );
}
