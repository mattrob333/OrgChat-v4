export interface Organization {
  id: string;
  name: string;
  logo_url?: string | null;
  website?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  organization_id: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  department_id: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  timezone?: string | null;
  bio?: string | null;
  image?: string | null;
  responsibilities?: string[] | null;
  organization_id: string;
  enneagram_type?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonInsert {
  name: string;
  role: string;
  department_id: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  timezone?: string | null;
  bio?: string | null;
  image?: string | null;
  responsibilities?: string[] | null;
  organization_id: string;
  enneagram_type?: string | null;
}

export interface PersonUpdate {
  name?: string;
  role?: string;
  department_id?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  timezone?: string | null;
  bio?: string | null;
  image?: string | null;
  responsibilities?: string[] | null;
  organization_id?: string;
  enneagram_type?: string | null;
}

export interface OrgChartPerson extends Person {
  children?: OrgChartPerson[];
}

export interface ReportingRelationship {
  id: string;
  manager_id: string;
  report_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface AISettings {
  id: string;
  person_id: string;
  persona: 'professional' | 'friendly' | 'technical' | 'concise';
  knowledge_level: 'basic' | 'intermediate' | 'expert';
  response_style: 'formal' | 'casual' | 'balanced';
  max_response_length: number;
  include_citations: boolean;
  use_emoji: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarConnection {
  id: string;
  person_id: string;
  calendar_type: 'google' | 'outlook' | 'apple' | 'other';
  access_token: string;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  calendar_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarSettings {
  id: string;
  person_id: string;
  working_hours_start: string;
  working_hours_end: string;
  working_days: number[];
  auto_decline_outside_hours: boolean;
  auto_suggest_meeting_times: boolean;
  default_meeting_duration: number;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  person_id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location?: string | null;
  is_all_day: boolean;
  is_recurring: boolean;
  recurrence_rule?: string | null;
  external_event_id?: string | null;
  calendar_connection_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunicationPreferences {
  id: string;
  person_id: string;
  preferred_contact_method: string;
  notification_email: boolean;
  notification_slack: boolean;
  notification_mobile: boolean;
  do_not_disturb_start?: string | null;
  do_not_disturb_end?: string | null;
  do_not_disturb_days?: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  assigned_by?: string | null;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface Document {
  id: string;
  title: string;
  description?: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  organizations: Organization;
  departments: Department;
  people: Person;
  reporting_relationships: ReportingRelationship;
  ai_settings: AISettings;
  calendar_connections: CalendarConnection;
  calendar_settings: CalendarSettings;
  calendar_events: CalendarEvent;
  communication_preferences: CommunicationPreferences;
  tasks: Task;
  documents: Document;
}
