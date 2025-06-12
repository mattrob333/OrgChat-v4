export interface IntentResult {
  primaryIntent: 'team_composition' | 'document_search' | 'conflict_resolution' | 'delegation' | 'employee_lookup' | 'department_overview' | 'mixed'
  confidence: number
  entities: {
    people: string[]
    departments: string[]
    documentTypes: string[]
    skills: string[]
    locations: string[]
    timeframe: 'current' | 'historical' | null
    projectType: string | null
  }
  queryType: {
    needsPeopleData: boolean
    needsDocumentData: boolean
    needsRelationshipData: boolean
    needsEnneagramData: boolean
  }
}

export class IntentDetector {
  // Keywords for different intents
  private readonly intentKeywords = {
    team_composition: [
      'team', 'work together', 'collaborate', 'project team', 'who should', 
      'compatible', 'work well', 'team for', 'assemble', 'form a team'
    ],
    document_search: [
      'document', 'policy', 'guide', 'handbook', 'process', 'procedure',
      'documentation', 'reference', 'manual', 'guidelines', 'rules'
    ],
    conflict_resolution: [
      'conflict', 'tension', 'issue', 'problem', 'dispute', 'disagreement',
      'friction', 'resolve', 'mediate', 'help with', 'not getting along'
    ],
    delegation: [
      'delegate', 'assign', 'pass down', 'who reports', 'reporting to',
      'chain of command', 'hierarchy', 'manager', 'direct reports'
    ],
    employee_lookup: [
      'who is', 'contact', 'email', 'phone', 'find', 'person',
      'employee', 'staff', 'team member', 'role', 'position'
    ],
    department_overview: [
      'department', 'team overview', 'org structure', 'division',
      'group', 'unit', 'branch', 'section'
    ]
  }

  // Entity extraction patterns
  private readonly entityPatterns = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    quotedText: /"([^"]+)"/g,
    // Enhanced name patterns
    personName: /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\'s|\s|$)/g,
    whoIsPattern: /(?:who is|what is|tell me about|show me|find)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/gi,
    possessivePattern: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:'s|\s+is|\s+has|\s+works|\s+reports|\s+manages)/g,
    // Other entity patterns
    department: /(engineering|sales|marketing|finance|hr|human resources|technology|operations|legal|product)/gi,
    documentType: /(policy|handbook|guide|manual|process|procedure|documentation|report|memo)/gi,
    skill: /(react|python|java|javascript|typescript|leadership|management|communication|analysis|design|development)/gi,
    location: /(san francisco|new york|chicago|austin|seattle|denver|los angeles|remote)/gi,
    enneagramType: /(?:enneagram )?(type )?[1-9](?:w[1-9])?/gi
  }

  detectIntent(prompt: string): IntentResult {
    const lowerPrompt = prompt.toLowerCase()
    const result: IntentResult = {
      primaryIntent: 'mixed',
      confidence: 0,
      entities: {
        people: [],
        departments: [],
        documentTypes: [],
        skills: [],
        locations: [],
        timeframe: null,
        projectType: null
      },
      queryType: {
        needsPeopleData: false,
        needsDocumentData: false,
        needsRelationshipData: false,
        needsEnneagramData: false
      }
    }

    // Score each intent
    const intentScores: Record<string, number> = {}
    
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (lowerPrompt.includes(keyword)) {
          score += 1
        }
      }
      intentScores[intent] = score
    }

    // Find primary intent
    let maxScore = 0
    for (const [intent, score] of Object.entries(intentScores)) {
      if (score > maxScore) {
        maxScore = score
        result.primaryIntent = intent as any
      }
    }

    // Calculate confidence
    const totalScore = Object.values(intentScores).reduce((a, b) => a + b, 0)
    result.confidence = totalScore > 0 ? maxScore / totalScore : 0

    // Extract entities
    result.entities = this.extractEntities(prompt)

    // Determine query types needed
    result.queryType = this.determineQueryTypes(result.primaryIntent, prompt)

    return result
  }

  private extractEntities(prompt: string): IntentResult['entities'] {
    const entities: IntentResult['entities'] = {
      people: [],
      departments: [],
      documentTypes: [],
      skills: [],
      locations: [],
      timeframe: null,
      projectType: null
    }

    // Extract names using multiple patterns
    const nameExtractors = [
      // Quoted names (e.g., "Rachel Green")
      {
        pattern: this.entityPatterns.quotedText,
        extractor: (match: RegExpMatchArray) => [match[1]]
      },
      // Who is X pattern (e.g., "who is Rachel Green")
      {
        pattern: this.entityPatterns.whoIsPattern,
        extractor: (match: RegExpMatchArray) => [match[1]]
      },
      // Possessive pattern (e.g., "Rachel's enneagram")
      {
        pattern: this.entityPatterns.possessivePattern,
        extractor: (match: RegExpMatchArray) => [match[1]]
      },
      // General name pattern (e.g., "Rachel Green works in")
      {
        pattern: this.entityPatterns.personName,
        extractor: (match: RegExpMatchArray) => [match[1]]
      }
    ]

    // Run all name extractors and collect unique names
    const foundNames = new Set<string>()
    
    for (const { pattern, extractor } of nameExtractors) {
      const matches = [...prompt.matchAll(pattern)]
      for (const match of matches) {
        const names = extractor(match)
        names.forEach(name => foundNames.add(name.trim()))
      }
    }

    // Add all unique names to entities.people
    entities.people = Array.from(foundNames)
    
    // Log extracted names for debugging
    if (entities.people.length > 0) {
      console.log('Extracted names from query:', entities.people)
    }

    // Extract emails
    const emailMatches = prompt.match(this.entityPatterns.email)
    if (emailMatches) {
      entities.people.push(...emailMatches)
    }

    // Extract departments
    const deptMatches = prompt.match(this.entityPatterns.department)
    if (deptMatches) {
      entities.departments.push(...deptMatches.map(d => d.toLowerCase()))
    }

    // Extract document types
    const docMatches = prompt.match(this.entityPatterns.documentType)
    if (docMatches) {
      entities.documentTypes.push(...docMatches.map(d => d.toLowerCase()))
    }

    // Extract skills
    const skillMatches = prompt.match(this.entityPatterns.skill)
    if (skillMatches) {
      entities.skills.push(...skillMatches.map(s => s.toLowerCase()))
    }

    // Extract locations
    const locationMatches = prompt.match(this.entityPatterns.location)
    if (locationMatches) {
      entities.locations.push(...locationMatches.map(l => l.toLowerCase()))
    }

    // Extract proper names (capitalized words that might be names)
    const properNames = prompt.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g)
    if (properNames) {
      entities.people.push(...properNames)
    }

    // Detect timeframe
    if (prompt.match(/\b(current|now|today|present)\b/i)) {
      entities.timeframe = 'current'
    } else if (prompt.match(/\b(past|previous|historical|former)\b/i)) {
      entities.timeframe = 'historical'
    }

    // Detect project type
    if (prompt.match(/\b(marketing|campaign|launch|promotion)\b/i)) {
      entities.projectType = 'marketing'
    } else if (prompt.match(/\b(technical|development|engineering|coding)\b/i)) {
      entities.projectType = 'technical'
    } else if (prompt.match(/\b(creative|design|artistic)\b/i)) {
      entities.projectType = 'creative'
    } else if (prompt.match(/\b(strategic|planning|analysis)\b/i)) {
      entities.projectType = 'strategic'
    }

    // Remove duplicates
    entities.people = [...new Set(entities.people)]
    entities.departments = [...new Set(entities.departments)]
    entities.documentTypes = [...new Set(entities.documentTypes)]
    entities.skills = [...new Set(entities.skills)]
    entities.locations = [...new Set(entities.locations)]

    return entities
  }

  private determineQueryTypes(intent: string, prompt: string): IntentResult['queryType'] {
    const queryType = {
      needsPeopleData: false,
      needsDocumentData: false,
      needsRelationshipData: false,
      needsEnneagramData: false
    }

    // Based on primary intent
    switch (intent) {
      case 'team_composition':
        queryType.needsPeopleData = true
        queryType.needsEnneagramData = true
        queryType.needsRelationshipData = true
        break
      case 'document_search':
        queryType.needsDocumentData = true
        break
      case 'conflict_resolution':
        queryType.needsPeopleData = true
        queryType.needsEnneagramData = true
        queryType.needsDocumentData = true // May need conflict resolution guides
        break
      case 'delegation':
        queryType.needsPeopleData = true
        queryType.needsRelationshipData = true
        queryType.needsEnneagramData = true // For communication style
        break
      case 'employee_lookup':
        queryType.needsPeopleData = true
        break
      case 'department_overview':
        queryType.needsPeopleData = true
        queryType.needsRelationshipData = true
        break
    }

    // Override based on specific keywords
    if (prompt.match(/\b(personality|enneagram|type|compatible|work well)\b/i)) {
      queryType.needsEnneagramData = true
    }
    if (prompt.match(/\b(reports to|manager|hierarchy|chain)\b/i)) {
      queryType.needsRelationshipData = true
    }
    if (prompt.match(/\b(document|policy|guide|process)\b/i)) {
      queryType.needsDocumentData = true
    }
    if (prompt.match(/\b(who|person|employee|contact|email)\b/i)) {
      queryType.needsPeopleData = true
    }

    return queryType
  }
}

// Export singleton instance
export const intentDetector = new IntentDetector()
