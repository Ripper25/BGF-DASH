const { supabase } = require('../config/supabase');
const { REQUEST_STATUS } = require('./request.model');

/**
 * Workflow stages in the system
 */
const WORKFLOW_STAGES = {
  SUBMISSION: 'submission',                      // Initial request submission by user
  HOP_REVIEW: 'hop_review',                     // Head of Programs initial review
  OFFICER_ASSIGNMENT: 'officer_assignment',      // Assignment to Assistant Project Officer or Project Manager
  OFFICER_REVIEW: 'officer_review',             // Review by assigned officer
  HOP_FINAL_REVIEW: 'hop_final_review',         // Head of Programs final review
  DIRECTOR_REVIEW: 'director_review',           // Review by Director
  EXECUTIVE_APPROVAL: 'executive_approval',     // Final approval by CEO and Patron
  COMPLETED: 'completed'                        // Request completed
};

/**
 * Workflow model for handling workflow-related database operations
 */
const WorkflowModel = {
  /**
   * Initialize workflow for a new request
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Created workflow data
   */
  async initializeWorkflow(requestId) {
    // Get the Head of Programs user
    const { data: hopUsers, error: hopError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'head_of_programs')
      .limit(1);

    if (hopError) {
      throw new Error(`Database error finding HOP: ${hopError.message}`);
    }

    const headOfProgramsId = hopUsers && hopUsers.length > 0 ? hopUsers[0].id : null;

    // Create the workflow entry
    const { data, error } = await supabase
      .from('request_workflow')
      .insert({
        request_id: requestId,
        current_stage: WORKFLOW_STAGES.SUBMISSION,
        head_of_programs_id: headOfProgramsId, // Auto-assign to Head of Programs
        submission_date: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Update the request status to under review
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.UNDER_REVIEW,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request update error: ${requestError.message}`);
    }

    return data;
  },

  /**
   * Get workflow by request ID
   * @param {string} requestId - Request ID
   * @returns {Promise<Object>} Workflow data
   */
  async getWorkflowByRequestId(requestId) {
    const { data, error } = await supabase
      .from('request_workflow')
      .select(`
        *,
        request:requests(*),
        assistant_officer:users!assistant_project_officer_id(*),
        project_manager:users!project_manager_id(*),
        head_of_programs:users!head_of_programs_id(*),
        director:users!director_id(*),
        ceo:users!ceo_id(*),
        patron:users!patron_id(*)
      `)
      .eq('request_id', requestId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Head of Programs initial review
   * @param {string} requestId - Request ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Updated workflow data
   */
  async submitHopInitialReview(requestId, reviewData) {
    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.HOP_REVIEW,
        hop_review_date: new Date(),
        hop_review_notes: reviewData.notes,
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.UNDER_REVIEW,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Assign request to Assistant Project Officer or Project Manager
   * @param {string} requestId - Request ID
   * @param {string} officerId - Officer user ID
   * @param {string} officerType - Type of officer ('assistant_project_officer' or 'project_manager')
   * @returns {Promise<Object>} Updated workflow data
   */
  async assignToOfficer(requestId, officerId, officerType) {
    // Determine which field to update based on officer type
    const updateField = officerType === 'assistant_project_officer'
      ? 'assistant_project_officer_id'
      : 'project_manager_id';

    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.OFFICER_ASSIGNMENT,
        [updateField]: officerId,
        officer_assignment_date: new Date(),
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.UNDER_REVIEW,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Submit officer review (Assistant Project Officer or Project Manager)
   * @param {string} requestId - Request ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Updated workflow data
   */
  async submitOfficerReview(requestId, reviewData) {
    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.OFFICER_REVIEW,
        officer_review_date: new Date(),
        officer_review_notes: reviewData.notes,
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.OFFICER_REVIEWED,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Submit Head of Programs final review
   * @param {string} requestId - Request ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Updated workflow data
   */
  async submitHopFinalReview(requestId, reviewData) {
    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.HOP_FINAL_REVIEW,
        hop_final_review_date: new Date(),
        hop_final_review_notes: reviewData.notes,
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.HOP_REVIEWED,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Assign to director for review
   * @param {string} requestId - Request ID
   * @param {string} directorId - Director user ID
   * @returns {Promise<Object>} Updated workflow data
   */
  async assignToDirector(requestId, directorId) {
    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.DIRECTOR_REVIEW,
        director_id: directorId,
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.UNDER_REVIEW,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Submit director review
   * @param {string} requestId - Request ID
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Updated workflow data
   */
  async submitDirectorReview(requestId, reviewData) {
    // Get CEO and Patron IDs
    const { data: ceoUsers, error: ceoError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'ceo')
      .limit(1);

    if (ceoError) {
      throw new Error(`Database error finding CEO: ${ceoError.message}`);
    }

    const { data: patronUsers, error: patronError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'patron')
      .limit(1);

    if (patronError) {
      throw new Error(`Database error finding Patron: ${patronError.message}`);
    }

    const ceoId = ceoUsers && ceoUsers.length > 0 ? ceoUsers[0].id : null;
    const patronId = patronUsers && patronUsers.length > 0 ? patronUsers[0].id : null;

    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update({
        current_stage: WORKFLOW_STAGES.EXECUTIVE_APPROVAL,
        director_review_date: new Date(),
        director_review_notes: reviewData.notes,
        ceo_id: ceoId,
        patron_id: patronId,
        updated_at: new Date()
      })
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status
    const { error: requestError } = await supabase
      .from('requests')
      .update({
        status: REQUEST_STATUS.DIRECTOR_REVIEWED,
        updated_at: new Date()
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Request error: ${requestError.message}`);
    }

    return workflow;
  },

  /**
   * Submit executive approval (CEO and Patron)
   * @param {string} requestId - Request ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Updated workflow data
   */
  async submitExecutiveApproval(requestId, approvalData) {
    const { role, approved, notes } = approvalData;

    // Determine which field to update based on role
    const approvedField = role === 'ceo' ? 'ceo_approved' : 'patron_approved';

    // Get current workflow to check if both have approved
    const { data: currentWorkflow, error: getError } = await supabase
      .from('request_workflow')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (getError) {
      throw new Error(`Workflow fetch error: ${getError.message}`);
    }

    // Update with the current approval
    const updateData = {
      [approvedField]: approved,
      executive_approval_notes: notes,
      updated_at: new Date()
    };

    // Check if this completes the approval process
    const otherApprovedField = role === 'ceo' ? 'patron_approved' : 'ceo_approved';
    const otherApproved = currentWorkflow[otherApprovedField];

    // If both have now approved or either has rejected, mark as completed
    const isCompleted = (approved && otherApproved) || !approved;
    if (isCompleted) {
      updateData.current_stage = WORKFLOW_STAGES.COMPLETED;
      updateData.executive_approval_date = new Date();
      updateData.completed = true;
    }

    // Update the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflow')
      .update(updateData)
      .eq('request_id', requestId)
      .select()
      .single();

    if (workflowError) {
      throw new Error(`Workflow error: ${workflowError.message}`);
    }

    // Update the request status if completed
    if (isCompleted) {
      const status = approved && otherApproved
        ? REQUEST_STATUS.APPROVED
        : REQUEST_STATUS.REJECTED;

      const { error: requestError } = await supabase
        .from('requests')
        .update({
          status: status,
          updated_at: new Date()
        })
        .eq('id', requestId);

      if (requestError) {
        throw new Error(`Request error: ${requestError.message}`);
      }
    }

    return workflow;
  },

  /**
   * Get all workflows with optional filters
   * @param {Object} filters - Optional filters (stage, role, user_id)
   * @returns {Promise<Array>} Array of workflows
   */
  async getAllWorkflows(filters = {}) {
    let query = supabase
      .from('request_workflow')
      .select(`
        *,
        request:requests(*),
        assistant_officer:users!assistant_project_officer_id(id, full_name, email, role),
        project_manager:users!project_manager_id(id, full_name, email, role),
        head_of_programs:users!head_of_programs_id(id, full_name, email, role),
        director:users!director_id(id, full_name, email, role),
        ceo:users!ceo_id(id, full_name, email, role),
        patron:users!patron_id(id, full_name, email, role)
      `);

    // Apply filters
    if (filters.stage) {
      query = query.eq('current_stage', filters.stage);
    }

    // Filter by role and user ID
    if (filters.role && filters.user_id) {
      switch (filters.role) {
        case 'assistant_project_officer':
          query = query.eq('assistant_project_officer_id', filters.user_id);
          break;
        case 'project_manager':
          query = query.eq('project_manager_id', filters.user_id);
          break;
        case 'head_of_programs':
          query = query.eq('head_of_programs_id', filters.user_id);
          break;
        case 'director':
          query = query.eq('director_id', filters.user_id);
          break;
        case 'ceo':
          query = query.eq('ceo_id', filters.user_id);
          break;
        case 'patron':
          query = query.eq('patron_id', filters.user_id);
          break;
      }
    }

    // Order by updated_at in descending order (newest first)
    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  },

  /**
   * Add a comment to the workflow
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} Created comment data
   */
  async addComment(commentData) {
    const { data, error } = await supabase
      .from('workflow_comments')
      .insert({
        workflow_id: commentData.workflow_id,
        user_id: commentData.user_id,
        comment: commentData.comment,
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
   * Get comments for a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} Array of comments
   */
  async getComments(workflowId) {
    const { data, error } = await supabase
      .from('workflow_comments')
      .select(`
        *,
        user:users(id, full_name, email, role)
      `)
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
};

module.exports = {
  WorkflowModel,
  WORKFLOW_STAGES
};
