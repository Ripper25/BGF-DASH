"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ROUTES } from '@/app/routes';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { FiFilter, FiPlus, FiChevronLeft, FiChevronRight, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { REQUEST_STATUS, REQUEST_TYPE_LABELS } from '@/constants/request.constants';
import { useAuth } from '@/contexts/AuthContext';
import supabaseRequestService, { RequestFilters } from '@/services/supabase/request.service';
import { Request as RequestData } from '@/types/request';
import { userService } from '@/services/user.service';
import { UserProfile } from '@/services/auth.service';

export default function RequestsClient() {
  // Get the router and auth context
  const router = useRouter();
  const { user: authUser, staffUser } = useAuth();

  // Determine if the current user is a regular user (not staff)
  const isRegularUser = authUser && authUser.role === 'user';

  // Log the current user for debugging purposes
  useEffect(() => {
    if (authUser) {
      console.log('Current user:', authUser);
    }
  }, [authUser]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [officers, setOfficers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch officers for filter dropdown
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        // Fetch officers from the API
        // We're looking for users with roles that can be assigned to requests
        const officerRoles = ['assistant_project_officer', 'project_manager'];

        // Make separate calls for each role and combine the results
        const officers = [];

        for (const role of officerRoles) {
          try {
            const roleOfficers = await userService.getUsersByRole(role);
            officers.push(...roleOfficers);
          } catch (roleErr) {
            console.error(`Error fetching ${role} officers:`, roleErr);
          }
        }

        console.log('Fetched officers:', officers);
        setOfficers(officers);
      } catch (err) {
        console.error('Error fetching officers:', err);
        // Set empty officers on error
        setOfficers([]);
      }
    };

    fetchOfficers();
  }, []);

  // Handle filter toggle
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Fetch requests based on filters
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build filter parameters
      const filters: Record<string, any> = {};

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      // Add officer filter if not 'all'
      if (officerFilter !== 'all') {
        filters.officer_id = officerFilter;
      }

      // Add search query if present
      if (searchQuery) {
        filters.search = searchQuery;
      }

      // Add pagination
      filters.page = currentPage;
      filters.limit = 10; // Items per page

      console.log('Fetching requests with filters:', filters);

      // Make the direct Supabase call
      const requestsData = await supabaseRequestService.getAllRequests({
        status: filters.status,
        type: filters.type,
        user_id: user?.id, // Only get requests for the current user
        search: filters.search,
        page: filters.page,
        limit: filters.limit
      });

      // Handle empty response
      if (!requestsData || requestsData.length === 0) {
        console.log('No requests found, returning empty array');
        setRequests([]);
        return;
      }

      console.log('Received requests:', requestsData);

      // Set the requests
      setRequests(requestsData);

      // Calculate total pages if pagination info is available
      if (response.pagination) {
        setTotalPages(Math.ceil(response.pagination.total / response.pagination.limit));
      } else {
        // Estimate total pages based on the number of requests
        setTotalPages(Math.max(1, Math.ceil(requestsData.length / 10)));
      }
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');

      // Set empty requests on error
      setRequests([]);
      setTotalPages(1); // Set to 1 instead of 0 to avoid pagination issues
    } finally {
      // Always set loading to false to prevent stuck loading state
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, officerFilter, currentPage, searchQuery]);

  return (
    <DashboardLayout title="Requests">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          {isRegularUser && (
            <div className="flex space-x-2">
              <Button variant="primary" onClick={() => router.push(ROUTES.NEW_REQUEST)}>
                <FiPlus className="mr-2" />
                New Request
              </Button>
              <Button variant="secondary" onClick={() => router.push(ROUTES.BULK_REQUEST)}>
                <FiPlus className="mr-2" />
                Bulk Submit
              </Button>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-slate-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgf-burgundy/20"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-gray" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isRegularUser && (
            <Button variant="primary" onClick={() => router.push(ROUTES.BATCH_PROCESS)}>
              <FiPlus className="mr-2" />
              Batch Process
            </Button>
          )}
          <Button variant="secondary" onClick={toggleFilters}>
            <FiFilter className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-slate-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgf-burgundy/20"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assigned Officer</label>
              <select
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
                className="w-full p-2 border border-slate-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgf-burgundy/20"
              >
                <option value="all">All Officers</option>
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgf-burgundy"></div>
        </div>
      ) : error ? (
        <Card className="p-6">
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-4"
          />
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchRequests();
              }}
            >
              <FiRefreshCw className="mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="py-8">
            <div className="text-slate-gray/50 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No requests found</h3>
              <p className="text-slate-gray mb-4">
                {searchQuery || statusFilter !== 'all' || officerFilter !== 'all'
                  ? 'No requests match your current filters.'
                  : 'There are no requests in the system yet.'}
              </p>
            </div>
            {(searchQuery || statusFilter !== 'all' || officerFilter !== 'all') && (
              <Button variant="secondary" onClick={() => {
                setStatusFilter('all');
                setOfficerFilter('all');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <p className="text-slate-gray text-sm mb-2">
                      Submitted by {request.requester_name || 'Unknown'} on {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                    <p className="line-clamp-2 text-sm mb-2">{request.description}</p>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={request.status || 'submitted'} />
                      <span className="text-sm text-slate-gray">
                        ID: {request.ticket_number}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`${ROUTES.REQUESTS}/${request.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
