import { hrIntelligence } from './hr-intelligence'
import { intentDetector, IntentResult } from './intent-detector'
import { Person, Document, Department } from '@/types/database'

export interface EnrichedContext {
  people: Person[]
  relationships: {
    person: Person
    manager?: Person
    directReports: Person[]
  }[]
  documents: Document[]
  enneagramInsights: {
    profiles: Record<string, any>
    teamCompatibility?: {
      compatibility: number
      strengths: string[]
      challenges: string[]
      recommendations: string[]
    }
  }
  departments: Department[]
  recommendations: string[]
  summary: string
}

export class ContextBuilder {
  async buildContext(prompt: string): Promise<EnrichedContext> {
    // Detect intent
    const intent = intentDetector.detectIntent(prompt)
    
    // Initialize context
    const context: EnrichedContext = {
      people: [],
      relationships: [],
      documents: [],
      enneagramInsights: {
        profiles: {}
      },
      departments: [],
      recommendations: [],
      summary: ''
    }

    // Build context based on intent and entities
    if (intent.queryType.needsPeopleData) {
      await this.fetchPeopleData(intent, context)
    }

    if (intent.queryType.needsRelationshipData) {
      await this.fetchRelationshipData(context)
    }

    if (intent.queryType.needsDocumentData) {
      await this.fetchDocumentData(intent, context)
    }

    if (intent.queryType.needsEnneagramData) {
      await this.enrichWithEnneagramData(context)
    }

    // Generate recommendations based on intent
    await this.generateRecommendations(intent, context)

    // Create summary
    context.summary = this.createContextSummary(intent, context)

    return context
  }

  private async fetchPeopleData(intent: IntentResult, context: EnrichedContext) {
    const people: Person[] = []

    // Fetch people mentioned by name
    for (const name of intent.entities.people) {
      const person = await hrIntelligence.getEmployeeByName(name)
      if (person) people.push(person)
    }

    // Fetch people by department
    for (const dept of intent.entities.departments) {
      const deptPeople = await hrIntelligence.getEmployeesByDepartment(dept)
      people.push(...deptPeople)
    }

    // Fetch people by skills
    for (const skill of intent.entities.skills) {
      const skillPeople = await hrIntelligence.getEmployeesWithSkill(skill)
      people.push(...skillPeople)
    }

    // Fetch people by location
    for (const location of intent.entities.locations) {
      const locationPeople = await hrIntelligence.getEmployeesByLocation(location)
      people.push(...locationPeople)
    }

    // Remove duplicates
    const uniquePeople = new Map<string, Person>()
    people.forEach(p => uniquePeople.set(p.id, p))
    context.people = Array.from(uniquePeople.values())
  }

  private async fetchRelationshipData(context: EnrichedContext) {
    for (const person of context.people) {
      const manager = await hrIntelligence.getManagerForEmployee(person.id)
      const directReports = await hrIntelligence.getDirectReports(person.id)
      
      context.relationships.push({
        person,
        manager: manager || undefined,
        directReports
      })
    }
  }

  private async fetchDocumentData(intent: IntentResult, context: EnrichedContext) {
    const documents: Document[] = []

    // Search for documents based on query
    if (intent.entities.documentTypes.length > 0) {
      for (const docType of intent.entities.documentTypes) {
        const docs = await hrIntelligence.searchDocuments(docType)
        documents.push(...docs)
      }
    }

    // If conflict resolution, look for relevant guides
    if (intent.primaryIntent === 'conflict_resolution') {
      const conflictDocs = await hrIntelligence.searchDocuments('conflict resolution')
      documents.push(...conflictDocs)
      
      const communicationDocs = await hrIntelligence.searchDocuments('communication')
      documents.push(...communicationDocs)
    }

    // If delegation, look for delegation guides
    if (intent.primaryIntent === 'delegation') {
      const delegationDocs = await hrIntelligence.searchDocuments('delegation')
      documents.push(...delegationDocs)
    }

    // Remove duplicates
    const uniqueDocs = new Map<string, Document>()
    documents.forEach(d => uniqueDocs.set(d.id, d))
    context.documents = Array.from(uniqueDocs.values())
  }

  private async enrichWithEnneagramData(context: EnrichedContext) {
    // Get profiles for all people
    for (const person of context.people) {
      if (person.enneagram_type) {
        const profile = hrIntelligence.getEnneagramProfile(person.enneagram_type)
        if (profile) {
          context.enneagramInsights.profiles[person.id] = {
            person,
            profile
          }
        }
      }
    }

    // If team composition, analyze compatibility
    if (context.people.length > 1) {
      const peopleIds = context.people.map(p => p.id)
      const compatibility = await hrIntelligence.analyzeTeamCompatibility(peopleIds)
      context.enneagramInsights.teamCompatibility = compatibility
    }
  }

  private async generateRecommendations(intent: IntentResult, context: EnrichedContext) {
    switch (intent.primaryIntent) {
      case 'team_composition':
        await this.generateTeamCompositionRecommendations(context)
        break
      case 'conflict_resolution':
        await this.generateConflictResolutionRecommendations(context)
        break
      case 'delegation':
        await this.generateDelegationRecommendations(context)
        break
      case 'department_overview':
        await this.generateDepartmentOverviewRecommendations(context)
        break
    }
  }

  private async generateTeamCompositionRecommendations(context: EnrichedContext) {
    if (context.enneagramInsights.teamCompatibility) {
      const { compatibility, strengths, challenges, recommendations } = context.enneagramInsights.teamCompatibility
      
      context.recommendations.push(
        `Team Compatibility Score: ${compatibility}%`,
        ...strengths.map(s => `✅ ${s}`),
        ...challenges.map(c => `⚠️ ${c}`),
        ...recommendations
      )
    }

    // Add role diversity recommendations
    const roles = new Set(context.people.map(p => p.role))
    if (roles.size < context.people.length * 0.7) {
      context.recommendations.push('Consider adding more role diversity to the team')
    }

    // Add location recommendations
    const locations = new Set(context.people.map(p => p.location).filter(Boolean))
    if (locations.size > 1) {
      context.recommendations.push(`Team is distributed across ${locations.size} locations - ensure good async communication`)
    }
  }

  private async generateConflictResolutionRecommendations(context: EnrichedContext) {
    if (context.people.length >= 2) {
      const [person1, person2] = context.people
      
      if (person1.enneagram_type && person2.enneagram_type) {
        const profile1 = hrIntelligence.getEnneagramProfile(person1.enneagram_type)
        const profile2 = hrIntelligence.getEnneagramProfile(person2.enneagram_type)
        
        if (profile1 && profile2) {
          context.recommendations.push(
            `Communication approach for ${person1.name} (${profile1.name}): ${profile1.communication}`,
            `Communication approach for ${person2.name} (${profile2.name}): ${profile2.communication}`
          )
          
          // Check if they have natural challenges
          if (profile1.challengesWith.includes(person2.enneagram_type)) {
            context.recommendations.push(
              `Note: ${profile1.name} and ${profile2.name} types can have natural friction`,
              'Consider having a neutral mediator facilitate discussions',
              'Focus on shared goals rather than differences in approach'
            )
          }
        }
      }
    }
  }

  private async generateDelegationRecommendations(context: EnrichedContext) {
    // Find delegation paths
    for (const relationship of context.relationships) {
      if (relationship.directReports.length > 0) {
        const person = relationship.person
        const profile = person.enneagram_type ? 
          hrIntelligence.getEnneagramProfile(person.enneagram_type) : null
        
        if (profile) {
          context.recommendations.push(
            `When delegating to ${person.name} (${profile.name}): ${profile.communication}`
          )
        }
        
        // Recommend based on workload
        if (relationship.directReports.length > 7) {
          context.recommendations.push(
            `${person.name} has ${relationship.directReports.length} direct reports - consider restructuring for better span of control`
          )
        }
      }
    }
  }

  private async generateDepartmentOverviewRecommendations(context: EnrichedContext) {
    // Analyze department composition
    const departments = new Map<string, Person[]>()
    context.people.forEach(p => {
      const dept = p.department_id
      if (!departments.has(dept)) {
        departments.set(dept, [])
      }
      departments.get(dept)!.push(p)
    })

    for (const [deptId, people] of departments) {
      if (people.length < 3) {
        context.recommendations.push(`Department may be understaffed with only ${people.length} members`)
      }
      
      // Check Enneagram diversity
      const types = new Set(people.map(p => p.enneagram_type).filter(Boolean))
      if (types.size < people.length * 0.5) {
        context.recommendations.push('Consider adding more personality type diversity to the department')
      }
    }
  }

  private createContextSummary(intent: IntentResult, context: EnrichedContext): string {
    const parts: string[] = []
    
    if (context.people.length > 0) {
      parts.push(`Found ${context.people.length} relevant people`)
    }
    
    if (context.documents.length > 0) {
      parts.push(`Found ${context.documents.length} relevant documents`)
    }
    
    if (context.enneagramInsights.teamCompatibility) {
      parts.push(`Team compatibility: ${context.enneagramInsights.teamCompatibility.compatibility}%`)
    }
    
    if (context.relationships.length > 0) {
      const managersCount = context.relationships.filter(r => r.manager).length
      parts.push(`Mapped ${managersCount} reporting relationships`)
    }
    
    return parts.join(' | ')
  }
}

// Export singleton instance
export const contextBuilder = new ContextBuilder()
