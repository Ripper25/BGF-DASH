export type NotificationType = 'info' | 'update' | 'reminder' | 'assignment' | 'alert';

export interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
