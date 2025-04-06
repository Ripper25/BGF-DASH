import { apiService } from './api';

export interface RequestData {
  id?: string;
  title: string;
  description: string;
  requester_id?: string;
  requester_name?: string;
  request_type: string;
  amount?: number;
  status?: string;
  ticket_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RequestDocument {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_by: string;
  created_at: string;
}

/**
 * Request service for handling request-related operations
 */
export const requestService = {
  /**
   * Create a new request
   * @param requestData - Request data
   */
  async createRequest(requestData: RequestData): Promise<RequestData> {
    return apiService.post<RequestData>('/requests', requestData);
  },

  /**
   * Get all requests with optional filters
   * @param filters - Optional filters
   */
  async getAllRequests(filters?: Record<string, any>): Promise<RequestData[]> {
    return apiService.get<RequestData[]>('/requests', filters);
  },

  /**
   * Get a request by ID
   * @param requestId - Request ID
   */
  async getRequestById(requestId: string): Promise<RequestData> {
    return apiService.get<RequestData>(`/requests/${requestId}`);
  },

  /**
   * Get a request by ticket number
   * @param ticketNumber - Ticket number
   */
  async getRequestByTicketNumber(ticketNumber: string): Promise<RequestData> {
    return apiService.get<RequestData>(`/requests/ticket/${ticketNumber}`);
  },

  /**
   * Update a request
   * @param requestId - Request ID
   * @param requestData - Updated request data
   */
  async updateRequest(requestId: string, requestData: Partial<RequestData>): Promise<RequestData> {
    return apiService.put<RequestData>(`/requests/${requestId}`, requestData);
  },

  /**
   * Delete a request
   * @param requestId - Request ID
   */
  async deleteRequest(requestId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/requests/${requestId}`);
  },

  /**
   * Upload documents for a request
   * @param requestId - Request ID
   * @param formData - FormData containing files
   */
  async uploadDocuments(requestId: string, formData: FormData): Promise<RequestDocument[]> {
    return apiService.uploadFile<RequestDocument[]>(`/requests/${requestId}/documents`, formData);
  },
};
