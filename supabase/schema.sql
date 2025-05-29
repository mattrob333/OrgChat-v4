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
  CONSTRAINT unique_reporting_relationship UNIQUE (manager_id, report_id)
);

CREATE TRIGGER update_reporting_relationships_updated_at
BEFORE UPDATE ON reporting_relationships
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_reporting_manager ON reporting_relationships(manager_id);
CREATE INDEX idx_reporting_report ON reporting_relationships(report_id);
CREATE INDEX idx_reporting_organization ON reporting_relationships(organization_id);

-- AI settings table
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  temperature FLOAT NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 500,
  top_p FLOAT NOT NULL DEFAULT 0.95,
  frequency_penalty FLOAT NOT NULL DEFAULT 0,
  presence_penalty FLOAT NOT NULL DEFAULT 0,
  system_prompt TEXT,
  persona user_persona NOT NULL DEFAULT 'professional',
  knowledge_level knowledge_level NOT NULL DEFAULT 'expert',
  response_style response_style NOT NULL DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_person_ai_settings UNIQUE (person_id)
);

CREATE TRIGGER update_ai_settings_updated_at
BEFORE UPDATE ON ai_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_ai_settings_person ON ai_settings(person_id);

-- Calendar connections table
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type calendar_type NOT NULL,
  email TEXT NOT NULL,
  connected BOOLEAN NOT NULL DEFAULT false,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_connections_updated_at
BEFORE UPDATE ON calendar_connections
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_connections_person ON calendar_connections(person_id);

-- Calendar events table
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  attendees JSONB,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON calendar_events
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_events_calendar ON calendar_events(calendar_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_external_id ON calendar_events(external_id);

-- Calendar settings table
CREATE TABLE calendar_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  show_meeting_details BOOLEAN NOT NULL DEFAULT true,
  show_attendees BOOLEAN NOT NULL DEFAULT true,
  show_private_events BOOLEAN NOT NULL DEFAULT false,
  show_declined_events BOOLEAN NOT NULL DEFAULT false,
  buffer_time INTEGER NOT NULL DEFAULT 15,
  max_meetings_per_day INTEGER,
  preferred_meeting_length INTEGER NOT NULL DEFAULT 30,
  minimum_scheduling_notice TEXT NOT NULL DEFAULT '1day',
  meeting_types TEXT[] NOT NULL DEFAULT '{"1:1 Meetings", "Team Meetings", "Client Meetings"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_person_calendar_settings UNIQUE (person_id)
);

CREATE TRIGGER update_calendar_settings_updated_at
BEFORE UPDATE ON calendar_settings
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_calendar_settings_person ON calendar_settings(person_id);

-- Communication preferences table
CREATE TABLE communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  meeting_reminders BOOLEAN NOT NULL DEFAULT true,
  task_reminders BOOLEAN NOT NULL DEFAULT true,
  mention_notifications BOOLEAN NOT NULL DEFAULT true,
  team_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_person_communication_preferences UNIQUE (person_id)
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
  due_date DATE,
  category TEXT NOT NULL,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES people(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_tasks_person ON tasks(person_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE INDEX idx_documents_person ON documents(person_id);

-- Create storage bucket for documents
-- INSERT INTO storage.buckets (id, name) VALUES ('documents', 'documents');

-- Row Level Security (RLS) Policies
-- Note: These will be enabled once authentication is implemented

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- For now, create temporary policies that allow all operations
-- These should be replaced with proper policies once authentication is implemented
CREATE POLICY "Allow all operations for organizations" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all operations for departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all operations for people" ON people FOR ALL USING (true);
CREATE POLICY "Allow all operations for reporting_relationships" ON reporting_relationships FOR ALL USING (true);
CREATE POLICY "Allow all operations for ai_settings" ON ai_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for calendar_connections" ON calendar_connections FOR ALL USING (true);
CREATE POLICY "Allow all operations for calendar_events" ON calendar_events FOR ALL USING (true);
CREATE POLICY "Allow all operations for calendar_settings" ON calendar_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for communication_preferences" ON communication_preferences FOR ALL USING (true);
CREATE POLICY "Allow all operations for tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations for documents" ON documents FOR ALL USING (true);

-- Sample data for testing (optional, uncomment to use)
/*
-- Insert sample organization
INSERT INTO organizations (name, description)
VALUES ('Sample Company', 'A sample company for testing');

-- Get the organization ID
DO $$
DECLARE
  org_id UUID;
BEGIN
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  -- Insert departments
  INSERT INTO departments (name, organization_id)
  VALUES 
    ('Executive', org_id),
    ('Technology', org_id),
    ('Engineering', org_id),
    ('Finance', org_id),
    ('Marketing', org_id),
    ('Human Resources', org_id);
    
  -- Continue with other sample data...
END $$;
*/

-- Create views for easier data access
CREATE OR REPLACE VIEW org_chart_view AS
SELECT 
  p.id,
  p.name,
  p.role,
  p.email,
  p.phone,
  p.location,
  p.timezone,
  p.bio,
  p.image,
  p.responsibilities,
  d.name AS department,
  p.organization_id,
  o.name AS organization_name,
  rr.manager_id
FROM 
  people p
JOIN 
  departments d ON p.department_id = d.id
JOIN 
  organizations o ON p.organization_id = o.id
LEFT JOIN 
  reporting_relationships rr ON p.id = rr.report_id;

-- Create function to get org chart hierarchy
CREATE OR REPLACE FUNCTION get_org_chart(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  WITH RECURSIVE org_tree AS (
    -- Find root nodes (people without managers)
    SELECT 
      p.id,
      p.name,
      p.role,
      d.name AS department,
      p.email,
      p.image,
      p.bio,
      p.responsibilities,
      0 AS level
    FROM 
      people p
    JOIN 
      departments d ON p.department_id = d.id
    LEFT JOIN 
      reporting_relationships rr ON p.id = rr.report_id
    WHERE 
      p.organization_id = org_id AND rr.id IS NULL
    
    UNION ALL
    
    -- Find children recursively
    SELECT 
      p.id,
      p.name,
      p.role,
      d.name AS department,
      p.email,
      p.image,
      p.bio,
      p.responsibilities,
      ot.level + 1
    FROM 
      people p
    JOIN 
      departments d ON p.department_id = d.id
    JOIN 
      reporting_relationships rr ON p.id = rr.report_id
    JOIN 
      org_tree ot ON rr.manager_id = ot.id
    WHERE 
      p.organization_id = org_id
  )
  SELECT 
    jsonb_build_object(
      'id', root.id,
      'name', root.name,
      'role', root.role,
      'department', root.department,
      'email', root.email,
      'image', root.image,
      'bio', root.bio,
      'responsibilities', CASE WHEN root.responsibilities IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(root.responsibilities) END,
      'children', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'id', child.id,
            'name', child.name,
            'role', child.role,
            'department', child.department,
            'email', child.email,
            'image', child.image,
            'bio', child.bio,
            'responsibilities', CASE WHEN child.responsibilities IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(child.responsibilities) END,
            'children', get_children(child.id)
          )
        )
        FROM org_tree child
        JOIN reporting_relationships rr ON child.id = rr.report_id
        WHERE rr.manager_id = root.id),
        '[]'::jsonb
      )
    ) INTO result
  FROM 
    org_tree root
  WHERE 
    root.level = 0
  LIMIT 1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get children recursively
CREATE OR REPLACE FUNCTION get_children(parent_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'role', p.role,
          'department', d.name,
          'email', p.email,
          'image', p.image,
          'bio', p.bio,
          'responsibilities', CASE WHEN p.responsibilities IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(p.responsibilities) END,
          'children', get_children(p.id)
        )
      ),
      '[]'::jsonb
    ) INTO result
  FROM 
    people p
  JOIN 
    departments d ON p.department_id = d.id
  JOIN 
    reporting_relationships rr ON p.id = rr.report_id
  WHERE 
    rr.manager_id = parent_id;
    
  RETURN result;
END;
$$ LANGUAGE plpgsql;
