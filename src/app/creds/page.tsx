"use client";

import React, { useState } from 'react';
import { Icon } from '@/components/ui';

const CredentialsPage = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const regularUserCreds = {
    email: 'user@example.com',
    password: 'password123'
  };

  const staffUserCreds = {
    email: 'staff@example.com',
    password: 'staffpass123',
    accessCode: 'BGF-STAFF-2023'
  };

  const adminUserCreds = {
    email: 'admin@example.com',
    password: 'adminpass123',
    accessCode: 'BGF-ADMIN-2023'
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CredentialCard = ({ title, credentials, type }: { title: string; credentials: any; type: string }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="space-y-3">
          {Object.entries(credentials).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{key}: </span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{value as string}</span>
              </div>
              <button
                onClick={() => copyToClipboard(value as string, `${type}-${key}`)}
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                {copied === `${type}-${key}` ? (
                  <>
                    <Icon name="Check" className="mr-1" size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="mr-1" size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">BGF Dashboard Login Credentials</h1>
      
      <p className="mb-6">
        Use these credentials to log in to the BGF Dashboard. Click the &quot;Copy&quot; button to copy a value to your clipboard.
      </p>

      <CredentialCard 
        title="Regular User" 
        credentials={regularUserCreds} 
        type="regular" 
      />
      
      <CredentialCard 
        title="Staff User" 
        credentials={staffUserCreds} 
        type="staff" 
      />
      
      <CredentialCard 
        title="Admin User" 
        credentials={adminUserCreds} 
        type="admin" 
      />

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <Icon name="Info" className="mr-2" size={20} />
          Important Notes
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Regular users can only access basic features.</li>
          <li>Staff users have access to additional administrative features.</li>
          <li>Admin users have full access to all features.</li>
          <li>When logging in as staff or admin, use the staff login option and provide the access code.</li>
        </ul>
      </div>
    </div>
  );
};

export default CredentialsPage;
