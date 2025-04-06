"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FiMenu } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar with overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-72 flex flex-col">
        {/* Mobile header with menu button */}
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center">
          <button
            onClick={toggleSidebar}
            className="text-text-primary mr-4"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-playfair font-semibold">{title}</h1>
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <Header title={title} />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 px-6 border-t border-slate-gray/10 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} Bridging Gaps Foundation. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
