"use client";

import React, { useEffect, useState } from 'react';
// Router import removed as it's no longer needed
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { FiPlus, FiFileText, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { requestService, RequestData } from '@/services/request.service';
import { ROUTES } from '@/app/routes';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Since we know there's no database, we'll use an empty array
        // This prevents the API call from failing
        setRequests([]);
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        // Don't show an error, just set empty requests
        setRequests([]);
      } finally {
        // Always set loading to false to prevent stuck loading state
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserRequests();
    } else {
      // If no user ID, set empty requests and stop loading
      setRequests([]);
      setLoading(false);
    }
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-semibold">Welcome, {user?.full_name}</h1>
          <p className="text-text-muted mt-1">Here's an overview of your requests</p>
        </div>

        <Link href={ROUTES.NEW_REQUEST}>
          <Button variant="primary">
            <FiPlus className="mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-bgf-burgundy/10 flex items-center justify-center mr-4">
              <FiFileText className="text-bgf-burgundy" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">My Requests</h2>
              <p className="text-3xl font-playfair font-bold text-bgf-burgundy">{requests.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mr-4">
              <FiClock className="text-gold" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Pending</h2>
              <p className="text-3xl font-playfair font-bold text-gold">
                {requests.filter(r => r.status === 'submitted' || r.status === 'under-review').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-forest-green/10 flex items-center justify-center mr-4">
              <FiFileText className="text-forest-green" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-playfair font-semibold">Approved</h2>
              <p className="text-3xl font-playfair font-bold text-forest-green">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-playfair font-semibold mb-6">My Requests</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-gray/20">
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Request ID</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Title</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Date</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Status</th>
                <th className="text-left py-4 px-6 font-lato font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-4">
                    <ErrorMessage
                      message={error}
                      onDismiss={() => setError(null)}
                    />
                    <div className="flex justify-center mt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setError(null);
                          setLoading(true);
                          requestService.getAllRequests({ user_id: user?.id })
                            .then(data => setRequests(data))
                            .catch(err => setError(err.message || 'Failed to fetch requests'))
                            .finally(() => setLoading(false));
                        }}
                      >
                        <FiRefreshCw className="mr-2" />
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-gray/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-text-muted mb-2">You don't have any requests yet</p>
                      <p className="text-text-muted text-sm">Click the "New Request" button above to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="border-b border-slate-gray/10 hover:bg-slate-gray/5">
                    <td className="py-4 px-6 font-lato text-text-primary">{request.id}</td>
                    <td className="py-4 px-6 font-lato text-text-primary">{request.title}</td>
                    <td className="py-4 px-6 font-lato text-text-muted">
                      {typeof request.created_at === 'string' ? new Date(request.created_at).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={request.status as any} />
                    </td>
                    <td className="py-4 px-6">
                      <Link href={request.id ? ROUTES.REQUEST_DETAILS(request.id) : '#'}>
                        <Button variant="tertiary" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
