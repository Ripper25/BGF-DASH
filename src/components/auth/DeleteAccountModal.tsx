"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/app/routes';

interface DeleteAccountModalProps {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Validate inputs
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Delete the account
      await authService.deleteAccount(password);

      // Log out the user
      await logout();

      // Redirect to the login page
      router.push(ROUTES.LOGIN);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setError(error.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-playfair font-semibold text-terracotta">Delete Account</h2>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-terracotta/10 p-4 rounded-md flex items-start mb-6">
            <FiAlertTriangle className="text-terracotta mt-1 mr-3 flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-terracotta">Warning: This action cannot be undone</p>
              <p className="text-terracotta/80 text-sm mt-1">
                Deleting your account will permanently remove all your data, including your profile information, request history, and any other data associated with your account.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-terracotta/10 p-3 rounded-md text-terracotta mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="Your current password"
              />
            </div>

            <div>
              <label className="block text-text-secondary font-medium mb-2">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                placeholder="DELETE"
              />
              <p className="text-xs text-text-muted mt-1">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-slate-gray/10">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={loading || confirmText !== 'DELETE' || !password}
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
