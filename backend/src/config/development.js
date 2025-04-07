/**
 * Development configuration
 */

// Development mode flag - set to true for development, false for production
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Valid UUID for development user - using a real user ID from the database
const DEV_USER_ID = 'f6d0cd7c-d174-4c38-a0d4-482513ee16e0'; // user@example.com

// Valid UUID for development staff user
const DEV_STAFF_ID = DEV_USER_ID; // Using the same ID for now, should be updated with a real staff ID

// Staff access codes for development
const STAFF_CODES = {
  'APO001': { role: 'assistant_project_officer' },
  'PM001': { role: 'project_manager' },
  'HOP001': { role: 'head_of_programs' },
  'DIR001': { role: 'director' },
  'CEO001': { role: 'ceo' },
  'PAT001': { role: 'patron' }
};

/**
 * Generate sample requests for development
 * @param {number} count - Number of requests to generate
 * @returns {Array} Array of sample requests
 */
const generateSampleRequests = (count = 10) => {
  const requests = [];
  const types = ['scholarship', 'grant', 'health_wellness', 'food_nutrition', 'wash', 'drr_social_protection', 'education', 'sda_support'];
  const statuses = ['submitted', 'under_review', 'pending_info', 'officer_reviewed', 'hop_reviewed', 'director_reviewed', 'approved', 'rejected', 'completed'];

  for (let i = 0; i < count; i++) {
    const requestType = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    requests.push({
      id: `sample-${i}`,
      title: `Sample ${requestType} request ${i + 1}`,
      description: `This is a sample ${requestType} request for development purposes.`,
      requester_id: DEV_USER_ID,
      requester_name: 'Development User',
      request_type: requestType,
      amount: Math.floor(Math.random() * 10000) + 1000,
      status: status,
      ticket_number: `BGF-${100000 + i}`,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  return requests;
};

/**
 * Generate sample notifications for development
 * @param {number} count - Number of notifications to generate
 * @returns {Array} Array of sample notifications
 */
const generateSampleNotifications = (count = 5) => {
  const notifications = [];
  const types = ['request_update', 'system_message', 'approval', 'rejection', 'information_needed'];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const isRead = Math.random() > 0.5;

    notifications.push({
      id: `sample-${i}`,
      user_id: DEV_USER_ID,
      title: `Sample ${type} notification ${i + 1}`,
      message: `This is a sample ${type} notification for development purposes.`,
      type: type,
      is_read: isRead,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return notifications;
};

module.exports = {
  DEV_MODE,
  DEV_USER_ID,
  DEV_STAFF_ID,
  STAFF_CODES,
  generateSampleRequests,
  generateSampleNotifications
};
