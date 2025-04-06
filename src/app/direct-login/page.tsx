"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DirectLogin() {
  const router = useRouter();
  const [message, setMessage] = useState('Attempting direct login...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const login = async () => {
      try {
        // Use a test account for direct login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123',
        });

        if (error) {
          console.error('Direct login error:', error);
          setError(error.message);
          return;
        }

        if (!data.session) {
          setError('No session created');
          return;
        }

        console.log('Direct login successful, redirecting to dashboard');
        setMessage('Login successful! Redirecting to dashboard...');
        
        // Force redirect to dashboard
        window.location.href = '/dashboard';
      } catch (err: any) {
        console.error('Unexpected error during direct login:', err);
        setError(err.message || 'An unexpected error occurred');
      }
    };

    login();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-playfair font-semibold text-center mb-6">Direct Login</h1>
        
        {error ? (
          <div className="bg-terracotta/10 text-terracotta p-4 rounded-md mb-4">
            {error}
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
