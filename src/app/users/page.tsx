"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
// No need for auth context
// Define a simple UserProfile type
type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
};
import { USER_ROLES } from '@/lib/supabase';

export default function Users() {
  // No need to get user for this page
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Set empty users array since there's no database
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, currentPage, searchQuery]);

  const getRoleName = (role: string): string => {
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
    <DashboardLayout title="Users">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="primary">
            <FiPlus className="mr-2" />
            New User
          </Button>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-slate-gray/30 focus:outline-none focus:ring-1 focus:ring-gold"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="border border-slate-gray/30 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-gold"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value={USER_ROLES.ADMIN}>Administrator</option>
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-gray/20">
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Name</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Email</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Role</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Created</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-terracotta">{error}</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-gray/10 hover:bg-slate-gray/5">
                    <td className="py-4 px-6 font-lato text-text-primary">{user.full_name}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{user.email}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{getRoleName(user.role)}</td>
                    <td className="py-4 px-6 font-lato text-text-muted">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Button variant="tertiary" size="sm">
                          <FiEdit className="mr-1" /> Edit
                        </Button>
                        <Button variant="tertiary" size="sm">
                          <FiTrash2 className="mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 px-6">
          <div className="text-sm text-text-muted">
            {loading ? (
              'Loading...'
            ) : (
              <>Showing <span className="font-medium">0</span> to <span className="font-medium">0</span> of <span className="font-medium">0</span> users</>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex space-x-1">
              <Button
                variant="secondary"
                size="sm"
                className="px-3"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                <FiChevronLeft size={18} />
              </Button>

              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "primary" : "secondary"}
                  size="sm"
                  className="px-4"
                  onClick={() => setCurrentPage(i + 1)}
                  disabled={loading}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="secondary"
                size="sm"
                className="px-3"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || loading}
              >
                <FiChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
