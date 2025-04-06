"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMail, FiAlertCircle, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { ROUTES } from '@/app/routes';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      });
      
      if (resetError) {
        throw new Error(resetError.message);
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
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
            src="/assets/logo.svg" 
            alt="Bridging Gaps Foundation" 
            width={250} 
            height={100} 
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-playfair font-bold text-bgf-burgundy">Forgot Password</h1>
          <p className="text-text-secondary mt-2">Enter your email to reset your password</p>
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
              <h2 className="text-xl font-playfair font-semibold mb-2">Check Your Email</h2>
              <p className="text-text-secondary mb-6">
                We've sent a password reset link to <span className="font-medium">{email}</span>. 
                Please check your email and follow the instructions to reset your password.
              </p>
              <Link href={ROUTES.LOGIN} className="text-bgf-burgundy hover:underline flex items-center justify-center">
                <FiArrowLeft className="mr-2" />
                Back to Login
              </Link>
            </div>
          ) : (
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-bgf-burgundy text-white py-3 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium mb-4"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </button>
              
              <div className="text-center">
                <Link href={ROUTES.LOGIN} className="text-bgf-burgundy hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
