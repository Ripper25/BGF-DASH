"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DirectDashboard() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Direct dashboard: Checking session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Direct dashboard: Session error', error);
          router.push('/login');
          return;
        }
        
        if (!data.session) {
          console.log('Direct dashboard: No session found, redirecting to login');
          router.push('/login');
          return;
        }
        
        console.log('Direct dashboard: Session found, staying on dashboard');
        // Stay on dashboard
      } catch (error) {
        console.error('Direct dashboard: Error checking session', error);
        router.push('/login');
      }
    };
    
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading dashboard...</p>
      </div>
    </div>
  );
}
