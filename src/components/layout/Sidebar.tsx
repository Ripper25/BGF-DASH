"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiCheckSquare,
  FiSettings,
  FiBarChart2,
  FiLogOut,
  FiUser,
  FiBell
} from 'react-icons/fi';
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
      icon: <FiHome size={24} />,
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
      icon: <FiFileText size={24} />,
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
      name: 'Approvals',
      href: ROUTES.APPROVALS,
      icon: <FiCheckSquare size={24} />,
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
      name: 'Users',
      href: ROUTES.USERS,
      icon: <FiUsers size={24} />,
      roles: [
        USER_ROLES.ADMIN,
        USER_ROLES.HEAD_OF_PROGRAMS
      ]
    },
    {
      name: 'Reports',
      href: ROUTES.REPORTS,
      icon: <FiBarChart2 size={24} />,
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
      icon: <FiBell size={24} />,
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
      icon: <FiSettings size={24} />,
      roles: [
        USER_ROLES.ADMIN
      ]
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    userRole && item.roles.includes(userRole as any)
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-bgf-burgundy text-cream flex flex-col">
      <div className="p-6 flex justify-center items-center border-b border-deep-burgundy">
        <Image
          src="/assets/logo.svg"
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

      <div className="p-6 border-t border-deep-burgundy">
        <Link href={ROUTES.PROFILE} className="sidebar-link w-full justify-start mb-2">
          <FiUser size={24} />
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
          <FiLogOut size={24} />
          <span className="font-lato">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
