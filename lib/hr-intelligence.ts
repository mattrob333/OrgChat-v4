import { createServerSupabaseClient } from '@/lib/supabase'
import { Person, Department, Document, ReportingRelationship } from '@/types/database'

// Enneagram compatibility matrix
const ENNEAGRAM_COMPATIBILITY = {
  '1': { // The Perfectionist
    name: 'The Perfectionist',
    strengths: ['Detail-oriented', 'Ethical', 'Reliable'],
    challenges: ['Critical', 'Inflexible'],
    motivations: ['Doing things right', 'Improvement'],
    communication: 'Be precise, acknowledge their standards',
    worksBestWith: ['7', '2', '9'],
    challengesWith: ['4', '8']
  },
  '2': { // The Helper
    name: 'The Helper',
    strengths: ['Caring', 'Interpersonal', 'Generous'],
    challenges: ['People-pleasing', 'Intrusive'],
    motivations: ['Being needed', 'Helping others'],
    communication: 'Appreciate their contributions, be warm',
    worksBestWith: ['8', '4', '1'],
    challengesWith: ['5', '8']
  },
  '3': { // The Achiever
    name: 'The Achiever',
    strengths: ['Driven', 'Adaptable', 'Efficient'],
    challenges: ['Workaholic', 'Image-conscious'],
    motivations: ['Success', 'Recognition'],
    communication: 'Focus on goals and achievements',
    worksBestWith: ['6', '9', '1'],
    challengesWith: ['9', '4']
  },
  '4': { // The Individualist
    name: 'The Individualist',
    strengths: ['Creative', 'Authentic', 'Deep'],
    challenges: ['Moody', 'Self-absorbed'],
    motivations: ['Uniqueness', 'Self-expression'],
    communication: 'Acknowledge their uniqueness, be authentic',
    worksBestWith: ['5', '2', '9'],
    challengesWith: ['1', '3']
  },
  '5': { // The Investigator
    name: 'The Investigator',
    strengths: ['Analytical', 'Independent', 'Innovative'],
    challenges: ['Detached', 'Secretive'],
    motivations: ['Knowledge', 'Understanding'],
    communication: 'Be logical, respect their space',
    worksBestWith: ['4', '7', '1'],
    challengesWith: ['2', '6']
  },
  '6': { // The Loyalist
    name: 'The Loyalist',
    strengths: ['Responsible', 'Trustworthy', 'Team-oriented'],
    challenges: ['Anxious', 'Suspicious'],
    motivations: ['Security', 'Support'],
    communication: 'Be consistent, provide reassurance',
    worksBestWith: ['3', '9', '1'],
    challengesWith: ['7', '5']
  },
  '7': { // The Enthusiast
    name: 'The Enthusiast',
    strengths: ['Optimistic', 'Versatile', 'Spontaneous'],
    challenges: ['Scattered', 'Impulsive'],
    motivations: ['Freedom', 'Happiness'],
    communication: 'Be positive, keep things interesting',
    worksBestWith: ['1', '5', '8'],
    challengesWith: ['6', '1']
  },
  '8': { // The Challenger
    name: 'The Challenger',
    strengths: ['Decisive', 'Protective', 'Confident'],
    challenges: ['Confrontational', 'Domineering'],
    motivations: ['Control', 'Justice'],
    communication: 'Be direct, show strength',
    worksBestWith: ['2', '9', '7'],
    challengesWith: ['1', '8']
  },
  '9': { // The Peacemaker
    name: 'The Peacemaker',
    strengths: ['Accepting', 'Stable', 'Supportive'],
    challenges: ['Passive', 'Indecisive'],
    motivations: ['Harmony', 'Peace'],
    communication: 'Be inclusive, avoid conflict',
    worksBestWith: ['3', '6', '1'],
    challengesWith: ['3', '8']
  }
}

export class HRIntelligence {
  // ========== PEOPLE QUERIES ==========
  
  async getPersonById(id: string): Promise<Person | null> {
    console.log('Searching for person by ID:', id);
    
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error searching for person by ID:', error);
        return null;
      }
      
      console.log('Found person:', data.name, data.role);
      return data;
    } catch (error) {
      console.error('Error in getPersonById:', error);
      return null;
    }
  }

  async getEmployeeByName(name: string): Promise<Person | null> {
    console.log('Searching for employee by name:', name);
    
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .ilike('name', `%${name}%`);
      
      if (error) {
        console.error('Error searching for employee:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('No employee found with name:', name);
        return null;
      }
      
      // Return the first match
      const person = data[0];
      console.log('Found employee:', person.name, person.role);
      return person;
    } catch (error) {
      console.error('Error in getEmployeeByName:', error);
      return null;
    }
  }

  async getEmployeeByEmail(email: string): Promise<Person | null> {
    console.log('Searching for employee by email:', email)
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) {
        console.error('Error searching for employee by email:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getEmployeeByEmail:', error)
      return null
    }
  }

  async getEmployeesByDepartment(departmentName: string): Promise<Person[]> {
    console.log('Searching for employees by department:', departmentName)
    try {
      const supabase = createServerSupabaseClient()
      // First get the department
      const { data: department } = await supabase
        .from('departments')
        .select('id')
        .ilike('name', `%${departmentName}%`)
        .single()
      
      if (!department) {
        return []
      }
      
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('department_id', department.id)
      
      if (error) {
        console.error('Error searching for employees by department:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getEmployeesByDepartment:', error)
      return []
    }
  }

  async getEmployeesByRole(role: string): Promise<Person[]> {
    console.log('Searching for employees by role:', role)
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .ilike('role', `%${role}%`)
      
      if (error) {
        console.error('Error searching for employees by role:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getEmployeesByRole:', error)
      return []
    }
  }

  async getEmployeesByEnneagramType(type: string): Promise<Person[]> {
    console.log('Searching for employees by enneagram type:', type)
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('enneagram_type', type)
      
      if (error) {
        console.error('Error searching for employees by enneagram type:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getEmployeesByEnneagramType:', error)
      return []
    }
  }

  // ========== RELATIONSHIP QUERIES ==========
  
  async getManagerForEmployee(employeeId: string): Promise<Person | null> {
    console.log('Searching for manager for employee:', employeeId)
    try {
      const supabase = createServerSupabaseClient()
      const { data: relationship } = await supabase
        .from('reporting_relationships')
        .select('manager_id')
        .eq('report_id', employeeId)
        .single()
      
      if (!relationship) {
        return null
      }
      
      const { data: manager } = await supabase
        .from('people')
        .select('*')
        .eq('id', relationship.manager_id)
        .single()
      
      return manager
    } catch (error) {
      console.error('Error in getManagerForEmployee:', error)
      return null
    }
  }

  async getDirectReports(managerId: string): Promise<Person[]> {
    console.log('Searching for direct reports for manager:', managerId)
    try {
      const supabase = createServerSupabaseClient()
      const { data: relationships } = await supabase
        .from('reporting_relationships')
        .select('report_id')
        .eq('manager_id', managerId)
      
      if (!relationships || relationships.length === 0) {
        return []
      }
      
      const reportIds = relationships.map((r: any) => r.report_id)
      
      const { data: reports } = await supabase
        .from('people')
        .select('*')
        .in('id', reportIds)
      
      return reports || []
    } catch (error) {
      console.error('Error in getDirectReports:', error)
      return []
    }
  }

  async getTeamHierarchy(managerId: string): Promise<Person[]> {
    console.log('Searching for team hierarchy for manager:', managerId)
    try {
      const supabase = createServerSupabaseClient()
      const team: Person[] = []
      const visited = new Set<string>()
      
      const getReportsRecursive = async (id: string): Promise<void> => {
        if (visited.has(id)) return
        visited.add(id)
        
        const reports = await this.getDirectReports(id)
        team.push(...reports)
        
        for (const report of reports) {
          await getReportsRecursive(report.id)
        }
      }
      
      await getReportsRecursive(managerId)
      console.log('Found team hierarchy:', team)
      return team
    } catch (e) {
      console.error('Exception in getTeamHierarchy:', e)
      return []
    }
  }

  async getDelegationChain(employeeId: string): Promise<Person[]> {
    console.log('Searching for delegation chain for employee:', employeeId)
    try {
      const supabase = createServerSupabaseClient()
      const chain: Person[] = []
      let currentId = employeeId
      
      // Get the employee first
      const employee = await this.getEmployeeByEmail(employeeId)
      if (employee) chain.push(employee)
      
      // Walk up the chain
      while (currentId) {
        const manager = await this.getManagerForEmployee(currentId)
        if (!manager) break
        chain.push(manager)
        currentId = manager.id
      }
      
      console.log('Found delegation chain:', chain)
      return chain
    } catch (e) {
      console.error('Exception in getDelegationChain:', e)
      return []
    }
  }

  // ========== DOCUMENT QUERIES ==========
  
  async searchDocuments(query: string, filters?: {
    department?: string
    type?: string
    tags?: string[]
  }): Promise<Document[]> {
    console.log('Searching for documents:', query)
    try {
      const supabase = createServerSupabaseClient()
      let queryBuilder = supabase
        .from('documents')
        .select('*')
      
      // Add search condition
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }
      
      // Add filters
      if (filters?.type) {
        queryBuilder = queryBuilder.eq('file_type', filters.type)
      }
      
      const { data, error } = await queryBuilder.order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error searching documents:', error)
        return []
      }
      
      console.log('Found documents:', data)
      return data || []
    } catch (e) {
      console.error('Exception in searchDocuments:', e)
      return []
    }
  }

  async getAccessibleDocuments(personId: string): Promise<Document[]> {
    console.log('Searching for accessible documents for person:', personId)
    try {
      const supabase = createServerSupabaseClient()
      // Get the person's details to check department
      const person = await this.getEmployeeByEmail(personId)
      if (!person) {
        console.log('Person not found:', personId)
        return []
      }
      
      // For now, return all public documents
      // In the future, we'll add department-based access control
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching accessible documents:', error)
        return []
      }
      
      console.log('Found accessible documents:', data)
      return data || []
    } catch (e) {
      console.error('Exception in getAccessibleDocuments:', e)
      return []
    }
  }

  // ========== ENNEAGRAM ANALYSIS ==========
  
  getEnneagramProfile(type: string) {
    console.log('Getting enneagram profile for type:', type)
    try {
      return ENNEAGRAM_COMPATIBILITY[type as keyof typeof ENNEAGRAM_COMPATIBILITY] || null
    } catch (e) {
      console.error('Exception in getEnneagramProfile:', e)
      return null
    }
  }

  async analyzeTeamCompatibility(employeeIds: string[]): Promise<{
    compatibility: number
    strengths: string[]
    challenges: string[]
    recommendations: string[]
  }> {
    console.log('Analyzing team compatibility for employees:', employeeIds)
    try {
      const supabase = createServerSupabaseClient()
      // Get all employees
      const { data: employees } = await supabase
        .from('people')
        .select('*')
        .in('id', employeeIds)
      
      if (!employees || employees.length === 0) {
        console.log('No employees found:', employeeIds)
        return {
          compatibility: 0,
          strengths: [],
          challenges: [],
          recommendations: []
        }
      }
      
      // Analyze enneagram types
      const types = employees.map(e => e.enneagram_type).filter(Boolean)
      const strengths: string[] = []
      const challenges: string[] = []
      const recommendations: string[] = []
      let compatibilityScore = 0
      let comparisons = 0
      
      // Check each pair
      for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
          const type1 = types[i]
          const type2 = types[j]
          
          if (!type1 || !type2) continue
          
          const profile1 = this.getEnneagramProfile(type1)
          const profile2 = this.getEnneagramProfile(type2)
          
          if (!profile1 || !profile2) continue
          
          comparisons++
          
          // Check if they work well together
          const compatibility = profile1.worksBestWith.includes(type2)
          if (compatibility) {
            compatibilityScore++
          }
          
          // Add specific insights
          if (profile1.challengesWith.includes(type2)) {
            challenges.push(`${employees[i].name} (Type ${type1}) may have challenges working with ${employees[j].name} (Type ${type2})`)
          }
        }
      }
      
      // Calculate overall score
      const overallScore = comparisons > 0 ? Math.round((compatibilityScore / comparisons) * 100) : 0
      
      // Add recommendations based on team composition
      if (types.includes('8') && types.includes('2')) {
        recommendations.push('The combination of Type 8 (Leader) and Type 2 (Helper) can be very effective')
      }
      
      return {
        compatibility: overallScore,
        strengths,
        challenges,
        recommendations
      }
    } catch (error: any) {
      console.error('Exception in analyzeTeamCompatibility:', error)
      return {
        compatibility: 0,
        strengths: [],
        challenges: ['Error analyzing team compatibility'],
        recommendations: []
      }
    }
  }

  async getCompatibleTeamMembers(employeeId: string, projectType?: string): Promise<Person[]> {
    console.log('Searching for compatible team members for employee:', employeeId)
    try {
      const supabase = createServerSupabaseClient()
      const employee = await this.getEmployeeByEmail(employeeId)
      if (!employee || !employee.enneagram_type) {
        console.log('Employee not found or no enneagram type:', employeeId)
        return []
      }
      
      const profile = this.getEnneagramProfile(employee.enneagram_type)
      if (!profile) {
        console.log('Enneagram profile not found:', employee.enneagram_type)
        return []
      }
      
      // Get employees with compatible types
      const compatibleEmployees: Person[] = []
      
      for (const compatibleType of profile.worksBestWith) {
        const employees = await this.getEmployeesByEnneagramType(compatibleType)
        compatibleEmployees.push(...employees)
      }
      
      // Filter out the original employee
      console.log('Found compatible team members:', compatibleEmployees.filter(e => e.id !== employeeId))
      return compatibleEmployees.filter(e => e.id !== employeeId)
    } catch (e) {
      console.error('Exception in getCompatibleTeamMembers:', e)
      return []
    }
  }

  // ========== SEARCH UTILITIES ==========
  
  async searchEmployees(query: string): Promise<Person[]> {
    console.log('Searching for employees:', query)
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,role.ilike.%${query}%`)
        .order('name')
      
      if (error) {
        console.error('Error searching employees:', error)
        return []
      }
      
      console.log('Found employees:', data)
      return data || []
    } catch (e) {
      console.error('Exception in searchEmployees:', e)
      return []
    }
  }

  async getEmployeesWithSkill(skill: string): Promise<Person[]> {
    console.log('Searching for employees with skill:', skill)
    try {
      const supabase = createServerSupabaseClient()
      // Search in responsibilities array
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .contains('responsibilities', [skill])
        .order('name')
      
      if (error) {
        // Fallback to searching in bio and role
        const { data: fallbackData } = await supabase
          .from('people')
          .select('*')
          .or(`bio.ilike.%${skill}%,role.ilike.%${skill}%`)
          .order('name')
        
        console.log('Found employees with skill:', fallbackData)
        return fallbackData || []
      }
      
      console.log('Found employees with skill:', data)
      return data || []
    } catch (e) {
      console.error('Exception in getEmployeesWithSkill:', e)
      return []
    }
  }

  async getEmployeesByLocation(location: string): Promise<Person[]> {
    console.log('Searching for employees by location:', location)
    try {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .ilike('location', `%${location}%`)
        .order('name')
      
      if (error) {
        console.error('Error fetching employees by location:', error)
        return []
      }
      
      console.log('Found employees by location:', data)
      return data || []
    } catch (e) {
      console.error('Exception in getEmployeesByLocation:', e)
      return []
    }
  }
}

// Export a singleton instance
export const hrIntelligence = new HRIntelligence()

// Export convenience functions
export const getPersonById = (id: string) => hrIntelligence.getPersonById(id)
export const getEmployeeByName = (name: string) => hrIntelligence.getEmployeeByName(name)
export const getEmployeeByEmail = (email: string) => hrIntelligence.getEmployeeByEmail(email)
