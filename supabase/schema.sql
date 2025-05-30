-- OrgChat-v4 Supabase Schema
-- This schema defines all tables, relationships, and security policies for the OrgChat application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean up existing tables if needed (uncomment for reset)
-- DROP TABLE IF EXISTS documents;
-- DROP TABLE IF EXISTS tasks;
-- DROP TABLE IF EXISTS communication_preferences;
-- DROP TABLE IF EXISTS calendar_events;
-- DROP TABLE IF EXISTS calendar_settings;
-- DROP TABLE IF EXISTS calendar_connections;
-- DROP TABLE IF EXISTS ai_settings;
-- DROP TABLE IF EXISTS reporting_relationships;
-- DROP TABLE IF EXISTS people;
-- DROP TABLE IF EXISTS departments;
-- DROP TABLE IF EXISTS organizations;

-- Create custom types
CREATE TYPE user_persona AS ENUM ('professional', 'friendly', 'technical', 'concise');
CREATE TYPE knowledge_level AS ENUM ('basic', 'intermediate', 'expert');
CREATE TYPE response_style AS ENUM ('formal', 'casual', 'balanced');
CREATE TYPE task_status AS ENUM ('not-started', 'in-progress', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE calendar_type AS ENUM ('google', 'outlook', 'apple', 'other');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_departments_organization ON departments(organization_id);

-- People table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  timezone TEXT,
  bio TEXT,
  image TEXT,
  responsibilities TEXT[],
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enneagram_type TEXT CHECK (enneagram_type IN ('1', '2', '3', '4', '5', '6', '7', '8', '9')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_people_updated_at
BEFORE UPDATE ON people
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_people_organization ON people(organization_id);
CREATE INDEX idx_people_department ON people(department_id);
CREATE INDEX idx_people_email ON people(email);

-- Reporting relationships table
CREATE TABLE reporting_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  report_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_reporting_relationship UNIQUE (report_id)
);

CREATE TRIGGER update_reporting_relationships_updated_at
BEFORE UPDATE ON reporting_relationships
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_reporting_manager ON reporting_relationships(manager_id);
CREATE INDEX idx_reporting_report ON reporting_relationships(report_id);
CREATE INDEX idx_reporting_organization ON reporting_relationships(organization_id);

-- AI Settings table
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  persona user_persona NOT NULL DEFAULT 'professional',
  knowledge_level knowledge_level NOT NULL DEFAULT 'intermediate',
  response_style response_style NOT NULL DEFAULT 'balanced',
  max_response_length INTEGER NOT NULL DEFAULT 500,
  include_citations BOOLEAN NOT NULL DEFAULT true,
  use_emoji BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_ai_settings_updated_at
BEFORE UPDATE ON ai_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_ai_settings_person ON ai_settings(person_id);

-- Calendar Connections table
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  calendar_type calendar_type NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_connections_updated_at
BEFORE UPDATE ON calendar_connections
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_connections_person ON calendar_connections(person_id);

-- Calendar Settings table
CREATE TABLE calendar_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  working_hours_start TIME NOT NULL DEFAULT '09:00:00',
  working_hours_end TIME NOT NULL DEFAULT '17:00:00',
  working_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 0 = Sunday, 1 = Monday, etc.
  auto_decline_outside_hours BOOLEAN NOT NULL DEFAULT false,
  auto_suggest_meeting_times BOOLEAN NOT NULL DEFAULT true,
  default_meeting_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_settings_updated_at
BEFORE UPDATE ON calendar_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_settings_person ON calendar_settings(person_id);

-- Calendar Events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  external_event_id TEXT,
  calendar_connection_id UUID REFERENCES calendar_connections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_events_person ON calendar_events(person_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_connection ON calendar_events(calendar_connection_id);

-- Communication Preferences table
CREATE TABLE communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  preferred_contact_method TEXT NOT NULL DEFAULT 'email',
  notification_email BOOLEAN NOT NULL DEFAULT true,
  notification_slack BOOLEAN NOT NULL DEFAULT false,
  notification_mobile BOOLEAN NOT NULL DEFAULT false,
  do_not_disturb_start TIME,
  do_not_disturb_end TIME,
  do_not_disturb_days INTEGER[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_communication_preferences_updated_at
BEFORE UPDATE ON communication_preferences
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_communication_preferences_person ON communication_preferences(person_id);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'not-started',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  assigned_by UUID REFERENCES people(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Create a view for organization chart
CREATE OR REPLACE VIEW org_chart_view AS
WITH RECURSIVE org_tree AS (
  -- Root nodes (people without managers)
  SELECT 
    p.id, 
    p.name, 
    p.role, 
    p.department_id, 
    p.email,
    p.phone,
    p.location,
    p.timezone,
    p.bio,
    p.image,
    p.responsibilities,
    p.organization_id,
    p.enneagram_type,
    NULL::UUID as manager_id,
    0 as level
  FROM 
    people p
  WHERE 
    p.id NOT IN (SELECT report_id FROM reporting_relationships)
  
  UNION ALL
  
  -- Children nodes
  SELECT 
    p.id, 
    p.name, 
    p.role, 
    p.department_id, 
    p.email,
    p.phone,
    p.location,
    p.timezone,
    p.bio,
    p.image,
    p.responsibilities,
    p.organization_id,
    p.enneagram_type,
    r.manager_id,
    ot.level + 1
  FROM 
    people p
  JOIN 
    reporting_relationships r ON p.id = r.report_id
  JOIN 
    org_tree ot ON r.manager_id = ot.id
)
SELECT * FROM org_tree;

-- Function to get the full org chart for an organization
CREATE OR REPLACE FUNCTION get_org_chart(org_id UUID)
RETURNS SETOF org_chart_view AS $$
  SELECT * FROM org_chart_view WHERE organization_id = org_id ORDER BY level, name;
$$ LANGUAGE SQL;

-- Function to get all children for a given person
CREATE OR REPLACE FUNCTION get_children(person_id UUID)
RETURNS SETOF org_chart_view AS $$
  WITH RECURSIVE children AS (
    -- Direct reports
    SELECT 
      p.id, 
      p.name, 
      p.role, 
      p.department_id, 
      p.email,
      p.phone,
      p.location,
      p.timezone,
      p.bio,
      p.image,
      p.responsibilities,
      p.organization_id,
      p.enneagram_type,
      r.manager_id,
      1 as level
    FROM 
      people p
    JOIN 
      reporting_relationships r ON p.id = r.report_id
    WHERE 
      r.manager_id = person_id
    
    UNION ALL
    
    -- Indirect reports (reports of reports)
    SELECT 
      p.id, 
      p.name, 
      p.role, 
      p.department_id, 
      p.email,
      p.phone,
      p.location,
      p.timezone,
      p.bio,
      p.image,
      p.responsibilities,
      p.organization_id,
      p.enneagram_type,
      r.manager_id,
      c.level + 1
    FROM 
      people p
    JOIN 
      reporting_relationships r ON p.id = r.report_id
    JOIN 
      children c ON r.manager_id = c.id
  )
  SELECT * FROM children ORDER BY level, name;
$$ LANGUAGE SQL;

-- Security policies (enable row level security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
