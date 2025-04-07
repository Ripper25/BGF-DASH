export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type RequestType = 'funding' | 'partnership' | 'volunteer' | 'other';

export interface RequestDocument {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  created_at: string;
}

export interface RequestWorkflow {
  id: string;
  request_id: string;
  current_stage: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface Request {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: RequestType;
  status: RequestStatus;
  amount?: number;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  documents?: RequestDocument[];
  workflow?: RequestWorkflow;
}
