"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBadge from '@/components/notifications/NotificationBadge';
import { ROUTES } from '@/app/routes';
import { USER_ROLES } from '@/lib/supabase';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, staffUser, logout, isStaffAuthenticated } = useAuth();

  // Determine the user's role - use staff role if authenticated as staff, otherwise use regular user role
  const userRole = isStaffAuthenticated() && staffUser ? staffUser.role : user?.role;

  const navItems = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: <Icon name="House" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.ASSISTANT_PROJECT_OFFICER,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.HEAD_OF_PROGRAMS,
        USER_ROLES.DIRECTOR,
        USER_ROLES.CEO,
        USER_ROLES.PATRON,
        USER_ROLES.USER
      ]
    },
    {
      name: 'Requests',
      href: ROUTES.REQUESTS,
      icon: <Icon name="FileText" size={24} weight="fill" />,
      roles: [
        USER_ROLES.USER
      ]
    },
    {
      name: 'View Requests',
      href: ROUTES.REQUESTS,
      icon: <Icon name="FileText" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.ASSISTANT_PROJECT_OFFICER,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.HEAD_OF_PROGRAMS,
        USER_ROLES.DIRECTOR,
        USER_ROLES.CEO,
        USER_ROLES.PATRON
      ]
    },
    {
      name: 'Approvals',
      href: ROUTES.APPROVALS,
      icon: <Icon name="CheckSquare" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.ASSISTANT_PROJECT_OFFICER,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.HEAD_OF_PROGRAMS,
        USER_ROLES.DIRECTOR,
        USER_ROLES.CEO,
        USER_ROLES.PATRON
      ]
    },
    {
      name: 'Admin',
      href: ROUTES.ADMIN_DASHBOARD,
      icon: <Icon name="Gear" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.HEAD_OF_PROGRAMS
      ]
    },
    {
      name: 'Reports',
      href: ROUTES.REPORTS,
      icon: <Icon name="ChartBar" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.HEAD_OF_PROGRAMS,
        USER_ROLES.DIRECTOR,
        USER_ROLES.CEO,
        USER_ROLES.PATRON
      ]
    },
    {
      name: 'Notifications',
      href: ROUTES.NOTIFICATIONS,
      icon: <Icon name="Bell" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.ASSISTANT_PROJECT_OFFICER,
        USER_ROLES.PROJECT_MANAGER,
        USER_ROLES.HEAD_OF_PROGRAMS,
        USER_ROLES.DIRECTOR,
        USER_ROLES.CEO,
        USER_ROLES.PATRON,
        USER_ROLES.USER
      ]
    },
    {
      name: 'Settings',
      href: ROUTES.SETTINGS,
      icon: <Icon name="Gear" size={24} weight="fill" />,
      roles: [
        USER_ROLES.ADMIN
      ]
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    userRole && item.roles.includes(userRole as any)
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-cream text-bgf-burgundy flex flex-col sidebar-animated">
      <div className="p-6 flex justify-center items-center border-b border-bgf-burgundy/20">
        <Image
          src="/logo.png"
          alt="Bridging Gaps Foundation"
          width={200}
          height={80}
          className="h-auto"
        />
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span className="font-lato">{item.name}</span>
                  {item.name === 'Notifications' && <NotificationBadge className="ml-2" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-bgf-burgundy/20">
        <Link href={ROUTES.PROFILE} className="sidebar-link w-full justify-start mb-2">
          <Icon name="User" size={24} weight="fill" />
          <span className="font-lato">My Profile</span>
        </Link>
        <button
          className="sidebar-link w-full justify-start"
          onClick={() => {
            // Logout will handle both staff and regular user auth data
            logout(); // This handles Supabase logout

            // Redirect to home page
            window.location.href = '/';
          }}
        >
          <Icon name="SignOut" size={24} weight="fill" />
          <span className="font-lato">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
