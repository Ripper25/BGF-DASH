import React from 'react';
import Link from 'next/link';
import { ROUTES } from './routes';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-playfair font-bold text-bgf-burgundy">404</h1>
        <h2 className="text-2xl font-playfair font-semibold text-text-primary mt-4 mb-6">Page Not Found</h2>
        <p className="text-text-secondary max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href={ROUTES.DASHBOARD}
          className="inline-block bg-bgf-burgundy text-white py-3 px-6 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
