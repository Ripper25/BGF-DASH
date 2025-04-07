"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FiUserPlus } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import ErrorMessage from '@/components/ui/ErrorMessage';
import WorkflowStatus from '@/components/workflow/WorkflowStatus';
import WorkflowHistory from '@/components/workflow/WorkflowHistory';
import ConditionalWorkflowStages from '@/components/workflow/ConditionalWorkflowStages';
import { FiArrowLeft, FiEdit, FiTrash2, FiFileText, FiUser, FiCalendar, FiClock, FiMessageSquare, FiPaperclip, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import supabaseRequestService from '@/services/supabase/request.service';
import { Request as RequestData } from '@/types/request';
import { workflowService, WorkflowData, WorkflowComment } from '@/services/workflow.service';
import { ROUTES } from '@/app/routes';

// Dynamically import the modal components
const AssignOfficerModal = dynamic(() => import('@/components/workflow/AssignOfficerModal'), {
  ssr: false,
});

const DelegateRequestModal = dynamic(() => import('@/components/workflow/DelegateRequestModal'), {
  ssr: false,
});

export default function RequestDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RequestData | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          // Try to fetch the request data directly from Supabase
          const requestData = await supabaseRequestService.getRequestById(id as string);
          setRequest(requestData);

          // Try to fetch the workflow data
          const workflowData = await workflowService.getWorkflowByRequestId(id as string);
          setWorkflow(workflowData);

          // Try to fetch the comments
          const commentsData = await workflowService.getComments(id as string);
          setComments(commentsData || []);
        } catch (apiError) {
          console.error('API error:', apiError);
          setError('Request not found or you don\'t have permission to view it.');
          // Important: Set request to null to show the not found state
          setRequest(null);
        }
      } catch (err: any) {
        console.error('Error fetching request details:', err);
        setError(err.message || 'Failed to fetch request details');
        // Important: Set request to null to show the not found state
        setRequest(null);
      } finally {
        // Always set loading to false to prevent stuck loading state
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestData();
    } else {
      // If no ID, set request to null and stop loading
      setRequest(null);
      setLoading(false);
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // In a real application, we would send this to the API
      const comment = await workflowService.addComment(id as string, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAssignmentComplete = async () => {
    try {
      // Refresh the workflow data
      const workflowData = await workflowService.getWorkflowByRequestId(id as string);
      setWorkflow(workflowData);
    } catch (error) {
      console.error('Error refreshing workflow data:', error);
    }
  };

  const getStageName = (stage: string): string => {
    switch (stage) {
      case 'hop_initial_review':
        return 'Head of Programs Initial Review';
      case 'officer_review':
        return 'Officer Review';
      case 'hop_final_review':
        return 'Head of Programs Final Review';
      case 'director_review':
        return 'Director Review';
      case 'executive_approval':
        return 'Executive Approval';
      default:
        return stage;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Request Details">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout title="Request Details">
        <div className="mb-6">
          <Button variant="secondary" onClick={() => router.push(ROUTES.REQUESTS)}>
            <FiArrowLeft className="mr-2" />
            Back to Requests
          </Button>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        <Card>
          <div className="text-center py-8">
            <p className="text-text-muted mb-4">Request not found or you don't have permission to view it.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                // Try to fetch the request again
                requestService.getRequestById(id as string)
                  .then(data => setRequest(data))
                  .catch(err => setError(err.message || 'Failed to fetch request details'))
                  .finally(() => setLoading(false));
              }}
            >
              <FiRefreshCw className="mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Request Details">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Button variant="secondary" onClick={() => router.push(ROUTES.REQUESTS)}>
          <FiArrowLeft className="mr-2" />
          Back to Requests
        </Button>

        <div className="flex space-x-2">
          <Button variant="primary">
            <FiEdit className="mr-2" />
            Edit Request
          </Button>
          <Button variant="secondary" className="text-terracotta border-terracotta">
            <FiTrash2 className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-playfair font-semibold">{request.title}</h1>
                <div className="flex items-center mt-2 text-text-muted">
                  <FiFileText className="mr-2" />
                  <span className="mr-4">{request.ticket_number}</span>
                  <FiUser className="mr-2" />
                  <span>{request.requester_name}</span>
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="mb-8">
              <div className="flex border-b border-slate-gray/10">
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'details' ? 'text-bgf-burgundy border-b-2 border-bgf-burgundy' : 'text-text-muted'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'comments' ? 'text-bgf-burgundy border-b-2 border-bgf-burgundy' : 'text-text-muted'}`}
                  onClick={() => setActiveTab('comments')}
                >
                  Comments
                </button>
                <button
                  className={`px-4 py-2 font-medium ${activeTab === 'documents' ? 'text-bgf-burgundy border-b-2 border-bgf-burgundy' : 'text-text-muted'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  Documents
                </button>
              </div>

              <div className="pt-6">
                {activeTab === 'details' && (
                  <div>
                    <h3 className="font-medium mb-3">Description</h3>
                    <p className="text-text-secondary mb-6">{request.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium mb-3">Request Type</h3>
                        <p className="text-text-secondary capitalize">{request.request_type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Amount Requested</h3>
                        <p className="text-text-secondary">${request.amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Created Date</h3>
                        <p className="text-text-secondary">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-3">Last Updated</h3>
                        <p className="text-text-secondary">{new Date(request.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div>
                    <div className="space-y-4 mb-6">
                      {comments.length === 0 ? (
                        <p className="text-text-muted text-center py-4">No comments yet</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="border-b border-slate-gray/10 pb-4">
                            <div className="flex justify-between items-center mb-2">
                              <div className="font-medium">{comment.user_name}</div>
                              <div className="text-text-muted text-sm">{new Date(comment.created_at).toLocaleString()}</div>
                            </div>
                            <p className="text-text-secondary">{comment.comment}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium mb-3">Add Comment</h3>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold mb-4"
                        rows={3}
                        placeholder="Type your comment here..."
                      ></textarea>
                      <Button variant="primary" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <FiMessageSquare className="mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Attached Documents</h3>
                      <Button variant="secondary" size="sm">
                        <FiPaperclip className="mr-2" />
                        Attach File
                      </Button>
                    </div>

                    <div className="border border-slate-gray/20 rounded-md p-8 text-center">
                      <FiPaperclip className="mx-auto mb-2 text-text-muted" size={24} />
                      <p className="text-text-muted">No documents attached</p>
                      <p className="text-text-muted text-sm mt-1">Upload documents to support this request</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <WorkflowStatus currentStatus={request.status} />

            {/* Conditional Workflow Stages */}
            <div className="mt-6 border-t border-slate-gray/10 pt-6">
              <h3 className="text-lg font-medium mb-4">Workflow Stages</h3>
              <ConditionalWorkflowStages
                requestId={id as string}
                requestType={request.request_type}
                currentStage={request.status}
                onStageChange={(newStage) => {
                  // Update the request status
                  setRequest({ ...request, status: newStage });
                }}
                readOnly={user?.role !== 'head_of_programs' && user?.role !== 'assistant_project_officer' && user?.role !== 'director'}
              />
            </div>

            {workflow && (
              <div className="border-t border-slate-gray/10 pt-6 mt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Assigned To</h3>
                    <div className="flex space-x-3">
                      {workflow.assigned_to_name && user?.role === 'head_of_programs' && (
                        <button
                          onClick={() => setShowDelegateModal(true)}
                          className="text-sm text-bgf-burgundy hover:text-deep-burgundy flex items-center"
                        >
                          <FiUserPlus className="mr-1" size={14} />
                          Delegate
                        </button>
                      )}
                      {user?.role === 'head_of_programs' && (
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="text-sm text-bgf-burgundy hover:text-deep-burgundy underline"
                        >
                          {workflow.assigned_to_name ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-text-secondary">{workflow.assigned_to_name || 'Unassigned'}</p>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-3">Last Updated</h3>
                  <p className="text-text-secondary">{new Date(workflow.updated_at).toLocaleDateString()}</p>
                </div>

                <h3 className="font-medium mb-4">Actions</h3>

                <div className="space-y-3">
                  <Button variant="primary" className="w-full justify-center">
                    <FiCheckCircle className="mr-2" />
                    Approve
                  </Button>

                  <Button variant="secondary" className="w-full justify-center text-terracotta border-terracotta">
                    <FiXCircle className="mr-2" />
                    Reject
                  </Button>

                  <Button variant="secondary" className="w-full justify-center">
                    <FiClock className="mr-2" />
                    Request Revision
                  </Button>
                </div>
              </div>
            )}
          </Card>

          <Card className="mt-6">
            <h2 className="text-xl font-playfair font-semibold mb-6">Timeline</h2>

            {/* Use the WorkflowHistory component for a detailed history */}
            <WorkflowHistory requestId={id as string} />

            {/* We don't need the comments section here anymore since it's included in the WorkflowHistory */}
          </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <AssignOfficerModal
          requestId={id as string}
          onClose={() => setShowAssignModal(false)}
          onAssigned={handleAssignmentComplete}
        />
      )}

      {/* Delegation Modal */}
      {showDelegateModal && workflow && (
        <DelegateRequestModal
          requestId={id as string}
          currentAssigneeId={workflow.assigned_to}
          onClose={() => setShowDelegateModal(false)}
          onDelegated={handleAssignmentComplete}
        />
      )}
    </DashboardLayout>
  );
}
