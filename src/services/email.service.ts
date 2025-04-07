import { apiService } from './api';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  template_id?: string;
  template_data?: Record<string, any>;
}

export interface EmailPreference {
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Email service for handling email-related API calls
 */
export const emailService = {
  /**
   * Send an email
   * @param emailData - Email data
   * @returns Success message
   */
  async sendEmail(emailData: EmailData): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/emails/send', emailData);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  /**
   * Send an email using a template
   * @param to - Recipient email
   * @param templateId - Template ID
   * @param templateData - Template data
   * @returns Success message
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    templateData: Record<string, any>
  ): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/emails/send-template', {
        to,
        template_id: templateId,
        template_data: templateData
      });
    } catch (error) {
      console.error('Error sending template email:', error);
      throw error;
    }
  },

  /**
   * Get all email templates
   * @returns Array of email templates
   */
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      return await apiService.get<EmailTemplate[]>('/emails/templates');
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return [];
    }
  },

  /**
   * Get an email template by ID
   * @param id - Template ID
   * @returns Email template
   */
  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    try {
      return await apiService.get<EmailTemplate>(`/emails/templates/${id}`);
    } catch (error) {
      console.error(`Error fetching email template ${id}:`, error);
      return null;
    }
  },

  /**
   * Get email preferences for a user
   * @returns Array of email preferences
   */
  async getEmailPreferences(): Promise<EmailPreference[]> {
    try {
      return await apiService.get<EmailPreference[]>('/emails/preferences');
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      return [];
    }
  },

  /**
   * Update email preferences for a user
   * @param preferences - Email preferences
   * @returns Updated email preferences
   */
  async updateEmailPreferences(
    preferences: Record<string, boolean>
  ): Promise<EmailPreference[]> {
    try {
      return await apiService.put<EmailPreference[]>('/emails/preferences', { preferences });
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  },

  /**
   * Send a test email
   * @param to - Recipient email
   * @returns Success message
   */
  async sendTestEmail(to: string): Promise<{ message: string }> {
    try {
      return await apiService.post<{ message: string }>('/emails/test', { to });
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }
};
