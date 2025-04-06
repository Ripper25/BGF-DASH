"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { FiArrowLeft, FiFileText, FiUser, FiCalendar, FiCheckCircle, FiXCircle, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { requestService, RequestData } from '@/services/request.service';
import { workflowService, WorkflowData, WorkflowComment, WorkflowReview } from '@/services/workflow.service';
import { ROUTES } from '@/app/routes';

export default function ApprovalDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RequestData | null>(null);
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [comments, setComments] = useState<WorkflowComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [reviewData, setReviewData] = useState<WorkflowReview>({
    status: 'approved',
    comments: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovalData = async () => {
      try {
        setLoading(true);
        // In a real application, we would fetch this data from the API
        // const workflowData = await workflowService.getWorkflowById(id as string);
        // setWorkflow(workflowData);
        
        // const requestData = await requestService.getRequestById(workflowData.request_id);
        // setRequest(requestData);
        
        // const commentsData = await workflowService.getComments(workflowData.request_id);
        // setComments(commentsData);
        
        // For now, we'll use mock data
        setWorkflow({
          id: id as string,
          request_id: 'REQ-001',
          current_stage: 'officer_review',
          status: 'in_progress',
          assigned_to: '2',
          assigned_to_name: 'Sarah Johnson',
          created_at: '2023-05-01',
          updated_at: '2023-05-03'
        });
        
        setRequest({
          id: 'REQ-001',
          title: 'Financial Aid Request',
          description: 'Request for financial assistance for education. The applicant is seeking support for university tuition fees and related expenses. The total amount requested is $2,500 for the upcoming academic year.',
          requester_name: 'John Doe',
          requester_id: '123',
          request_type: 'financial_aid',
          amount: 2500,
          status: 'under-review',
          ticket_number: 'REQ-001',
          created_at: '2023-05-01',
          updated_at: '2023-05-03'
        });
        
        setComments([
          {
            id: '1',
            workflow_id: id as string,
            request_id: 'REQ-001',
            user_id: '4',
            user_name: 'Emily Davis',
            comment: 'This request has been reviewed initially and assigned to Sarah for further verification.',
            created_at: '2023-05-02'
          },
          {
            id: '2',
            workflow_id: id as string,
            request_id: 'REQ-001',
            user_id: '2',
            user_name: 'Sarah Johnson',
            comment: 'I have contacted the applicant for additional documentation. Waiting for their response.',
            created_at: '2023-05-03'
          }
        ]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch approval details');
        console.error('Error fetching approval details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApprovalData();
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // In a real application, we would send this to the API
      // const comment = await workflowService.addComment(request?.id as string, newComment);
      // setComments([...comments, comment]);
      
      // For now, we'll just add it to the local state
      const mockComment: WorkflowComment = {
        id: `${comments.length + 1}`,
        workflow_id: workflow?.id || '1',
        request_id: request?.id || '',
        user_id: user?.id || '0',
        user_name: user?.full_name || 'Current User',
        comment: newComment,
        created_at: new Date().toISOString()
      };
      
      setComments([...comments, mockComment]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
    }
  };

  const handleSubmitReview = async (status: 'approved' | 'rejected' | 'needs_revision') => {
    if (status !== 'approved' && !reviewData.comments.trim()) {
      alert('Please provide comments for rejection or revision requests.');
      return;
    }
    
    try {
      setLoading(true);
      
      const review: WorkflowReview = {
        status,
        comments: reviewData.comments
      };
      
      // In a real application, we would send this to the API based on the current stage
      // let result;
      // switch (workflow?.current_stage) {
      //   case 'hop_initial_review':
      //     result = await workflowService.submitHopInitialReview(request?.id as string, review);
      //     break;
      //   case 'officer_review':
      //     result = await workflowService.submitOfficerReview(request?.id as string, review);
      //     break;
      //   case 'hop_final_review':
      //     result = await workflowService.submitHopFinalReview(request?.id as string, review);
      //     break;
      //   case 'director_review':
      //     result = await workflowService.submitDirectorReview(request?.id as string, review);
      //     break;
      //   case 'executive_approval':
      //     result = await workflowService.submitExecutiveApproval(request?.id as string, review);
      //     break;
      // }
      
      // For now, we'll just show an alert
      alert(`Review submitted with status: ${status}`);
      
      // Add the review as a comment
      const mockComment: WorkflowComment = {
        id: `${comments.length + 1}`,
        workflow_id: workflow?.id || '1',
        request_id: request?.id || '',
        user_id: user?.id || '0',
        user_name: user?.full_name || 'Current User',
        comment: `Review: ${status.toUpperCase()}${reviewData.comments ? ' - ' + reviewData.comments : ''}`,
        created_at: new Date().toISOString()
      };
      
      setComments([...comments, mockComment]);
      setReviewData({ status: 'approved', comments: '' });
      
      // Redirect back to approvals list
      router.push(ROUTES.APPROVALS);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(`Error: ${err.message || 'Failed to submit review'}`);
    } finally {
      setLoading(false);
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
      <DashboardLayout title="Approval Details">
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-bgf-burgundy border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !request || !workflow) {
    return (
      <DashboardLayout title="Approval Details">
        <Card>
          <div className="text-center py-8">
            <p className="text-terracotta mb-4">{error || 'Approval not found'}</p>
            <Button variant="primary" onClick={() => router.push(ROUTES.APPROVALS)}>
              <FiArrowLeft className="mr-2" />
              Back to Approvals
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Approval Details">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => router.push(ROUTES.APPROVALS)}>
          <FiArrowLeft className="mr-2" />
          Back to Approvals
        </Button>
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
              <StatusBadge status={request.status as any} />
            </div>
            
            <div className="mb-6">
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
            
            <div className="border-t border-slate-gray/10 pt-6">
              <h3 className="font-medium mb-4">Documents</h3>
              
              <div className="border border-slate-gray/20 rounded-md p-8 text-center">
                <FiPaperclip className="mx-auto mb-2 text-text-muted" size={24} />
                <p className="text-text-muted">No documents attached</p>
                <p className="text-text-muted text-sm mt-1">No supporting documents have been uploaded for this request</p>
              </div>
            </div>
          </Card>
          
          <Card className="mt-6">
            <h2 className="text-xl font-playfair font-semibold mb-6">Comments</h2>
            
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
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-playfair font-semibold mb-6">Review</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Current Stage</h3>
                <p className="text-text-secondary">{getStageName(workflow.current_stage)}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Assigned To</h3>
                <p className="text-text-secondary">{workflow.assigned_to_name || 'Unassigned'}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Status</h3>
                <p className="text-text-secondary capitalize">{workflow.status.replace(/_/g, ' ')}</p>
              </div>
              
              <div className="border-t border-slate-gray/10 pt-6">
                <h3 className="font-medium mb-3">Review Decision</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      id="approve"
                      name="review-status"
                      value="approved"
                      checked={reviewData.status === 'approved'}
                      onChange={() => setReviewData({ ...reviewData, status: 'approved' })}
                      className="w-4 h-4 text-bgf-burgundy focus:ring-bgf-burgundy"
                    />
                    <label htmlFor="approve" className="font-medium">Approve</label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      id="reject"
                      name="review-status"
                      value="rejected"
                      checked={reviewData.status === 'rejected'}
                      onChange={() => setReviewData({ ...reviewData, status: 'rejected' })}
                      className="w-4 h-4 text-terracotta focus:ring-terracotta"
                    />
                    <label htmlFor="reject" className="font-medium">Reject</label>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <input
                      type="radio"
                      id="revision"
                      name="review-status"
                      value="needs_revision"
                      checked={reviewData.status === 'needs_revision'}
                      onChange={() => setReviewData({ ...reviewData, status: 'needs_revision' })}
                      className="w-4 h-4 text-gold focus:ring-gold"
                    />
                    <label htmlFor="revision" className="font-medium">Request Revision</label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Comments</h3>
                <textarea
                  value={reviewData.comments}
                  onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-gray/30 rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                  rows={4}
                  placeholder="Add your review comments here..."
                ></textarea>
                <p className="text-text-muted text-sm mt-2">
                  {reviewData.status !== 'approved' ? 'Comments are required for rejection or revision requests.' : 'Comments are optional for approvals.'}
                </p>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full justify-center"
                  onClick={() => handleSubmitReview(reviewData.status)}
                  disabled={loading || (reviewData.status !== 'approved' && !reviewData.comments.trim())}
                >
                  <FiCheckCircle className="mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="mt-6">
            <h2 className="text-xl font-playfair font-semibold mb-6">Timeline</h2>
            
            <div className="space-y-6">
              <div className="relative pl-6 pb-6 border-l-2 border-slate-gray/20">
                <div className="absolute top-0 left-[-8px] w-4 h-4 rounded-full bg-bgf-burgundy"></div>
                <div className="text-sm text-text-muted mb-1">{new Date(request.created_at).toLocaleString()}</div>
                <div className="font-medium">Request Submitted</div>
                <p className="text-text-secondary text-sm mt-1">Request was submitted by {request.requester_name}</p>
              </div>
              
              <div className="relative pl-6 pb-6 border-l-2 border-slate-gray/20">
                <div className="absolute top-0 left-[-8px] w-4 h-4 rounded-full bg-gold"></div>
                <div className="text-sm text-text-muted mb-1">{new Date(workflow.created_at).toLocaleString()}</div>
                <div className="font-medium">Initial Review</div>
                <p className="text-text-secondary text-sm mt-1">Request was reviewed by Head of Programs</p>
              </div>
              
              {comments.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute top-0 left-[-8px] w-4 h-4 rounded-full bg-navy-blue"></div>
                  <div className="text-sm text-text-muted mb-1">{new Date(comments[comments.length - 1].created_at).toLocaleString()}</div>
                  <div className="font-medium">Latest Update</div>
                  <p className="text-text-secondary text-sm mt-1">{comments[comments.length - 1].user_name} added a comment</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
