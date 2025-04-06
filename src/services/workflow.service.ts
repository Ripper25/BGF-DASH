import { apiService } from './api';

export interface WorkflowData {
  id: string;
  request_id: string;
  current_stage: string;
  status: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowComment {
  id: string;
  workflow_id: string;
  request_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface WorkflowReview {
  status: 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  additional_data?: Record<string, any>;
}

/**
 * Workflow service for handling workflow-related operations
 */
export const workflowService = {
  /**
   * Get all workflows with optional filters
   * @param filters - Optional filters
   */
  async getAllWorkflows(filters?: Record<string, any>): Promise<WorkflowData[]> {
    return apiService.get<WorkflowData[]>('/workflow', filters);
  },

  /**
   * Submit Head of Programs initial review
   * @param requestId - Request ID
   * @param reviewData - Review data
   */
  async submitHopInitialReview(requestId: string, reviewData: WorkflowReview): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/hop-initial-review`, reviewData);
  },

  /**
   * Assign request to an officer
   * @param requestId - Request ID
   * @param officerId - Officer ID
   */
  async assignToOfficer(requestId: string, officerId: string): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/assign-officer`, { officer_id: officerId });
  },

  /**
   * Submit officer review
   * @param requestId - Request ID
   * @param reviewData - Review data
   */
  async submitOfficerReview(requestId: string, reviewData: WorkflowReview): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/officer-review`, reviewData);
  },

  /**
   * Submit Head of Programs final review
   * @param requestId - Request ID
   * @param reviewData - Review data
   */
  async submitHopFinalReview(requestId: string, reviewData: WorkflowReview): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/hop-final-review`, reviewData);
  },

  /**
   * Assign request to a director
   * @param requestId - Request ID
   * @param directorId - Director ID
   */
  async assignToDirector(requestId: string, directorId: string): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/assign-director`, { director_id: directorId });
  },

  /**
   * Submit director review
   * @param requestId - Request ID
   * @param reviewData - Review data
   */
  async submitDirectorReview(requestId: string, reviewData: WorkflowReview): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/director-review`, reviewData);
  },

  /**
   * Submit executive approval
   * @param requestId - Request ID
   * @param reviewData - Review data
   */
  async submitExecutiveApproval(requestId: string, reviewData: WorkflowReview): Promise<WorkflowData> {
    return apiService.post<WorkflowData>(`/workflow/${requestId}/executive-approval`, reviewData);
  },

  /**
   * Add a comment to a workflow
   * @param requestId - Request ID
   * @param comment - Comment text
   */
  async addComment(requestId: string, comment: string): Promise<WorkflowComment> {
    return apiService.post<WorkflowComment>(`/workflow/${requestId}/comments`, { comment });
  },

  /**
   * Get comments for a workflow
   * @param requestId - Request ID
   */
  async getComments(requestId: string): Promise<WorkflowComment[]> {
    return apiService.get<WorkflowComment[]>(`/workflow/${requestId}/comments`);
  },
};
