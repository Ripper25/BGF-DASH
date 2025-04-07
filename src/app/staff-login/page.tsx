"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiUser, FiKey, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import staffAuthService from '../../services/staff-auth.service';

import { USER_ROLES } from '@/lib/supabase';

export default function StaffLogin() {
  const router = useRouter();
  const { isStaffAuthenticated, isUserAuthenticated, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      try {
        // If staff is already authenticated, redirect to dashboard
        if (isStaffAuthenticated()) {
          router.push('/dashboard');
        }

        // If regular user is authenticated, ask them to logout first
        if (isUserAuthenticated()) {
          setError('You are currently logged in as a regular user. Please logout first to access staff login.');
        } else {
          setError(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuth();
  }, [isStaffAuthenticated, isUserAuthenticated, router]);

  // Auto-fill the form with the CEO code for testing
  useEffect(() => {
    // Check if the URL has a query parameter for auto-filling
    const params = new URLSearchParams(window.location.search);
    const autoFillCode = params.get('code');
    if (autoFillCode) {
      setAccessCode(autoFillCode);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // If no access code is provided, show an error
    if (!accessCode) {
      setError('Please enter your staff access code');
      setLoading(false);
      return;
    }

    try {
      // Clear any existing auth data to prevent conflicts
      localStorage.removeItem('bgf.user');

      // Also clear any existing regular user session cookies
      document.cookie = 'sb-roqzswykxwyzyoeazqiu-auth-token=; path=/; max-age=0';
      document.cookie = 'supabase-auth-token=; path=/; max-age=0';
      document.cookie = 'sb-auth-token=; path=/; max-age=0';

      // Call the staff auth service to login
      await staffAuthService.login({
        fullName: fullName || 'Staff User', // Use a default name if none provided
        accessCode
      });

      console.log('Staff login successful');

      // Show success message before redirecting
      setError(null);
      setLoading(true);

      // Use window.location for a full page navigation to avoid any routing issues
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500); // Short delay to show loading state
    } catch (error: any) {
      console.error('Staff login error:', error);
      setError(error.message || 'Invalid access code. Please check the login guide for valid codes.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-bgf-burgundy hover:underline">
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <Image
                src="/logo.png"
                alt="Bridging Gaps Foundation"
                width={250}
                height={100}
                className="mx-auto mb-6"
              />
              <h1 className="text-3xl font-playfair font-semibold mb-2">Staff Access</h1>
              <p className="text-text-secondary">Enter your email and access code to continue</p>
            </div>

            {error && (
              <div className="bg-terracotta/10 text-terracotta p-4 rounded-md mb-6">
                {error}
                {isUserAuthenticated() && (
                  <div className="mt-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                      className="text-bgf-burgundy hover:underline font-medium"
                    >
                      Logout now
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-text-secondary font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-text-muted" />
                  </div>
                  <input
                    id="full_name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="access_code" className="block text-text-secondary font-medium mb-2">
                  Access Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-text-muted" />
                  </div>
                  <input
                    id="access_code"
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Enter your access code"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bgf-burgundy text-white py-3 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center mt-4">
                <p className="text-text-secondary">
                  Not a staff member?{' '}
                  <Link href="/login" className="text-bgf-burgundy hover:underline">
                    Regular Login
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-text-muted text-sm">
              Bridging Gaps Foundation &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
