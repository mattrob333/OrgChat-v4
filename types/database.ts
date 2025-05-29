export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ai_settings: {
        Row: {
          id: string
          person_id: string
          model: string
          temperature: number
          max_tokens: number
          top_p: number
          frequency_penalty: number
          presence_penalty: number
          system_prompt: string | null
          persona: 'professional' | 'friendly' | 'technical' | 'concise'
          knowledge_level: 'basic' | 'intermediate' | 'expert'
          response_style: 'formal' | 'casual' | 'balanced'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          model?: string
          temperature?: number
          max_tokens?: number
          top_p?: number
          frequency_penalty?: number
          presence_penalty?: number
          system_prompt?: string | null
          persona?: 'professional' | 'friendly' | 'technical' | 'concise'
          knowledge_level?: 'basic' | 'intermediate' | 'expert'
          response_style?: 'formal' | 'casual' | 'balanced'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          model?: string
          temperature?: number
          max_tokens?: number
          top_p?: number
          frequency_penalty?: number
          presence_penalty?: number
          system_prompt?: string | null
          persona?: 'professional' | 'friendly' | 'technical' | 'concise'
          knowledge_level?: 'basic' | 'intermediate' | 'expert'
          response_style?: 'formal' | 'casual' | 'balanced'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_settings_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_connections: {
        Row: {
          id: string
          person_id: string
          name: string
          type: 'google' | 'outlook' | 'apple' | 'other'
          email: string
          connected: boolean
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          name: string
          type: 'google' | 'outlook' | 'apple' | 'other'
          email: string
          connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          name?: string
          type?: 'google' | 'outlook' | 'apple' | 'other'
          email?: string
          connected?: boolean
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_connections_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_events: {
        Row: {
          id: string
          calendar_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          location: string | null
          is_all_day: boolean
          attendees: Json | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          calendar_id: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          location?: string | null
          is_all_day?: boolean
          attendees?: Json | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          calendar_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          is_all_day?: boolean
          attendees?: Json | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_calendar_id_fkey"
            columns: ["calendar_id"]
            referencedRelation: "calendar_connections"
            referencedColumns: ["id"]
          }
        ]
      }
      calendar_settings: {
        Row: {
          id: string
          person_id: string
          show_meeting_details: boolean
          show_attendees: boolean
          show_private_events: boolean
          show_declined_events: boolean
          buffer_time: number
          max_meetings_per_day: number | null
          preferred_meeting_length: number
          minimum_scheduling_notice: string
          meeting_types: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          show_meeting_details?: boolean
          show_attendees?: boolean
          show_private_events?: boolean
          show_declined_events?: boolean
          buffer_time?: number
          max_meetings_per_day?: number | null
          preferred_meeting_length?: number
          minimum_scheduling_notice?: string
          meeting_types?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          show_meeting_details?: boolean
          show_attendees?: boolean
          show_private_events?: boolean
          show_declined_events?: boolean
          buffer_time?: number
          max_meetings_per_day?: number | null
          preferred_meeting_length?: number
          minimum_scheduling_notice?: string
          meeting_types?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_settings_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      communication_preferences: {
        Row: {
          id: string
          person_id: string
          email_notifications: boolean
          in_app_notifications: boolean
          sms_notifications: boolean
          meeting_reminders: boolean
          task_reminders: boolean
          mention_notifications: boolean
          team_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          sms_notifications?: boolean
          meeting_reminders?: boolean
          task_reminders?: boolean
          mention_notifications?: boolean
          team_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          email_notifications?: boolean
          in_app_notifications?: boolean
          sms_notifications?: boolean
          meeting_reminders?: boolean
          task_reminders?: boolean
          mention_notifications?: boolean
          team_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_preferences_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      departments: {
        Row: {
          id: string
          name: string
          organization_id: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          person_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          description: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          person_id: string
          name: string
          file_path: string
          file_type: string
          file_size: number
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          description?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          id: string
          name: string
          role: string
          department_id: string
          email: string
          phone: string | null
          location: string | null
          timezone: string | null
          bio: string | null
          image: string | null
          responsibilities: string[] | null
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          department_id: string
          email: string
          phone?: string | null
          location?: string | null
          timezone?: string | null
          bio?: string | null
          image?: string | null
          responsibilities?: string[] | null
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          department_id?: string
          email?: string
          phone?: string | null
          location?: string | null
          timezone?: string | null
          bio?: string | null
          image?: string | null
          responsibilities?: string[] | null
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "people_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      reporting_relationships: {
        Row: {
          id: string
          manager_id: string
          report_id: string
          organization_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          report_id: string
          organization_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          report_id?: string
          organization_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporting_relationships_manager_id_fkey"
            columns: ["manager_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_relationships_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_relationships_report_id_fkey"
            columns: ["report_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'not-started' | 'in-progress' | 'completed'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          category: string
          person_id: string
          assignee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'not-started' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          category: string
          person_id: string
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'not-started' | 'in-progress' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          category?: string
          person_id?: string
          assignee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_person_id_fkey"
            columns: ["person_id"]
            referencedRelation: "people"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access to tables
export type Person = Database['public']['Tables']['people']['Row']
export type PersonInsert = Database['public']['Tables']['people']['Insert']
export type PersonUpdate = Database['public']['Tables']['people']['Update']

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Department = Database['public']['Tables']['departments']['Row']
export type ReportingRelationship = Database['public']['Tables']['reporting_relationships']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type AISettings = Database['public']['Tables']['ai_settings']['Row']
export type CalendarConnection = Database['public']['Tables']['calendar_connections']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type CalendarSettings = Database['public']['Tables']['calendar_settings']['Row']
export type CommunicationPreferences = Database['public']['Tables']['communication_preferences']['Row']
export type Document = Database['public']['Tables']['documents']['Row']

// Type for hierarchical org chart data
export interface OrgChartPerson extends Omit<Person, 'department_id'> {
  department: string
  children?: OrgChartPerson[]
}
