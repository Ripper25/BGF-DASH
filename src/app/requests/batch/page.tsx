"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import StatusBadge from '@/components/ui/StatusBadge';
import { FiCheck, FiX, FiFilter, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { requestService, RequestData } from '@/services/request.service';
import { workflowService } from '@/services/workflow.service';
import { ROUTES } from '@/app/routes';
import { useAuth } from '@/contexts/AuthContext';

export default function BatchProcessing() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [selectedRequests, setSelectedRequests] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('under_review');
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [processingResults, setProcessingResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Fetch requests that can be batch processed
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch requests based on the user's role and the status filter
        const filters: Record<string, any> = {
          status: statusFilter,
        };
        
        // If the user is an officer, only fetch requests assigned to them
        if (user?.role === 'assistant_project_officer') {
          filters.assigned_to = user.id;
        }
        
        const response = await requestService.getAllRequests(filters);
        
        // If the response is an object with a requests property, use that
        // Otherwise, assume the response is the array of requests
        const requestsData = Array.isArray(response) ? response :
                            response.requests ? response.requests : [];
        
        setRequests(requestsData);
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        setError('Failed to load requests. Please try again.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, [user, statusFilter]);

  // Handle selecting/deselecting all requests
  const handleSelectAll = () => {
    const newSelected: Record<string, boolean> = {};
    
    if (Object.keys(selectedRequests).length < requests.length) {
      // Select all
      requests.forEach(request => {
        newSelected[request.id] = true;
      });
    }
    
    setSelectedRequests(newSelected);
  };

  // Handle selecting/deselecting a single request
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => ({
      ...prev,
      [requestId]: !prev[requestId]
    }));
  };

  // Get the count of selected requests
  const selectedCount = Object.values(selectedRequests).filter(Boolean).length;

  // Handle batch approval
  const handleBatchApprove = async () => {
    if (selectedCount === 0) {
      setError('Please select at least one request to approve');
      return;
    }
    
    try {
      setProcessingStatus('processing');
      setError(null);
      
      const results: Record<string, { success: boolean; message: string }> = {};
      
      // Process each selected request
      for (const requestId of Object.keys(selectedRequests)) {
        if (selectedRequests[requestId]) {
          try {
            // Approve the request
            await workflowService.approveRequest(requestId, 'Approved in batch processing');
            
            results[requestId] = {
              success: true,
              message: 'Successfully approved'
            };
          } catch (err: any) {
            console.error(`Error approving request ${requestId}:`, err);
            
            results[requestId] = {
              success: false,
              message: err.message || 'Failed to approve'
            };
          }
        }
      }
      
      setProcessingResults(results);
      
      // Check if all were successful
      const allSuccess = Object.values(results).every(result => result.success);
      setProcessingStatus(allSuccess ? 'success' : 'error');
      
      // Refresh the requests list
      const successfulIds = Object.keys(results).filter(id => results[id].success);
      if (successfulIds.length > 0) {
        setRequests(prev => prev.filter(request => !successfulIds.includes(request.id)));
        
        // Clear the selection for successful requests
        const newSelected = { ...selectedRequests };
        successfulIds.forEach(id => {
          delete newSelected[id];
        });
        setSelectedRequests(newSelected);
      }
    } catch (err: any) {
      console.error('Error in batch approval:', err);
      setError('An unexpected error occurred during batch processing');
      setProcessingStatus('error');
    }
  };

  // Handle batch rejection
  const handleBatchReject = async () => {
    if (selectedCount === 0) {
      setError('Please select at least one request to reject');
      return;
    }
    
    try {
      setProcessingStatus('processing');
      setError(null);
      
      const results: Record<string, { success: boolean; message: string }> = {};
      
      // Process each selected request
      for (const requestId of Object.keys(selectedRequests)) {
        if (selectedRequests[requestId]) {
          try {
            // Reject the request
            await workflowService.rejectRequest(requestId, 'Rejected in batch processing');
            
            results[requestId] = {
              success: true,
              message: 'Successfully rejected'
            };
          } catch (err: any) {
            console.error(`Error rejecting request ${requestId}:`, err);
            
            results[requestId] = {
              success: false,
              message: err.message || 'Failed to reject'
            };
          }
        }
      }
      
      setProcessingResults(results);
      
      // Check if all were successful
      const allSuccess = Object.values(results).every(result => result.success);
      setProcessingStatus(allSuccess ? 'success' : 'error');
      
      // Refresh the requests list
      const successfulIds = Object.keys(results).filter(id => results[id].success);
      if (successfulIds.length > 0) {
        setRequests(prev => prev.filter(request => !successfulIds.includes(request.id)));
        
        // Clear the selection for successful requests
        const newSelected = { ...selectedRequests };
        successfulIds.forEach(id => {
          delete newSelected[id];
        });
        setSelectedRequests(newSelected);
      }
    } catch (err: any) {
      console.error('Error in batch rejection:', err);
      setError('An unexpected error occurred during batch processing');
      setProcessingStatus('error');
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-playfair font-semibold">Batch Process Requests</h1>
          <Button
            variant="secondary"
            onClick={() => router.push(ROUTES.REQUESTS)}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" />
            Back to Requests
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-playfair font-semibold">Requests ({requests.length})</h2>
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="text-sm font-medium mr-2">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-2 border border-slate-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgf-burgundy/20"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  No requests found matching the current filters
                </div>
              ) : (
                <>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-gray/10">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedCount > 0 && selectedCount === requests.length}
                                onChange={handleSelectAll}
                                className="mr-2 h-4 w-4"
                              />
                              <span>Select All</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left">Request</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => (
                          <tr key={request.id} className="border-t border-slate-gray/10">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={!!selectedRequests[request.id]}
                                onChange={() => handleSelectRequest(request.id)}
                                className="h-4 w-4"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium">{request.title}</div>
                              <div className="text-sm text-text-muted">ID: {request.id}</div>
                            </td>
                            <td className="px-4 py-3">{request.request_type}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={request.status} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{selectedCount}</span> of {requests.length} requests selected
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="secondary"
                        onClick={handleBatchReject}
                        disabled={selectedCount === 0 || processingStatus === 'processing'}
                        className="flex items-center"
                      >
                        <FiX className="mr-2 text-terracotta" />
                        Reject Selected
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleBatchApprove}
                        disabled={selectedCount === 0 || processingStatus === 'processing'}
                        className="flex items-center"
                      >
                        <FiCheck className="mr-2" />
                        Approve Selected
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {processingStatus === 'success' && (
                <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-md flex items-start">
                  <FiCheckCircle className="mr-2 mt-1" />
                  <div>
                    <p className="font-medium">Success!</p>
                    <p>All selected requests have been processed successfully.</p>
                  </div>
                </div>
              )}

              {processingStatus === 'error' && Object.keys(processingResults).length > 0 && (
                <div className="mt-6 border rounded-md overflow-hidden">
                  <div className="bg-terracotta/10 p-4">
                    <h3 className="font-medium text-terracotta">Processing Results</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-gray/10">
                      <tr>
                        <th className="px-4 py-3 text-left">Request ID</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(processingResults).map(([requestId, result]) => (
                        <tr key={requestId} className="border-t border-slate-gray/10">
                          <td className="px-4 py-3">{requestId}</td>
                          <td className="px-4 py-3">
                            {result.success ? (
                              <span className="flex items-center text-green-500">
                                <FiCheck className="mr-1" /> Success
                              </span>
                            ) : (
                              <span className="flex items-center text-terracotta">
                                <FiX className="mr-1" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">{result.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-xl font-playfair font-semibold mb-6">Batch Processing</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">What is Batch Processing?</h3>
                  <p className="text-text-secondary">
                    Batch processing allows you to approve or reject multiple requests at once, saving you time when dealing with similar requests.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">How to Use</h3>
                  <ol className="list-decimal pl-5 text-text-secondary space-y-2">
                    <li>Select the requests you want to process using the checkboxes</li>
                    <li>Click "Approve Selected" or "Reject Selected" to process all selected requests</li>
                    <li>Review the results to ensure all requests were processed successfully</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Important Notes</h3>
                  <ul className="list-disc pl-5 text-text-secondary space-y-2">
                    <li>Batch processing is best for similar requests that require the same decision</li>
                    <li>For complex requests, it's recommended to review them individually</li>
                    <li>All actions are logged and can be reviewed in the request history</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
