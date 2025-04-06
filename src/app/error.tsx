"use client";

import React from 'react';
import Link from 'next/link';
import { ROUTES } from './routes';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-playfair font-bold text-terracotta">Error</h1>
        <h2 className="text-2xl font-playfair font-semibold text-text-primary mt-4 mb-6">Something went wrong</h2>
        <p className="text-text-secondary max-w-md mx-auto mb-8">
          {error.message || 'An unexpected error occurred. Please try again later.'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block bg-bgf-burgundy text-white py-3 px-6 rounded-md hover:bg-deep-burgundy transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
          <Link 
            href={ROUTES.DASHBOARD}
            className="inline-block bg-white border border-slate-gray/30 text-text-primary py-3 px-6 rounded-md hover:bg-slate-gray/5 transition-colors duration-200 font-medium"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
