"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugLogin() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setSessionInfo(null);

    try {
      console.log('Attempting login with:', { email, password });
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return;
      }

      console.log('Login successful:', data);
      setSuccess('Login successful! Session created.');
      setSessionInfo(data);

      // Check cookies
      const cookies = document.cookie;
      setCookieInfo(cookies);
      console.log('Cookies:', cookies);

      // Manually set the session in localStorage as a backup
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        }));
        console.log('Session manually stored in localStorage');
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        setError(error.message);
        return;
      }
      
      console.log('Current session:', data);
      setSessionInfo(data);
      
      // Check cookies again
      const cookies = document.cookie;
      setCookieInfo(cookies);
      console.log('Cookies:', cookies);
    } catch (err: any) {
      console.error('Session check error:', err);
      setError(err.message || 'Failed to check session');
    }
  };

  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-playfair font-semibold text-center mb-8">Debug Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-6 mb-8">
            <div>
              <label className="block text-text-secondary font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-gray/30 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-text-secondary font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-gray/30 rounded-md"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-bgf-burgundy text-white py-3 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          {error && (
            <div className="bg-terracotta/10 text-terracotta p-4 rounded-md mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-forest-green/10 text-forest-green p-4 rounded-md mb-6">
              {success}
            </div>
          )}
          
          <div className="flex space-x-4 mb-8">
            <button
              onClick={checkSession}
              className="bg-navy-blue text-white py-2 px-4 rounded-md hover:bg-navy-blue/80 transition-colors duration-200"
            >
              Check Current Session
            </button>
            
            <button
              onClick={goToDashboard}
              className="bg-forest-green text-white py-2 px-4 rounded-md hover:bg-forest-green/80 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
          
          {sessionInfo && (
            <div className="mb-6">
              <h2 className="text-xl font-playfair font-semibold mb-4">Session Information</h2>
              <pre className="bg-slate-gray/10 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(sessionInfo, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-playfair font-semibold mb-4">Cookie Information</h2>
            {cookieInfo ? (
              <pre className="bg-slate-gray/10 p-4 rounded-md overflow-x-auto text-sm">
                {cookieInfo}
              </pre>
            ) : (
              <p className="text-text-muted">No cookies found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
