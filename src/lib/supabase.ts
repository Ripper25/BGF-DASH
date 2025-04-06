import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://roqzswykxwyzyoeazqiu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvcXpzd3lreHd5enlvZWF6cWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzM3MDEsImV4cCI6MjA1NTU0OTcwMX0.6xrXSErzhRawyUO_HQ5grlV9DPgSluokYLPlT5Y6rXg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const USER_ROLES = {
  ADMIN: 'admin',
  ASSISTANT_PROJECT_OFFICER: 'assistant_project_officer',
  PROJECT_MANAGER: 'project_manager',
  HEAD_OF_PROGRAMS: 'head_of_programs',
  DIRECTOR: 'director',
  CEO: 'ceo',
  PATRON: 'patron',
  USER: 'user'
};
