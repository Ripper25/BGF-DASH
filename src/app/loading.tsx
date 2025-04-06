import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}
