"use client";

import React from 'react';
import { FiUser, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import Avatar from '@/components/ui/Avatar';

interface HeaderProps {
  title: string;
  userName?: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, staffUser, isStaffAuthenticated } = useAuth();
  // Use staff user name if authenticated as staff, otherwise use regular user name
  const userName = isStaffAuthenticated() && staffUser ? staffUser.name : user?.full_name || 'User';
  return (
    <header className="bg-cream shadow-sm h-20 flex items-center justify-between px-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-rich-black">{title}</h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-md border border-slate-gray/30 focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
        </div>

        <NotificationDropdown />

        <div className="flex items-center space-x-3">
          <Avatar
            url={user?.avatar_url}
            size="sm"
            alt={userName}
            className="w-10 h-10"
          />
          <span className="font-lato font-medium">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
