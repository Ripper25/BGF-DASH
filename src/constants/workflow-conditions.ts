import { REQUEST_TYPES } from './request.constants';

/**
 * Workflow stages for different request types
 */
export const WORKFLOW_STAGES = {
  // Standard workflow stages
  SUBMITTED: 'submitted',
  INITIAL_REVIEW: 'initial_review',
  OFFICER_REVIEW: 'officer_review',
  MANAGER_REVIEW: 'manager_review',
  FINAL_REVIEW: 'final_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  
  // Special stages for specific request types
  FINANCIAL_REVIEW: 'financial_review',
  DOCUMENTATION_REVIEW: 'documentation_review',
  SITE_VISIT: 'site_visit',
  COMMITTEE_REVIEW: 'committee_review',
};

/**
 * Workflow configurations for different request types
 */
export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  requiredRole?: string;
  nextStages: string[];
  isTerminal?: boolean;
}

export interface WorkflowConfig {
  initialStage: string;
  stages: Record<string, WorkflowStage>;
}

/**
 * Workflow configurations for different request types
 */
export const WORKFLOW_CONFIGS: Record<string, WorkflowConfig> = {
  // Standard workflow for most requests
  default: {
    initialStage: WORKFLOW_STAGES.SUBMITTED,
    stages: {
      [WORKFLOW_STAGES.SUBMITTED]: {
        id: WORKFLOW_STAGES.SUBMITTED,
        name: 'Submitted',
        description: 'Request has been submitted and is awaiting initial review',
        nextStages: [WORKFLOW_STAGES.INITIAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.INITIAL_REVIEW]: {
        id: WORKFLOW_STAGES.INITIAL_REVIEW,
        name: 'Initial Review',
        description: 'Request is being reviewed by a program manager',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.OFFICER_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.OFFICER_REVIEW]: {
        id: WORKFLOW_STAGES.OFFICER_REVIEW,
        name: 'Officer Review',
        description: 'Request is being reviewed by a project officer',
        requiredRole: 'assistant_project_officer',
        nextStages: [WORKFLOW_STAGES.FINAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.FINAL_REVIEW]: {
        id: WORKFLOW_STAGES.FINAL_REVIEW,
        name: 'Final Review',
        description: 'Request is undergoing final review by a program manager',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.APPROVED, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.APPROVED]: {
        id: WORKFLOW_STAGES.APPROVED,
        name: 'Approved',
        description: 'Request has been approved',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.REJECTED]: {
        id: WORKFLOW_STAGES.REJECTED,
        name: 'Rejected',
        description: 'Request has been rejected',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.CANCELLED]: {
        id: WORKFLOW_STAGES.CANCELLED,
        name: 'Cancelled',
        description: 'Request has been cancelled',
        isTerminal: true,
        nextStages: [],
      },
    },
  },
  
  // Scholarship requests require additional financial review
  [REQUEST_TYPES.SCHOLARSHIP]: {
    initialStage: WORKFLOW_STAGES.SUBMITTED,
    stages: {
      [WORKFLOW_STAGES.SUBMITTED]: {
        id: WORKFLOW_STAGES.SUBMITTED,
        name: 'Submitted',
        description: 'Scholarship request has been submitted and is awaiting initial review',
        nextStages: [WORKFLOW_STAGES.INITIAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.INITIAL_REVIEW]: {
        id: WORKFLOW_STAGES.INITIAL_REVIEW,
        name: 'Initial Review',
        description: 'Scholarship request is being reviewed by a program manager',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.DOCUMENTATION_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.DOCUMENTATION_REVIEW]: {
        id: WORKFLOW_STAGES.DOCUMENTATION_REVIEW,
        name: 'Documentation Review',
        description: 'Scholarship documents are being verified',
        requiredRole: 'assistant_project_officer',
        nextStages: [WORKFLOW_STAGES.FINANCIAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.FINANCIAL_REVIEW]: {
        id: WORKFLOW_STAGES.FINANCIAL_REVIEW,
        name: 'Financial Review',
        description: 'Scholarship financial details are being reviewed',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.FINAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.FINAL_REVIEW]: {
        id: WORKFLOW_STAGES.FINAL_REVIEW,
        name: 'Final Review',
        description: 'Scholarship request is undergoing final review',
        requiredRole: 'director',
        nextStages: [WORKFLOW_STAGES.APPROVED, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.APPROVED]: {
        id: WORKFLOW_STAGES.APPROVED,
        name: 'Approved',
        description: 'Scholarship request has been approved',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.REJECTED]: {
        id: WORKFLOW_STAGES.REJECTED,
        name: 'Rejected',
        description: 'Scholarship request has been rejected',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.CANCELLED]: {
        id: WORKFLOW_STAGES.CANCELLED,
        name: 'Cancelled',
        description: 'Scholarship request has been cancelled',
        isTerminal: true,
        nextStages: [],
      },
    },
  },
  
  // Grant requests require committee review
  [REQUEST_TYPES.GRANT]: {
    initialStage: WORKFLOW_STAGES.SUBMITTED,
    stages: {
      [WORKFLOW_STAGES.SUBMITTED]: {
        id: WORKFLOW_STAGES.SUBMITTED,
        name: 'Submitted',
        description: 'Grant request has been submitted and is awaiting initial review',
        nextStages: [WORKFLOW_STAGES.INITIAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.INITIAL_REVIEW]: {
        id: WORKFLOW_STAGES.INITIAL_REVIEW,
        name: 'Initial Review',
        description: 'Grant request is being reviewed by a program manager',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.OFFICER_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.OFFICER_REVIEW]: {
        id: WORKFLOW_STAGES.OFFICER_REVIEW,
        name: 'Officer Review',
        description: 'Grant request is being reviewed by a project officer',
        requiredRole: 'assistant_project_officer',
        nextStages: [WORKFLOW_STAGES.SITE_VISIT, WORKFLOW_STAGES.COMMITTEE_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.SITE_VISIT]: {
        id: WORKFLOW_STAGES.SITE_VISIT,
        name: 'Site Visit',
        description: 'Site visit is being conducted for the grant request',
        requiredRole: 'assistant_project_officer',
        nextStages: [WORKFLOW_STAGES.COMMITTEE_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.COMMITTEE_REVIEW]: {
        id: WORKFLOW_STAGES.COMMITTEE_REVIEW,
        name: 'Committee Review',
        description: 'Grant request is being reviewed by the grants committee',
        requiredRole: 'head_of_programs',
        nextStages: [WORKFLOW_STAGES.FINAL_REVIEW, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.FINAL_REVIEW]: {
        id: WORKFLOW_STAGES.FINAL_REVIEW,
        name: 'Final Review',
        description: 'Grant request is undergoing final review',
        requiredRole: 'director',
        nextStages: [WORKFLOW_STAGES.APPROVED, WORKFLOW_STAGES.REJECTED, WORKFLOW_STAGES.CANCELLED],
      },
      [WORKFLOW_STAGES.APPROVED]: {
        id: WORKFLOW_STAGES.APPROVED,
        name: 'Approved',
        description: 'Grant request has been approved',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.REJECTED]: {
        id: WORKFLOW_STAGES.REJECTED,
        name: 'Rejected',
        description: 'Grant request has been rejected',
        isTerminal: true,
        nextStages: [],
      },
      [WORKFLOW_STAGES.CANCELLED]: {
        id: WORKFLOW_STAGES.CANCELLED,
        name: 'Cancelled',
        description: 'Grant request has been cancelled',
        isTerminal: true,
        nextStages: [],
      },
    },
  },
};

/**
 * Get the workflow configuration for a request type
 * @param requestType - The type of request
 * @returns The workflow configuration for the request type
 */
export function getWorkflowConfig(requestType: string): WorkflowConfig {
  return WORKFLOW_CONFIGS[requestType] || WORKFLOW_CONFIGS.default;
}

/**
 * Get the next possible stages for a request
 * @param requestType - The type of request
 * @param currentStage - The current stage of the request
 * @returns An array of possible next stages
 */
export function getNextStages(requestType: string, currentStage: string): string[] {
  const config = getWorkflowConfig(requestType);
  const stage = config.stages[currentStage];
  
  if (!stage) {
    return [];
  }
  
  return stage.nextStages;
}

/**
 * Check if a stage is valid for a request type
 * @param requestType - The type of request
 * @param stage - The stage to check
 * @returns True if the stage is valid for the request type
 */
export function isValidStage(requestType: string, stage: string): boolean {
  const config = getWorkflowConfig(requestType);
  return !!config.stages[stage];
}

/**
 * Get the required role for a stage
 * @param requestType - The type of request
 * @param stage - The stage to check
 * @returns The required role for the stage, or undefined if no role is required
 */
export function getRequiredRole(requestType: string, stage: string): string | undefined {
  const config = getWorkflowConfig(requestType);
  const stageConfig = config.stages[stage];
  
  if (!stageConfig) {
    return undefined;
  }
  
  return stageConfig.requiredRole;
}

/**
 * Check if a stage is a terminal stage
 * @param requestType - The type of request
 * @param stage - The stage to check
 * @returns True if the stage is a terminal stage
 */
export function isTerminalStage(requestType: string, stage: string): boolean {
  const config = getWorkflowConfig(requestType);
  const stageConfig = config.stages[stage];
  
  if (!stageConfig) {
    return false;
  }
  
  return !!stageConfig.isTerminal;
}
