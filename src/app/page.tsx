"use client";

import React from 'react';
import Link from 'next/link';
import { FiUser, FiUsers, FiInfo } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-bgf-burgundy mb-4">
              Bridging Gaps Foundation
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Empowering communities through sustainable development initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Link
              href="/login"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mb-4">
                <FiUser className="text-bgf-burgundy" size={32} />
              </div>
              <h2 className="text-2xl font-playfair font-semibold mb-2">Regular Login</h2>
              <p className="text-text-secondary mb-4">
                For community members and beneficiaries to access services and submit requests
              </p>
              <span className="text-bgf-burgundy font-medium">Sign in with email →</span>
            </Link>

            <Link
              href="/staff-login"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mb-4">
                <FiUsers className="text-bgf-burgundy" size={32} />
              </div>
              <h2 className="text-2xl font-playfair font-semibold mb-2">Staff Access</h2>
              <p className="text-text-secondary mb-4">
                For BGF staff members to manage programs, process requests, and access administrative tools
              </p>
              <span className="text-bgf-burgundy font-medium">Sign in with access code →</span>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/login-guide"
              className="inline-flex items-center text-text-secondary hover:text-bgf-burgundy"
            >
              <FiInfo className="mr-2" />
              View available test accounts and login guide
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-text-muted">
        <p className="text-sm">
          Bridging Gaps Foundation &copy; {new Date().getFullYear()} | All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
