import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Person, Department, Organization, OrgChartPerson, Task, AISettings, CalendarConnection, CalendarSettings, CommunicationPreferences, Document } from '@/types/database'

// Cache for organization data to improve performance
const cache = {
  orgChart: new Map<string, OrgChartPerson>(),
  people: new Map<string, Person>(),
  departments: new Map<string, Department>(),
  lastFetched: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache TTL
}

/**
 * Clear the cache
 */
export function clearCache() {
  cache.orgChart.clear()
  cache.people.clear()
  cache.departments.clear()
  cache.lastFetched = 0
}

/**
 * Check if cache is valid
 */
function isCacheValid() {
  return cache.lastFetched > 0 && Date.now() - cache.lastFetched < cache.ttl
}

/**
 * Get all organizations
 */
export async function getOrganizations(): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return []
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching organization with ID ${id}:`, error)
    return null
  }
}

/**
 * Get all departments for an organization
 */
export async function getDepartments(organizationId: string): Promise<Department[]> {
  try {
    // Check cache first
    if (isCacheValid() && cache.departments.size > 0) {
      return Array.from(cache.departments.values())
        .filter(dept => dept.organization_id === organizationId)
    }

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error

    // Update cache
    if (data) {
      data.forEach(dept => cache.departments.set(dept.id, dept))
    }

    return data || []
  } catch (error) {
    console.error(`Error fetching departments for organization ${organizationId}:`, error)
    return []
  }
}

/**
 * Get all people for an organization with their department names
 */
export async function getPeopleWithDepartments(organizationId: string): Promise<(Person & { department: string })[]> {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        departments:department_id (
          name
        )
      `)
      .eq('organization_id', organizationId)
      .order('name')

    if (error) throw error

    // Transform data to include department name directly
    return (data || []).map(person => ({
      ...person,
      department: person.departments?.name || 'Unknown'
    }))
  } catch (error) {
    console.error(`Error fetching people for organization ${organizationId}:`, error)
    return []
  }
}

/**
 * Get person by ID with all related information
 */
export async function getPersonWithDetails(personId: string): Promise<{
  person: (Person & { department: string }) | null,
  aiSettings: AISettings | null,
  calendarConnections: CalendarConnection[],
  calendarSettings: CalendarSettings | null,
  communicationPreferences: CommunicationPreferences | null,
  tasks: Task[],
  documents: Document[],
  directReports: Person[]
}> {
  try {
    // Get person with department
    const { data: personData, error: personError } = await supabase
      .from('people')
      .select(`
        *,
        departments:department_id (
          name
        )
      `)
      .eq('id', personId)
      .single()

    if (personError) throw personError

    const person = personData ? {
      ...personData,
      department: personData.departments?.name || 'Unknown'
    } : null

    // Get AI settings
    const { data: aiSettingsData, error: aiSettingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (aiSettingsError) throw aiSettingsError

    // Get calendar connections
    const { data: calendarConnectionsData, error: calendarConnectionsError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('person_id', personId)

    if (calendarConnectionsError) throw calendarConnectionsError

    // Get calendar settings
    const { data: calendarSettingsData, error: calendarSettingsError } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (calendarSettingsError) throw calendarSettingsError

    // Get communication preferences
    const { data: commPrefsData, error: commPrefsError } = await supabase
      .from('communication_preferences')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (commPrefsError) throw commPrefsError

    // Get tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('person_id', personId)
      .order('due_date', { ascending: true })

    if (tasksError) throw tasksError

    // Get documents
    const { data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })

    if (documentsError) throw documentsError

    // Get direct reports
    const { data: relationshipsData, error: relationshipsError } = await supabase
      .from('reporting_relationships')
      .select(`
        report_id,
        reports:report_id (*)
      `)
      .eq('manager_id', personId)

    if (relationshipsError) throw relationshipsError

    const directReports = relationshipsData 
      ? relationshipsData.map(rel => rel.reports as Person).filter(Boolean)
      : []

    return {
      person,
      aiSettings: aiSettingsData,
      calendarConnections: calendarConnectionsData || [],
      calendarSettings: calendarSettingsData,
      communicationPreferences: commPrefsData,
      tasks: tasksData || [],
      documents: documentsData || [],
      directReports
    }
  } catch (error) {
    console.error(`Error fetching details for person ${personId}:`, error)
    return {
      person: null,
      aiSettings: null,
      calendarConnections: [],
      calendarSettings: null,
      communicationPreferences: null,
      tasks: [],
      documents: [],
      directReports: []
    }
  }
}

/**
 * Get organization chart data for an organization
 */
export async function getOrgChartData(organizationId: string): Promise<OrgChartPerson | null> {
  try {
    // Check cache first
    if (isCacheValid() && cache.orgChart.has(organizationId)) {
      return cache.orgChart.get(organizationId) || null
    }

    // Get all people with departments
    const people = await getPeopleWithDepartments(organizationId)
    
    // Get all reporting relationships
    const { data: relationships, error: relError } = await supabase
      .from('reporting_relationships')
      .select('*')
      .eq('organization_id', organizationId)

    if (relError) throw relError

    // Create a map of people by ID
    const peopleMap = new Map<string, Person & { department: string }>(
      people.map(person => [person.id, person])
    )

    // Create a map of reports by manager ID
    const reportsByManager = new Map<string, string[]>()
    relationships?.forEach(rel => {
      if (!reportsByManager.has(rel.manager_id)) {
        reportsByManager.set(rel.manager_id, [])
      }
      reportsByManager.get(rel.manager_id)?.push(rel.report_id)
    })

    // Find the root person (CEO or person without a manager)
    const reportIds = new Set(relationships?.map(rel => rel.report_id) || [])
    const rootCandidates = people.filter(p => !reportIds.has(p.id))
    
    if (rootCandidates.length === 0) {
      throw new Error('Could not find root person in organization chart')
    }

    // Use the first root candidate (usually the CEO)
    const rootPerson = rootCandidates[0]

    // Build the tree recursively
    const buildTree = (personId: string): OrgChartPerson | null => {
      const person = peopleMap.get(personId)
      if (!person) return null

      const reports = reportsByManager.get(personId) || []
      const children = reports
        .map(reportId => buildTree(reportId))
        .filter(Boolean) as OrgChartPerson[]

      return {
        ...person,
        children: children.length > 0 ? children : undefined
      }
    }

    const orgChart = buildTree(rootPerson.id)
    
    // Update cache
    if (orgChart) {
      cache.orgChart.set(organizationId, orgChart)
      cache.lastFetched = Date.now()
    }

    return orgChart
  } catch (error) {
    console.error(`Error building org chart for organization ${organizationId}:`, error)
    return null
  }
}

/**
 * Create or update a person
 */
export async function upsertPerson(
  person: Omit<Person, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<Person | null> {
  try {
    const now = new Date().toISOString()
    
    if (person.id) {
      // Update existing person
      const { data, error } = await supabase
        .from('people')
        .update({
          ...person,
          updated_at: now
        })
        .eq('id', person.id)
        .select()
        .single()

      if (error) throw error
      
      // Invalidate cache
      clearCache()
      
      return data
    } else {
      // Create new person
      const { data, error } = await supabase
        .from('people')
        .insert({
          ...person,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      
      // Invalidate cache
      clearCache()
      
      return data
    }
  } catch (error) {
    console.error('Error upserting person:', error)
    return null
  }
}

/**
 * Create or update a reporting relationship
 */
export async function upsertReportingRelationship(
  managerId: string,
  reportId: string,
  organizationId: string
): Promise<boolean> {
  try {
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('reporting_relationships')
      .select('id')
      .eq('manager_id', managerId)
      .eq('report_id', reportId)
      .maybeSingle()

    if (checkError) throw checkError

    const now = new Date().toISOString()

    if (existing) {
      // Update existing relationship
      const { error } = await supabase
        .from('reporting_relationships')
        .update({
          updated_at: now
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Create new relationship
      const { error } = await supabase
        .from('reporting_relationships')
        .insert({
          manager_id: managerId,
          report_id: reportId,
          organization_id: organizationId,
          created_at: now,
          updated_at: now
        })

      if (error) throw error
    }

    // Invalidate cache
    clearCache()
    
    return true
  } catch (error) {
    console.error('Error upserting reporting relationship:', error)
    return false
  }
}

/**
 * Delete a reporting relationship
 */
export async function deleteReportingRelationship(
  managerId: string,
  reportId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reporting_relationships')
      .delete()
      .eq('manager_id', managerId)
      .eq('report_id', reportId)

    if (error) throw error
    
    // Invalidate cache
    clearCache()
    
    return true
  } catch (error) {
    console.error('Error deleting reporting relationship:', error)
    return false
  }
}

/**
 * Get all tasks for a person
 */
export async function getPersonTasks(personId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('person_id', personId)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching tasks for person ${personId}:`, error)
    return []
  }
}

/**
 * Create or update a task
 */
export async function upsertTask(
  task: Omit<Task, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<Task | null> {
  try {
    const now = new Date().toISOString()
    
    if (task.id) {
      // Update existing task
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...task,
          updated_at: now
        })
        .eq('id', task.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new task
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error upserting task:', error)
    return null
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error)
    return false
  }
}

/**
 * Get AI settings for a person
 */
export async function getAISettings(personId: string): Promise<AISettings | null> {
  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching AI settings for person ${personId}:`, error)
    return null
  }
}

/**
 * Upsert AI settings for a person
 */
export async function upsertAISettings(
  settings: Omit<AISettings, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<AISettings | null> {
  try {
    const now = new Date().toISOString()
    
    if (settings.id) {
      // Update existing settings
      const { data, error } = await supabase
        .from('ai_settings')
        .update({
          ...settings,
          updated_at: now
        })
        .eq('id', settings.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('ai_settings')
        .insert({
          ...settings,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error upserting AI settings:', error)
    return null
  }
}

/**
 * Get calendar connections for a person
 */
export async function getCalendarConnections(personId: string): Promise<CalendarConnection[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('person_id', personId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching calendar connections for person ${personId}:`, error)
    return []
  }
}

/**
 * Create or update a calendar connection
 */
export async function upsertCalendarConnection(
  connection: Omit<CalendarConnection, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<CalendarConnection | null> {
  try {
    const now = new Date().toISOString()
    
    if (connection.id) {
      // Update existing connection
      const { data, error } = await supabase
        .from('calendar_connections')
        .update({
          ...connection,
          updated_at: now
        })
        .eq('id', connection.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from('calendar_connections')
        .insert({
          ...connection,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error upserting calendar connection:', error)
    return null
  }
}

/**
 * Get calendar events for a specific calendar
 */
export async function getCalendarEvents(calendarId: string): Promise<CalendarEvent[]> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('calendar_id', calendarId)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching calendar events for calendar ${calendarId}:`, error)
    return []
  }
}

/**
 * Get calendar settings for a person
 */
export async function getCalendarSettings(personId: string): Promise<CalendarSettings | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching calendar settings for person ${personId}:`, error)
    return null
  }
}

/**
 * Upsert calendar settings for a person
 */
export async function upsertCalendarSettings(
  settings: Omit<CalendarSettings, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<CalendarSettings | null> {
  try {
    const now = new Date().toISOString()
    
    if (settings.id) {
      // Update existing settings
      const { data, error } = await supabase
        .from('calendar_settings')
        .update({
          ...settings,
          updated_at: now
        })
        .eq('id', settings.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('calendar_settings')
        .insert({
          ...settings,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error upserting calendar settings:', error)
    return null
  }
}

/**
 * Get documents for a person
 */
export async function getDocuments(personId: string): Promise<Document[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error fetching documents for person ${personId}:`, error)
    return []
  }
}

/**
 * Create a document record
 */
export async function createDocument(
  document: Omit<Document, 'id' | 'created_at' | 'updated_at'>
): Promise<Document | null> {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating document:', error)
    return null
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    // First get the document to get the file path
    const { data: document, error: getError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (getError) throw getError

    if (document) {
      // Delete the file from storage
      const { error: storageError } = await supabase
        .storage
        .from('documents')
        .remove([document.file_path])

      if (storageError) {
        console.error(`Error deleting file from storage: ${storageError.message}`)
      }

      // Delete the document record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error
    }

    return true
  } catch (error) {
    console.error(`Error deleting document ${documentId}:`, error)
    return false
  }
}

/**
 * Get communication preferences for a person
 */
export async function getCommunicationPreferences(personId: string): Promise<CommunicationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('communication_preferences')
      .select('*')
      .eq('person_id', personId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching communication preferences for person ${personId}:`, error)
    return null
  }
}

/**
 * Upsert communication preferences for a person
 */
export async function upsertCommunicationPreferences(
  preferences: Omit<CommunicationPreferences, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<CommunicationPreferences | null> {
  try {
    const now = new Date().toISOString()
    
    if (preferences.id) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('communication_preferences')
        .update({
          ...preferences,
          updated_at: now
        })
        .eq('id', preferences.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('communication_preferences')
        .insert({
          ...preferences,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error upserting communication preferences:', error)
    return null
  }
}
