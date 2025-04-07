"use client";

import React, { useState, useEffect } from 'react';
import { FiMonitor, FiSmartphone, FiGlobe, FiClock, FiCheck, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { loginHistoryService, LoginSession } from '@/services/login-history.service';

export default function LoginSessionsList() {
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch login sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sessionsData = await loginHistoryService.getLoginSessions();
        setSessions(sessionsData);
      } catch (error: any) {
        console.error('Error fetching login sessions:', error);
        setError('Failed to load login sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get time ago for display
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
    
    if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
    
    if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    }
    
    return 'Just now';
  };

  // Get device icon
  const getDeviceIcon = (device: string) => {
    if (/Android|iOS|iPhone|iPad|iPod/i.test(device)) {
      return <FiSmartphone className="text-bgf-burgundy" size={20} />;
    }
    
    return <FiMonitor className="text-bgf-burgundy" size={20} />;
  };

  // Handle sign out from a session
  const handleSignOut = async (sessionId: string) => {
    try {
      setSigningOut(true);
      setError(null);
      setSuccessMessage(null);
      
      const success = await loginHistoryService.signOutSession(sessionId);
      
      if (success) {
        // Remove the session from the list
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        setSuccessMessage('Session signed out successfully');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('Failed to sign out from session');
      }
    } catch (error: any) {
      console.error('Error signing out from session:', error);
      setError(error.message || 'Failed to sign out from session');
    } finally {
      setSigningOut(false);
    }
  };

  // Handle sign out from all sessions
  const handleSignOutAll = async () => {
    try {
      setSigningOutAll(true);
      setError(null);
      setSuccessMessage(null);
      
      const success = await loginHistoryService.signOutAllDevices();
      
      if (success) {
        // Keep only the current session in the list
        setSessions(prev => prev.filter(session => session.is_current));
        setSuccessMessage('Signed out from all other devices');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError('Failed to sign out from all devices');
      }
    } catch (error: any) {
      console.error('Error signing out from all devices:', error);
      setError(error.message || 'Failed to sign out from all devices');
    } finally {
      setSigningOutAll(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading login sessions...</div>;
  }

  if (error) {
    return (
      <div className="bg-terracotta/10 p-3 rounded-md text-terracotta mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      {successMessage && (
        <div className="bg-green-50 p-3 rounded-md text-green-700 mb-4 flex items-center">
          <FiCheck className="mr-2" />
          {successMessage}
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        {sessions.length === 0 ? (
          <div className="text-center py-4 text-text-muted">No login sessions found</div>
        ) : (
          sessions.map((session) => (
            <div 
              key={session.id} 
              className={`p-4 rounded-md ${
                session.is_current ? 'bg-bgf-burgundy/5 border border-bgf-burgundy/20' : 'bg-slate-gray/5'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-4">
                  {getDeviceIcon(session.device)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        {session.device} • {session.browser}
                        {session.is_current && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-muted mt-1">
                        <div className="flex items-center">
                          <FiGlobe className="mr-1" size={14} />
                          {session.location || 'Unknown location'} • {session.ip_address}
                        </div>
                      </div>
                    </div>
                    {!session.is_current && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSignOut(session.id)}
                        disabled={signingOut}
                        className="text-terracotta border-terracotta hover:bg-terracotta/10"
                      >
                        Sign Out
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-text-muted mt-2 flex items-center">
                    <FiClock className="mr-1" size={12} />
                    Last active: {getTimeAgo(session.last_active_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {sessions.length > 1 && (
        <Button
          variant="secondary"
          onClick={handleSignOutAll}
          disabled={signingOutAll}
          className="text-terracotta border-terracotta hover:bg-terracotta/10"
        >
          {signingOutAll ? 'Signing Out...' : 'Sign Out All Other Devices'}
        </Button>
      )}
    </div>
  );
}
