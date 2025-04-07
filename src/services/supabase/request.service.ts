import { supabase } from '@/lib/supabase';
import { Request, RequestStatus, RequestType } from '@/types/request';

export interface RequestFilters {
  status?: RequestStatus;
  type?: RequestType;
  user_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Service for handling request operations directly with Supabase
 */
const supabaseRequestService = {
  /**
   * Get all requests with optional filters
   * @param filters Optional filters for requests
   * @returns Array of requests
   */
  async getAllRequests(filters: RequestFilters = {}): Promise<Request[]> {
    try {
      console.log('Fetching requests directly from Supabase with filters:', filters);
      
      let query = supabase
        .from('requests')
        .select(`
          *,
          user:users(id, full_name, email),
          documents:request_documents!request_id(id, file_name, file_type, file_url),
          workflow:request_workflow!request_id(id, current_stage, assigned_to)
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%, ticket_number.ilike.%${filters.search}%`);
      }
      
      // Add pagination if specified
      if (filters.page && filters.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }
      
      // Order by created_at descending (newest first)
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase error fetching requests:', error);
        throw new Error(`Failed to fetch requests: ${error.message}`);
      }
      
      return data || [];
    } catch (error: any) {
      console.error('Error in getAllRequests:', error);
      throw error;
    }
  },
  
  /**
   * Get a request by ID
   * @param id Request ID
   * @returns Request object
   */
  async getRequestById(id: string): Promise<Request> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          user:users(id, full_name, email),
          documents:request_documents!request_id(id, file_name, file_type, file_url),
          workflow:request_workflow!request_id(id, current_stage, assigned_to)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Supabase error fetching request by ID:', error);
        throw new Error(`Failed to fetch request: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in getRequestById:', error);
      throw error;
    }
  },
  
  /**
   * Create a new request
   * @param requestData Request data
   * @returns Created request
   */
  async createRequest(requestData: Partial<Request>): Promise<Request> {
    try {
      // Generate a ticket number if not provided
      if (!requestData.ticket_number) {
        requestData.ticket_number = `REQ-${Date.now().toString().slice(-6)}`;
      }
      
      // Set default values
      const newRequest = {
        ...requestData,
        status: requestData.status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('requests')
        .insert(newRequest)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating request:', error);
        throw new Error(`Failed to create request: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in createRequest:', error);
      throw error;
    }
  },
  
  /**
   * Update a request
   * @param id Request ID
   * @param requestData Updated request data
   * @returns Updated request
   */
  async updateRequest(id: string, requestData: Partial<Request>): Promise<Request> {
    try {
      const updateData = {
        ...requestData,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error updating request:', error);
        throw new Error(`Failed to update request: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Error in updateRequest:', error);
      throw error;
    }
  },
  
  /**
   * Delete a request
   * @param id Request ID
   * @returns Success message
   */
  async deleteRequest(id: string): Promise<{ message: string }> {
    try {
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Supabase error deleting request:', error);
        throw new Error(`Failed to delete request: ${error.message}`);
      }
      
      return { message: 'Request deleted successfully' };
    } catch (error: any) {
      console.error('Error in deleteRequest:', error);
      throw error;
    }
  },
  
  /**
   * Upload a document for a request
   * @param requestId Request ID
   * @param file File to upload
   * @param fileName File name
   * @returns Uploaded document info
   */
  async uploadDocument(requestId: string, file: File, fileName: string): Promise<any> {
    try {
      // Upload file to storage
      const filePath = `requests/${requestId}/${fileName}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Supabase error uploading document:', uploadError);
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      // Create document record
      const documentData = {
        request_id: requestId,
        file_name: fileName,
        file_type: file.type,
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString()
      };
      
      const { data: documentRecord, error: documentError } = await supabase
        .from('request_documents')
        .insert(documentData)
        .select()
        .single();
      
      if (documentError) {
        console.error('Supabase error creating document record:', documentError);
        throw new Error(`Failed to create document record: ${documentError.message}`);
      }
      
      return documentRecord;
    } catch (error: any) {
      console.error('Error in uploadDocument:', error);
      throw error;
    }
  }
};

export default supabaseRequestService;
