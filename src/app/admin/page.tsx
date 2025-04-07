"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { FiUsers, FiSettings, FiDatabase, FiFileText, FiActivity } from 'react-icons/fi';
import { ROUTES } from '@/app/routes';

export default function AdminDashboard() {
  const router = useRouter();

  // Admin menu items
  const adminMenuItems = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <FiUsers size={24} className="text-bgf-burgundy" />,
      onClick: () => router.push(ROUTES.ADMIN_USERS),
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <FiSettings size={24} className="text-gold" />,
      onClick: () => router.push(ROUTES.ADMIN_SETTINGS),
    },
    {
      title: 'Data Management',
      description: 'Manage application data and backups',
      icon: <FiDatabase size={24} className="text-navy-blue" />,
      onClick: () => {},
    },
    {
      title: 'Activity Logs',
      description: 'View system activity and audit logs',
      icon: <FiActivity size={24} className="text-forest-green" />,
      onClick: () => router.push(ROUTES.ADMIN_ACTIVITY_LOGS),
    },
    {
      title: 'Content Management',
      description: 'Manage website content and pages',
      icon: <FiFileText size={24} className="text-terracotta" />,
      onClick: () => {},
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-playfair font-semibold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={item.onClick}
            >
              <div className="flex items-start">
                <div className="mr-4">
                  {item.icon}
                </div>
                <div>
                  <h2 className="text-lg font-medium mb-2">{item.title}</h2>
                  <p className="text-text-secondary">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
