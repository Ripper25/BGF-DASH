"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FiShield, FiCheck, FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { twoFactorService } from '@/services/two-factor.service';

interface TwoFactorSetupProps {
  onComplete?: (success: boolean) => void;
}

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'success'>('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Start the setup process
  const handleStartSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the 2FA setup data
      const setupData = await twoFactorService.setup();
      
      // Set the secret and QR code URL
      setSecret(setupData.secret);
      setQrCodeUrl(setupData.qrCodeUrl);
      
      // Move to the setup step
      setStep('setup');
    } catch (error: any) {
      console.error('Error starting 2FA setup:', error);
      setError(error.message || 'Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  // Verify the 2FA code
  const handleVerify = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!secret) {
      setError('Setup data is missing, please try again');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Verify the code
      const result = await twoFactorService.verify(verificationCode, secret);
      
      if (result.success) {
        // Move to the success step
        setStep('success');
        
        // Call the onComplete callback if provided
        if (onComplete) {
          onComplete(true);
        }
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('Error verifying 2FA code:', error);
      setError(error.message || 'Failed to verify 2FA code');
    } finally {
      setLoading(false);
    }
  };

  // Cancel the setup process
  const handleCancel = () => {
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete(false);
    }
  };

  // Render the intro step
  const renderIntro = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="bg-bgf-burgundy/10 text-bgf-burgundy rounded-full p-3 mr-4">
          <FiShield size={24} />
        </div>
        <h2 className="text-xl font-playfair font-semibold">Two-Factor Authentication</h2>
      </div>
      
      <p className="text-text-secondary">
        Two-factor authentication adds an extra layer of security to your account. Once enabled, you'll need to enter a verification code from your authenticator app in addition to your password when signing in.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md flex items-start">
        <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-700">Before you begin</p>
          <p className="text-blue-600 text-sm mt-1">
            You'll need an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy installed on your mobile device.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStartSetup}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Set Up Two-Factor Authentication'}
        </Button>
      </div>
    </div>
  );

  // Render the setup step
  const renderSetup = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="bg-bgf-burgundy/10 text-bgf-burgundy rounded-full p-3 mr-4">
          <FiShield size={24} />
        </div>
        <h2 className="text-xl font-playfair font-semibold">Scan QR Code</h2>
      </div>
      
      <p className="text-text-secondary">
        Scan this QR code with your authenticator app, or enter the setup key manually.
      </p>
      
      <div className="flex flex-col items-center justify-center p-6 bg-slate-gray/5 rounded-md">
        {qrCodeUrl && (
          <div className="mb-4 p-4 bg-white rounded-md">
            <Image
              src={qrCodeUrl}
              alt="QR Code for 2FA setup"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
        )}
        
        {secret && (
          <div className="text-center">
            <p className="text-sm text-text-muted mb-2">Manual entry key:</p>
            <p className="font-mono bg-white px-4 py-2 rounded-md border border-slate-gray/20 text-text-secondary">
              {secret}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md flex items-start">
        <FiAlertTriangle className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium text-yellow-700">Important</p>
          <p className="text-yellow-600 text-sm mt-1">
            Keep your backup codes in a safe place. If you lose access to your authenticator app, you'll need these codes to sign in.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="secondary"
          onClick={() => setStep('intro')}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => setStep('verify')}
          disabled={loading}
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Render the verify step
  const renderVerify = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="bg-bgf-burgundy/10 text-bgf-burgundy rounded-full p-3 mr-4">
          <FiShield size={24} />
        </div>
        <h2 className="text-xl font-playfair font-semibold">Verify Code</h2>
      </div>
      
      <p className="text-text-secondary">
        Enter the 6-digit verification code from your authenticator app to verify and enable two-factor authentication.
      </p>
      
      {error && (
        <div className="bg-terracotta/10 p-4 rounded-md flex items-start">
          <FiX className="text-terracotta mt-1 mr-3 flex-shrink-0" />
          <p className="text-terracotta">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-text-secondary font-medium mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit code"
          className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold text-center font-mono text-lg tracking-widest"
          maxLength={6}
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="secondary"
          onClick={() => setStep('setup')}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
        >
          {loading ? 'Verifying...' : 'Verify and Enable'}
        </Button>
      </div>
    </div>
  );

  // Render the success step
  const renderSuccess = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="bg-green-100 text-green-700 rounded-full p-3 mr-4">
          <FiCheck size={24} />
        </div>
        <h2 className="text-xl font-playfair font-semibold">Two-Factor Authentication Enabled</h2>
      </div>
      
      <p className="text-text-secondary">
        You have successfully enabled two-factor authentication for your account. From now on, you'll need to enter a verification code from your authenticator app when signing in.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md flex items-start">
        <FiInfo className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium text-blue-700">Recovery Options</p>
          <p className="text-blue-600 text-sm mt-1">
            If you lose access to your authenticator app, you can use your backup codes to sign in. Make sure you've saved them in a secure location.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          onClick={handleCancel}
        >
          Done
        </Button>
      </div>
    </div>
  );

  // Render the appropriate step
  const renderStep = () => {
    switch (step) {
      case 'intro':
        return renderIntro();
      case 'setup':
        return renderSetup();
      case 'verify':
        return renderVerify();
      case 'success':
        return renderSuccess();
      default:
        return renderIntro();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {renderStep()}
    </div>
  );
}
