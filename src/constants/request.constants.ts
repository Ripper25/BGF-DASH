/**
 * Request types based on BGF services - matches backend
 */
export const REQUEST_TYPES = {
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
 * Request types with display names for UI
 */
export const REQUEST_TYPE_LABELS: Record<string, string> = {
  [REQUEST_TYPES.SCHOLARSHIP]: 'Scholarship',
  [REQUEST_TYPES.GRANT]: 'Grant',
  [REQUEST_TYPES.HEALTH_WELLNESS]: 'Health & Wellness',
  [REQUEST_TYPES.FOOD_NUTRITION]: 'Food & Nutrition',
  [REQUEST_TYPES.WASH]: 'Water, Sanitation & Hygiene',
  [REQUEST_TYPES.DRR_SOCIAL_PROTECTION]: 'Disaster Risk Reduction & Social Protection',
  [REQUEST_TYPES.EDUCATION]: 'Education',
  [REQUEST_TYPES.SDA_SUPPORT]: 'SDA Support'
};

/**
 * Request status in the workflow - matches backend
 */
export const REQUEST_STATUS = {
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
 * Request status with display names for UI
 */
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  [REQUEST_STATUS.SUBMITTED]: 'Submitted',
  [REQUEST_STATUS.UNDER_REVIEW]: 'Under Review',
  [REQUEST_STATUS.PENDING_INFORMATION]: 'Pending Information',
  [REQUEST_STATUS.OFFICER_REVIEWED]: 'Officer Reviewed',
  [REQUEST_STATUS.HOP_REVIEWED]: 'Program Manager Reviewed',
  [REQUEST_STATUS.DIRECTOR_REVIEWED]: 'Director Reviewed',
  [REQUEST_STATUS.APPROVED]: 'Approved',
  [REQUEST_STATUS.REJECTED]: 'Rejected',
  [REQUEST_STATUS.COMPLETED]: 'Completed'
};
