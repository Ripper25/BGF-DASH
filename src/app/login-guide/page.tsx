"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiUsers, FiClipboard, FiKey } from 'react-icons/fi';
import { getAllStaffAccessCodes } from '@/lib/staff-access';
import { USER_ROLES } from '@/lib/supabase';

export default function LoginGuide() {
  // State to store staff access codes
  const [staffAccessCodes, setStaffAccessCodes] = useState<Array<{ code: string; details: { name: string; role: string } }>>([]);

  // Fetch staff access codes on component mount
  useEffect(() => {
    const fetchStaffAccessCodes = async () => {
      try {
        const codes = await getAllStaffAccessCodes();
        setStaffAccessCodes(codes);
      } catch (error) {
        console.error('Error fetching staff access codes:', error);
      }
    };

    fetchStaffAccessCodes();
  }, []);

  // Demo user accounts for testing
  // Note: In a production environment, these would be managed through a user management system
  const testUsers = [
    {
      email: 'user@example.com',
      password: 'password123',
      fullName: 'Regular User',
      role: 'user',
      staffNumber: '',
      description: 'Regular user who can submit requests and view their status'
    },
    {
      email: 'officer@example.com',
      password: 'password123',
      fullName: 'Field Officer',
      role: 'assistant_project_officer',
      staffNumber: 'APO001', // References staff access code in database
      description: 'Field officer who reviews and processes requests'
    },
    {
      email: 'manager@example.com',
      password: 'password123',
      fullName: 'Program Manager',
      role: 'head_of_programs',
      staffNumber: 'HOP001', // References staff access code in database
      description: 'Program manager who oversees all requests and officers'
    },
    {
      email: 'executive@example.com',
      password: 'password123',
      fullName: 'Executive Director',
      role: 'director',
      staffNumber: 'DIR001', // References staff access code in database
      description: 'Executive who approves high-level requests'
    },
    {
      email: 'admin@example.com',
      password: 'password123',
      fullName: 'System Admin',
      role: 'admin',
      staffNumber: 'ADM001', // References staff access code in database
      description: 'Administrator with full system access'
    }
  ];

  // Note: These test users are for demonstration purposes only.
  // In a production environment, regular users would be managed through Supabase Auth,
  // and staff access codes would be managed through the staff_access_codes table in the database.

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copied to clipboard: ${text}`);
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-bgf-burgundy hover:underline">
            <FiArrowLeft className="mr-2" />
            Back to Login
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-playfair font-semibold text-center mb-8">BGF Dashboard Login Guide</h1>

          <div className="mb-8">
            <h2 className="text-xl font-playfair font-semibold mb-4">Staff Access Codes</h2>
            <p className="text-text-secondary mb-4">
              The following staff access codes can be used with the Staff Login page.
              Click on any code to copy it to your clipboard.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {staffAccessCodes.map(({ code, details }) => (
                <div key={code} className="border border-slate-gray/20 rounded-lg p-4 hover:bg-cream/50 transition-colors cursor-pointer"
                     onClick={() => copyToClipboard(code)}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mr-3">
                      <FiKey className="text-bgf-burgundy" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{code}</p>
                      <p className="text-text-muted text-sm">{details.name}</p>
                    </div>
                  </div>
                </div>
              ))}

              {staffAccessCodes.length === 0 && (
                <div className="col-span-2 text-center py-4">
                  <p className="text-text-muted">Loading staff access codes...</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-playfair font-semibold mb-4">Test Users</h2>
            <p className="text-text-secondary mb-4">
              The following test users have been created for you to explore different roles in the system.
              Click on any user's credentials to copy them to your clipboard.
            </p>

            <div className="grid gap-6 mt-6">
              {testUsers.map((user, index) => (
                <div key={index} className="border border-slate-gray/20 rounded-lg p-6 hover:bg-cream/50 transition-colors">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mr-4 mt-1">
                      <FiUser className="text-bgf-burgundy" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-playfair font-semibold">{user.fullName}</h3>
                      <p className="text-text-secondary mb-3">{user.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className="flex items-center bg-slate-gray/5 p-3 rounded-md cursor-pointer hover:bg-slate-gray/10"
                          onClick={() => copyToClipboard(user.email)}
                        >
                          <span className="text-text-muted mr-2">Email:</span>
                          <span className="font-medium">{user.email}</span>
                        </div>

                        <div
                          className="flex items-center bg-slate-gray/5 p-3 rounded-md cursor-pointer hover:bg-slate-gray/10"
                          onClick={() => copyToClipboard(user.password)}
                        >
                          <span className="text-text-muted mr-2">Password:</span>
                          <span className="font-medium">{user.password}</span>
                        </div>

                        {user.staffNumber && (
                          <div
                            className="flex items-center bg-slate-gray/5 p-3 rounded-md cursor-pointer hover:bg-slate-gray/10"
                            onClick={() => copyToClipboard(user.staffNumber)}
                          >
                            <span className="text-text-muted mr-2">Staff Number:</span>
                            <span className="font-medium">{user.staffNumber}</span>
                          </div>
                        )}

                        <div className="flex items-center bg-slate-gray/5 p-3 rounded-md">
                          <span className="text-text-muted mr-2">Role:</span>
                          <span className="font-medium capitalize">{user.role.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-gray/20 pt-6">
            <h2 className="text-xl font-playfair font-semibold mb-4">Login Instructions</h2>

            <div className="mb-6">
              <h3 className="text-lg font-playfair font-semibold mb-2">Staff Login (Secure Backend Authentication)</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>Choose a staff access code from the list above based on the role you want to explore</li>
                <li>Click on the code to copy it to your clipboard</li>
                <li>Go to the <Link href="/staff-login" className="text-bgf-burgundy hover:underline">staff login page</Link></li>
                <li>Enter your name and paste the access code</li>
                <li>Click "Sign In" to access the dashboard with the selected role</li>
                <li>Your authentication is handled securely by the backend with a JWT token</li>
              </ol>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-playfair font-semibold mb-2">Regular User Login</h3>
              <ol className="list-decimal pl-6 space-y-3">
                <li>Choose a user from the list above based on the role you want to explore</li>
                <li>Click on the email and password to copy them to your clipboard</li>
                <li>Go to the <Link href="/login" className="text-bgf-burgundy hover:underline">login page</Link></li>
                <li>Paste the email and password into the login form</li>
                <li>Click "Sign In" to access the dashboard with the selected role</li>
              </ol>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-bgf-burgundy text-white rounded-md hover:bg-deep-burgundy transition-colors duration-200">
                <FiArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
