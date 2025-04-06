"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiBriefcase } from 'react-icons/fi';
import { ROUTES } from '@/app/routes';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffNumber, setStaffNumber] = useState('');
  const [formError, setFormError] = useState('');
  const { login, loading, error, isStaffAuthenticated, isUserAuthenticated, logout } = useAuth();
  const [showStaffField, setShowStaffField] = useState(false);

  // Check if staff is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      try {
        if (isStaffAuthenticated()) {
          setFormError('You are currently logged in as a staff member. Please use the staff dashboard or logout first.');
        } else {
          setFormError('');
        }
      } catch (error) {
        console.error('Error checking staff authentication:', error);
      }
    };

    checkAuth();
  }, [isStaffAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    if (showStaffField && !staffNumber) {
      setFormError('Please enter your staff number');
      return;
    }

    try {
      await login(email, password, staffNumber);

      // Force navigation to dashboard after login
      console.log('Login successful, redirecting to dashboard');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error in page component:', error);
      // Error is handled by the auth context
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Show staff number field for organizational email domains
    // This is just an example - adjust based on your organization's email domain
    if (value.includes('@bridginggaps.org') || value.includes('@bgf.org')) {
      setShowStaffField(true);
    } else {
      setShowStaffField(false);
      setStaffNumber('');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/assets/logo.svg"
            alt="Bridging Gaps Foundation"
            width={250}
            height={100}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-playfair font-bold text-bgf-burgundy">Welcome Back</h1>
          <p className="text-text-secondary mt-2">Sign in to access your dashboard</p>
        </div>

        <div className="bg-white rounded-md shadow-card p-8">
          {(error || formError) && (
            <div className="mb-6 p-4 bg-terracotta/10 border border-terracotta/30 rounded-md flex items-start">
              <FiAlertCircle className="text-terracotta mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-terracotta text-sm">
                <p>{error || formError}</p>
                {isStaffAuthenticated() && (
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
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-text-secondary font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-text-muted" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-text-secondary font-medium">
                  Password
                </label>
                <Link href={ROUTES.FORGOT_PASSWORD} className="text-sm text-bgf-burgundy hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-text-muted" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {showStaffField && (
              <div className="mb-6">
                <label htmlFor="staff_number" className="block text-text-secondary font-medium mb-2">
                  Staff Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiBriefcase className="text-text-muted" />
                  </div>
                  <input
                    id="staff_number"
                    type="text"
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Enter your staff number"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-bgf-burgundy text-white py-3 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-4">
              <p className="text-text-secondary">
                <Link href="/" className="text-bgf-burgundy hover:underline">
                  Back to Home
                </Link>
              </p>
            </div>

            <div className="text-center mt-4">
              <Link href="/login-guide" className="text-bgf-burgundy hover:underline text-sm">
                View available test users and login guide
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
