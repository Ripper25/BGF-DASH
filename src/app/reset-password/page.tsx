"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/app/routes';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasResetToken, setHasResetToken] = useState(false);

  useEffect(() => {
    // Check if we have a reset token in the URL
    const checkResetToken = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setHasResetToken(true);
      } else {
        // No valid session, check URL parameters
        const hash = window.location.hash;
        const query = new URLSearchParams(hash.substring(1));
        const accessToken = query.get('access_token');

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: '',
          });

          if (!error) {
            setHasResetToken(true);
          } else {
            setError('Invalid or expired reset link. Please request a new one.');
          }
        } else {
          setError('No reset token found. Please request a new password reset link.');
        }
      }
    };

    checkResetToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="Bridging Gaps Foundation"
            width={250}
            height={100}
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-playfair font-bold text-bgf-burgundy">Reset Password</h1>
          <p className="text-text-secondary mt-2">Create a new password for your account</p>
        </div>

        <div className="bg-white rounded-md shadow-card p-8">
          {error && (
            <div className="mb-6 p-4 bg-terracotta/10 border border-terracotta/30 rounded-md flex items-start">
              <FiAlertCircle className="text-terracotta mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-terracotta text-sm">{error}</p>
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-forest-green" size={32} />
              </div>
              <h2 className="text-xl font-playfair font-semibold mb-2">Password Reset Successful</h2>
              <p className="text-text-secondary mb-6">
                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
              </p>
            </div>
          ) : hasResetToken ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="password" className="block text-text-secondary font-medium mb-2">
                  New Password
                </label>
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
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                </div>
                <p className="text-text-muted text-sm mt-1">Password must be at least 8 characters</p>
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-text-secondary font-medium mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-text-muted" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bgf-burgundy text-white py-3 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <p className="text-text-secondary">
                Checking reset token...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
