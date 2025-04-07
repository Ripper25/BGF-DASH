const { supabase } = require('../config/supabase');

/**
 * Request types based on BGF services
 */
const REQUEST_TYPES = {
  SCHOLARSHIP: 'scholarship',
  GRANT: 'grant',
  HEALTH_WELLNESS: 'health_wellness',
  FOOD_NUTRITION: 'food_nutrition',
  WASH: 'wash',
  DRR_SOCIAL_PROTECTION: 'drr_social_protection',
  EDUCATION: 'education',
  SDA_SUPPORT: 'sda_support'
};

/**
 * Request status in the workflow
 */
const REQUEST_STATUS = {
  SUBMITTED: 'submitted',                // Initial submission
  UNDER_REVIEW: 'under_review',         // Being reviewed at any stage
  PENDING_INFORMATION: 'pending_info',  // Waiting for additional information
  OFFICER_REVIEWED: 'officer_reviewed', // Reviewed by assigned officer
  HOP_REVIEWED: 'hop_reviewed',         // Reviewed by Head of Programs
  DIRECTOR_REVIEWED: 'director_reviewed', // Reviewed by Director
  APPROVED: 'approved',                 // Approved by CEO/Patron
  REJECTED: 'rejected',                 // Rejected at any stage
  COMPLETED: 'completed'                // Request fully processed
};

/**
 * Request model for handling request-related database operations
 */
const RequestModel = {
  /**
   * Create a new request
   * @param {Object} requestData - Request data
   * @returns {Promise<Object>} Created request data
   */
  async createRequest(requestData) {
    // Generate a unique ticket number
    const ticketNumber = `BGF-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase
      .from('requests')
      .insert({
        ticket_number: ticketNumber,
        user_id: requestData.user_id,
        request_type: requestData.request_type,
        title: requestData.title,
        description: requestData.description,
        status: REQUEST_STATUS.SUBMITTED,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get request by ID
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Request data
   */
  async getRequestById(requestId) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:users(*),
        documents:request_documents!request_id(*),
        workflow:request_workflow!request_id(*)
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get request by ticket number
   * @param {string} ticketNumber - Ticket number
   * @returns {Promise<Object>} Request data
   */
  async getRequestByTicketNumber(ticketNumber) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        user:users(*),
        documents:request_documents!request_id(*),
        workflow:request_workflow!request_id(*)
      `)
      .eq('ticket_number', ticketNumber)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all requests with optional filters
   * @param {Object} filters - Optional filters (status, type, user_id)
   * @returns {Promise<Array>} Array of requests
   */
  async getAllRequests(filters = {}) {
    let query = supabase
      .from('requests')
      .select(`
        *,
        user:users(id, full_name, email),
        documents:request_documents!request_id(id, file_name, file_type),
        workflow:request_workflow!request_id(id, current_stage, assigned_to)
      `);

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.type) {
      query = query.eq('request_type', filters.type);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    // Order by created_at in descending order (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Update request data
   * @param {string} requestId - Request ID
   * @param {Object} requestData - Updated request data
   * @returns {Promise<Object>} Updated request data
   */
  async updateRequest(requestId, requestData) {
    const { data, error } = await supabase
      .from('requests')
      .update({
        ...requestData,
        updated_at: new Date()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a request
   * @param {string} requestId - Request ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteRequest(requestId) {
    // Delete associated documents first
    const { error: docError } = await supabase
      .from('request_documents')
      .delete()
      .eq('request_id', requestId);

    if (docError) {
      throw new Error(`Database error: ${docError.message}`);
    }

    // Delete workflow records
    const { error: workflowError } = await supabase
      .from('request_workflow')
      .delete()
      .eq('request_id', requestId);

    if (workflowError) {
      throw new Error(`Database error: ${workflowError.message}`);
    }

    // Delete the request
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  },

  /**
   * Add document to a request
   * @param {Object} documentData - Document data
   * @returns {Promise<Object>} Created document data
   */
  async addDocument(documentData) {
    const { data, error } = await supabase
      .from('request_documents')
      .insert({
        request_id: documentData.request_id,
        file_name: documentData.file_name,
        file_path: documentData.file_path,
        file_type: documentData.file_type,
        uploaded_by: documentData.uploaded_by,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Get documents for a request
   * @param {string} requestId - Request ID
   * @returns {Promise<Array>} Array of documents
   */
  async getDocuments(requestId) {
    const { data, error } = await supabase
      .from('request_documents')
      .select('*')
      .eq('request_id', requestId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    const { error } = await supabase
      .from('request_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  }
};

module.exports = {
  RequestModel,
  REQUEST_TYPES,
  REQUEST_STATUS
};
