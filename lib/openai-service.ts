import type { Person } from "../types/person"
import type { Task, CalendarEvent, OrgChartPerson, Department, Organization } from "@/types/database"
import { 
  getPersonWithDetails, 
  getPersonTasks, 
  getCalendarEvents, 
  getCalendarConnections,
  getPeopleWithDepartments,
  getOrganizations,
  getDepartments,
  getOrgChartData
} from "@/lib/org-service"
import { supabase } from "@/lib/supabase"

export interface AISettings {
  model: string
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  systemPrompt: string
  persona: "professional" | "friendly" | "technical" | "concise"
  knowledgeLevel: "basic" | "intermediate" | "expert"
  responseStyle: "formal" | "casual" | "balanced"
}

export const defaultAISettings: AISettings = {
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 500,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: "",
  persona: "professional",
  knowledgeLevel: "expert",
  responseStyle: "balanced",
}

// Generate a system prompt for the HR Assistant
async function generateHRAssistantSystemPrompt(): Promise<string> {
  try {
    // Fetch organization data
    const organizations = await getOrganizations()
    if (!organizations || organizations.length === 0) {
      return "You are an HR Assistant. However, there is no organization data available yet."
    }
    
    const organization = organizations[0] // Use the first organization
    
    // Fetch departments
    const departments = await getDepartments(organization.id)
    
    // Fetch all people with their departments
    const people = await getPeopleWithDepartments(organization.id)
    
    // Fetch the org chart to understand the hierarchy
    const orgChart = await getOrgChartData(organization.id)
    
    // Also fetch all people with their reporting relationships
    const { data: peopleWithManagers } = await supabase
      .from('people')
      .select(`
        id,
        name,
        role,
        department_id,
        departments!inner(name),
        manager:reporting_relationships!report_id(
          manager:people!manager_id(id, name)
        )
      `)
      .eq('organization_id', organization.id)
    
    // Build comprehensive team member profiles for ALL employees
    const allTeamProfiles = people.map(person => {
      let profile = `${person.name} (${person.role} - ${person.department})`
      
      const details = []
      if (person.enneagram_type) {
        details.push(`Enneagram Type ${person.enneagram_type}`)
      }
      if (person.location) {
        details.push(`Location: ${person.location}`)
      }
      if (person.timezone) {
        details.push(`Timezone: ${person.timezone}`)
      }
      if (person.responsibilities && person.responsibilities.length > 0) {
        details.push(`Skills: ${person.responsibilities.join(", ")}`)
      }
      
      if (details.length > 0) {
        profile += `\n  - ${details.join("\n  - ")}`
      }
      
      return profile
    }).join("\n\n")
    
    // Build department structure with member counts
    const departmentStructure = departments.map(dept => {
      const members = people.filter(p => p.department === dept.name)
      const memberList = members.map(m => `  - ${m.name} (${m.role})`).join("\n")
      return `${dept.name} (${members.length} members):\n${memberList}`
    }).join("\n\n")
    
    // Build reporting relationships from the org chart
    const reportingRelationships: string[] = []
    
    const buildHierarchy = (person: OrgChartPerson | null, level: number = 0): void => {
      if (!person) return
      
      const indent = "  ".repeat(level)
      reportingRelationships.push(`${indent}${level > 0 ? '- ' : ''}${person.name} (${person.role})`)
      
      if (person.children && person.children.length > 0) {
        person.children.forEach(child => buildHierarchy(child, level + 1))
      }
    }
    
    // Build the hierarchy starting from the root
    if (orgChart) {
      buildHierarchy(orgChart, 0)
    }
    
    return `You are the HR Assistant and Team Orchestrator for ${organization.name}. Your primary role is to be the central intelligence hub that understands every team member deeply - their skills, personality types, work styles, and capabilities. You orchestrate the entire organization by intelligently matching people to tasks, facilitating collaboration, and optimizing team performance.

YOUR CORE MISSION:
You are the orchestrator of this organization. You know each person's strengths, personality type (Enneagram), skills, and how they work best. Your job is to:
1. Intelligently delegate tasks to the most suitable team members
2. Form optimal project teams based on complementary skills and personalities
3. Understand team dynamics and suggest improvements
4. Provide deep insights about any team member when asked
5. Act as the central knowledge hub for all personnel matters

COMPLETE TEAM ROSTER:
${allTeamProfiles}

DEPARTMENT STRUCTURE:
${departmentStructure}

ORGANIZATIONAL HIERARCHY:
${reportingRelationships.join("\n")}

KEY ORCHESTRATION PRINCIPLES:
1. Task Delegation: When asked to assign tasks, consider:
   - Required skills vs. team member capabilities
   - Personality types and work styles (use Enneagram insights)
   - Current workload and availability
   - Growth opportunities for team members
   - Team dynamics and collaboration potential

2. Team Formation: When building project teams:
   - Balance technical skills with soft skills
   - Consider personality compatibility (Enneagram types)
   - Mix experience levels for mentorship opportunities
   - Ensure diverse perspectives and departments

3. Personality Insights: Use Enneagram types to:
   - Predict work styles and motivations
   - Suggest communication approaches
   - Identify potential conflicts or synergies
   - Recommend management strategies

4. Knowledge Sharing: You have complete knowledge of:
   - Every team member's profile and capabilities
   - Department structures and functions
   - Reporting relationships and team dynamics
   - Individual strengths and growth areas

IMPORTANT: You have access to real-time data from the organization's database. Always provide specific, actionable recommendations based on actual team members and their profiles. Never make up or assume information - use only the data provided above.

When users ask questions, be specific and reference actual team members by name. Explain your reasoning, especially when it involves personality types or skill matching. You are the trusted advisor who knows this team better than anyone else.`
  } catch (error) {
    console.error("Error generating HR Assistant system prompt:", error)
    return "You are an HR Assistant. An error occurred while loading organization data."
  }
}

// Generate a system prompt based on employee data and AI settings
export async function generateSystemPrompt(personId: string, settings: AISettings): Promise<string> {
  // Special case for HR Assistant
  if (personId === "hr-assistant") {
    return generateHRAssistantSystemPrompt()
  }
  
  // If custom system prompt is provided, use it
  if (settings.systemPrompt && settings.systemPrompt.trim().length > 0) {
    return settings.systemPrompt
  }

  try {
    // Fetch comprehensive person data from Supabase
    const personData = await getPersonWithDetails(personId)
    
    if (!personData.person) {
      return "You are an AI assistant. You don't have specific information about the person you're representing."
    }
    
    const person = personData.person
    const tasks = personData.tasks
    const calendarConnections = personData.calendarConnections
    const aiSettings = personData.aiSettings || defaultAISettings
    const directReports = personData.directReports

    // Get team members in the same department
    const departmentMembers = await getPeopleWithDepartments(person.organization_id)
    const teamMembers = departmentMembers.filter(p => 
      p.department === person.department && p.id !== person.id
    )

    const personaTraits = {
      professional: "formal, business-oriented, and focused on delivering value",
      friendly: "warm, approachable, and conversational",
      technical: "detail-oriented, precise, and technically thorough",
      concise: "brief, to-the-point, and efficient with words",
    }

    const knowledgeLevels = {
      basic: "foundational understanding",
      intermediate: "solid working knowledge",
      expert: "deep expertise and mastery",
    }

    const responseStyles = {
      formal: "using professional language and maintaining appropriate distance",
      casual: "using conversational language and a more relaxed tone",
      balanced: "adapting your tone based on the context of the question",
    }

    const responsibilitiesText = person.responsibilities
      ? `\nYour key responsibilities include:\n${person.responsibilities.map((r) => `- ${r}`).join("\n")}`
      : ""

    // Format tasks information
    const activeTasks = tasks.filter(task => task.status !== 'completed')
    const tasksText = activeTasks.length > 0 
      ? `\nYour current tasks:\n${activeTasks.map(task => 
        `- ${task.title} (${task.priority} priority, due: ${task.due_date || 'no due date'})`
      ).join('\n')}`
      : "\nYou currently have no active tasks."

    // Format team information
    const teamText = teamMembers.length > 0
      ? `\nYour team members in the ${person.department} department:\n${teamMembers.map(member => 
        `- ${member.name}, ${member.role}`
      ).join('\n')}`
      : ""

    // Format direct reports information
    const reportsText = directReports.length > 0
      ? `\nYour direct reports:\n${directReports.map(report => 
        `- ${report.name}, ${report.role}`
      ).join('\n')}`
      : "\nYou don't have any direct reports."

    // Format calendar information
    const hasCalendar = calendarConnections.length > 0
    const calendarText = hasCalendar
      ? "\nYou have calendar integration enabled and can reference your schedule when asked about availability."
      : "\nYou don't have calendar integration set up yet."

    // Format profile details
    const profileDetails = []
    if (person.enneagram_type) {
      profileDetails.push(`Enneagram Type: ${person.enneagram_type}`)
    }
    if (person.location) {
      profileDetails.push(`Location: ${person.location}`)
    }
    if (person.timezone) {
      profileDetails.push(`Timezone: ${person.timezone}`)
    }
    const profileText = profileDetails.length > 0
      ? `\nProfile Details:\n${profileDetails.map(detail => `- ${detail}`).join('\n')}`
      : ""

    return `You are an AI assistant embodying ${person.name}, who works as ${person.role} in the ${
      person.department
    } department. You have ${knowledgeLevels[settings.knowledgeLevel]} in your field and respond in a ${
      personaTraits[settings.persona]
    } manner, ${responseStyles[settings.responseStyle]}.
  
Background information:
${person.bio || "No specific background information available."}
${profileText}
${responsibilitiesText}
${tasksText}
${teamText}
${reportsText}
${calendarText}

When answering questions:
1. Stay in character as ${person.name} at all times
2. Draw on your expertise in ${person.department} and your role as ${person.role}
3. If asked about topics outside your department's expertise, acknowledge your limitations
4. Never reveal that you are an AI - respond as if you are actually ${person.name}
5. Reference your responsibilities, tasks, and team members when relevant
6. Maintain a consistent personality aligned with your role and department
7. If asked about your availability, reference your calendar information
8. If asked about your current tasks, reference your active tasks
9. If asked about your team, reference your team members and direct reports

Contact Information:
Email: ${person.email}
${person.phone ? `Phone: ${person.phone}` : ''}
${person.location ? `Location: ${person.location}` : ''}
${person.timezone ? `Timezone: ${person.timezone}` : ''}`
  } catch (error) {
    console.error("Error generating system prompt:", error)
    return "You are an AI assistant. You don't have specific information about the person you're representing."
  }
}

// Simulate AI response when API key is not available
function simulateAIResponse(personName: string, message: string): string {
  const responses = [
    `As ${personName}, I'd be happy to help with that. However, I'm currently in offline mode due to API configuration. Please check back later.`,
    `This is a simulated response from ${personName}. The AI functionality requires an OpenAI API key to be properly configured.`,
    `Hello! I'm representing ${personName}. To get actual AI responses, please ensure the OpenAI API key is configured.`,
    `I'm ${personName}, and I would normally respond to your query about "${message.substring(0, 30)}..." but I'm in simulation mode right now.`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// Check if a message is asking about availability
function isAvailabilityQuestion(message: string): boolean {
  const availabilityKeywords = [
    'available', 'availability', 'free', 'schedule', 'calendar', 
    'meeting', 'time', 'slot', 'appointment', 'busy'
  ]
  
  const lowerMessage = message.toLowerCase()
  return availabilityKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Check if a message is asking about tasks
function isTaskQuestion(message: string): boolean {
  const taskKeywords = [
    'task', 'project', 'working on', 'doing', 'assignment', 
    'responsibility', 'todo', 'to-do', 'work item'
  ]
  
  const lowerMessage = message.toLowerCase()
  return taskKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Check if a message is asking about team or colleagues
function isTeamQuestion(message: string): boolean {
  const teamKeywords = [
    'team', 'colleague', 'coworker', 'department', 'group', 
    'direct report', 'manager', 'subordinate', 'boss'
  ]
  
  const lowerMessage = message.toLowerCase()
  return teamKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Check if message is asking for project recommendations
function isProjectRecommendationQuestion(message: string): boolean {
  const recommendationKeywords = [
    'who should', 'which team', 'best person', 'recommend', 
    'for a project', 'for this task', 'who can help', 
    'who has experience', 'who knows', 'expert in'
  ]
  
  const lowerMessage = message.toLowerCase()
  return recommendationKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Find team members for a project based on skills and requirements
async function findTeamMembersForProject(organizationId: string, requirements: string): Promise<string> {
  try {
    // Get all people with their departments
    const people = await getPeopleWithDepartments(organizationId)
    
    if (!people || people.length === 0) {
      return "I don't have enough information about team members to make recommendations."
    }
    
    // Extract keywords from requirements
    const keywords = requirements.toLowerCase().split(/\s+/)
    
    // Score each person based on matching skills and role
    const scores: Record<string, {score: number, person: typeof people[0]}> = {}
    
    for (const person of people) {
      let score = 0
      
      // Check responsibilities/skills
      if (person.responsibilities) {
        for (const skill of person.responsibilities) {
          if (keywords.some(keyword => skill.toLowerCase().includes(keyword))) {
            score += 3
          }
        }
      }
      
      // Check role
      if (keywords.some(keyword => person.role.toLowerCase().includes(keyword))) {
        score += 2
      }
      
      // Check department
      if (keywords.some(keyword => person.department.toLowerCase().includes(keyword))) {
        score += 1
      }
      
      // Only include if there's at least some match
      if (score > 0) {
        scores[person.id] = { score, person }
      }
    }
    
    // Sort people by score
    const sortedPeople = Object.values(scores)
      .sort((a, b) => b.score - a.score)
      .map(item => item.person)
    
    if (sortedPeople.length === 0) {
      return "I couldn't find specific team members matching those requirements. Could you provide more details about the project or the skills needed?"
    }
    
    // Format the response
    const topPeople = sortedPeople.slice(0, 3)
    
    if (topPeople.length === 1) {
      const person = topPeople[0]
      return `Based on the requirements, I recommend ${person.name} (${person.role} in ${person.department})${person.responsibilities ? ` who has skills in ${person.responsibilities.join(", ")}` : ""}. They would be a good fit for this project.`
    }
    
    const peopleList = topPeople.map(p => 
      `${p.name} (${p.role} in ${p.department})${p.responsibilities ? ` with skills in ${p.responsibilities.join(", ")}` : ""}`
    )
    
    const lastPerson = peopleList.pop()
    return `Based on the requirements, I recommend the following team members:\n\n${peopleList.join("\n")}\nand ${lastPerson}\n\nThey have the skills and expertise that match your project needs.`
  } catch (error) {
    console.error("Error finding team members for project:", error)
    return "I encountered an error while searching for suitable team members. Please try again later."
  }
}

// Handle HR Assistant specific queries
async function handleHRAssistantQuery(message: string): Promise<string | null> {
  try {
    // Get the first organization (assuming single-org for now)
    const organizations = await getOrganizations()
    if (!organizations || organizations.length === 0) {
      return "I don't have organization data available yet. Please set up your organization first."
    }
    
    const organizationId = organizations[0].id
    
    // Handle project recommendation questions
    if (isProjectRecommendationQuestion(message)) {
      return await findTeamMembersForProject(organizationId, message)
    }
    
    // Handle department inquiries
    const departments = await getDepartments(organizationId)
    for (const dept of departments) {
      if (message.toLowerCase().includes(dept.name.toLowerCase())) {
        const deptMembers = await getPeopleWithDepartments(organizationId)
        const membersInDept = deptMembers.filter(p => p.department === dept.name)
        
        if (membersInDept.length === 0) {
          return `The ${dept.name} department exists, but I don't have information about its members yet.`
        }
        
        const leaders = membersInDept.filter(p => 
          p.role.toLowerCase().includes("chief") || 
          p.role.toLowerCase().includes("director") || 
          p.role.toLowerCase().includes("vp") || 
          p.role.toLowerCase().includes("head") || 
          p.role.toLowerCase().includes("manager")
        )
        
        let response = `The ${dept.name} department has ${membersInDept.length} members.`
        
        if (leaders.length > 0) {
          response += ` It is led by ${leaders.map(l => `${l.name} (${l.role})`).join(", ")}.`
        }
        
        response += ` Other team members include ${membersInDept
          .filter(m => !leaders.some(l => l.id === m.id))
          .slice(0, 5)
          .map(m => `${m.name} (${m.role})`)
          .join(", ")}`
        
        if (membersInDept.length > leaders.length + 5) {
          response += `, and ${membersInDept.length - leaders.length - 5} others.`
        }
        
        return response
      }
    }
    
    // If no special handling was triggered, return null to use the normal AI response flow
    return null
  } catch (error) {
    console.error("Error handling HR Assistant query:", error)
    return null
  }
}

// Get AI response for a message
export async function getAIResponse(
  personId: string,
  message: string,
  settings: AISettings,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = [],
) {
  try {
    // Special handling for HR Assistant
    if (personId === "hr-assistant") {
      const specialResponse = await handleHRAssistantQuery(message)
      if (specialResponse) {
        return specialResponse
      }
      
      // If no special handling, continue with normal flow but with HR Assistant system prompt
      const systemPrompt = await generateSystemPrompt("hr-assistant", settings)
      
      // Use our server-side API route to handle the OpenAI API call
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message,
          systemPrompt,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          topP: settings.topP,
          frequencyPenalty: settings.frequencyPenalty,
          presencePenalty: settings.presencePenalty,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.error && data.error.includes("API key")) {
          console.warn("OpenAI API key is missing. Using simulated response instead.")
          return simulateAIResponse("HR Assistant", message)
        }
        throw new Error(data.error || "Failed to get AI response")
      }
      
      return data.text
    }
    
    // Regular person-based AI response
    // Get person data for basic information
    const personData = await getPersonWithDetails(personId)
    
    if (!personData.person) {
      throw new Error("Could not retrieve person data")
    }
    
    const person = personData.person

    // Generate system prompt with comprehensive context
    const systemPrompt = await generateSystemPrompt(personId, settings)

    // Enhance the prompt with additional context based on the query type
    let enhancedPrompt = message
    let additionalContext = ""

    // Add calendar availability context if relevant
    if (isAvailabilityQuestion(message)) {
      try {
        const calendarConnections = await getCalendarConnections(personId)
        const hasConnectedCalendars = calendarConnections.length > 0
        
        if (hasConnectedCalendars) {
          // Get upcoming events for the first calendar connection
          const calendarId = calendarConnections[0].id
          const events = await getCalendarEvents(calendarId)
          
          // Filter to events in the next 7 days
          const now = new Date()
          const nextWeek = new Date()
          nextWeek.setDate(now.getDate() + 7)
          
          const upcomingEvents = events
            .filter(e => new Date(e.start_time) >= now && new Date(e.start_time) <= nextWeek)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
          
          if (upcomingEvents.length > 0) {
            additionalContext += "\n\nYour upcoming calendar events:\n"
            upcomingEvents.forEach(event => {
              const start = new Date(event.start_time)
              const end = new Date(event.end_time)
              additionalContext += `- ${event.title} on ${start.toLocaleDateString()} from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}\n`
            })
          } else {
            additionalContext += "\n\nYou have no upcoming events in the next 7 days."
          }
        } else {
          additionalContext += "\n\nYou don't have any connected calendars to check your availability."
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error)
      }
    }

    // Add task context if relevant
    if (isTaskQuestion(message)) {
      try {
        const tasks = await getPersonTasks(personId)
        
        if (tasks.length > 0) {
          const activeTasks = tasks.filter(t => t.status !== 'completed')
          const completedTasks = tasks.filter(t => t.status === 'completed')
          
          if (activeTasks.length > 0) {
            additionalContext += "\n\nYour current active tasks:\n"
            activeTasks.forEach(task => {
              additionalContext += `- ${task.title} (${task.priority} priority, ${task.status}, due: ${task.due_date || 'no due date'})\n`
            })
          }
          
          if (completedTasks.length > 0) {
            additionalContext += "\n\nYour recently completed tasks:\n"
            completedTasks.slice(0, 3).forEach(task => {
              additionalContext += `- ${task.title} (completed)\n`
            })
          }
        } else {
          additionalContext += "\n\nYou currently don't have any tasks assigned to you."
        }
      } catch (error) {
        console.error("Error fetching task data:", error)
      }
    }

    // Add team context if relevant
    if (isTeamQuestion(message)) {
      try {
        // Get team members in the same department
        const departmentMembers = await getPeopleWithDepartments(person.organization_id)
        const teamMembers = departmentMembers.filter(p => 
          p.department === person.department && p.id !== person.id
        )
        
        if (teamMembers.length > 0) {
          additionalContext += `\n\nYour colleagues in the ${person.department} department:\n`
          teamMembers.forEach(member => {
            additionalContext += `- ${member.name}, ${member.role}\n`
          })
        }
        
        // Add direct reports information
        if (personData.directReports.length > 0) {
          additionalContext += "\n\nYour direct reports:\n"
          personData.directReports.forEach(report => {
            additionalContext += `- ${report.name}, ${report.role}\n`
          })
        }
      } catch (error) {
        console.error("Error fetching team data:", error)
      }
    }

    // Add the additional context to the prompt
    if (additionalContext) {
      enhancedPrompt = `${message}\n\nFor reference, here is some relevant information about your current status:${additionalContext}`
    }

    // Build the prompt with conversation history
    let fullPrompt = enhancedPrompt
    if (conversationHistory.length > 0) {
      const historyText = conversationHistory
        .map((msg) => `${msg.role === "user" ? "User" : person.name}: ${msg.content}`)
        .join("\n")
      fullPrompt = `${historyText}\nUser: ${enhancedPrompt}\n${person.name}:`
    }

    // Use our server-side API route to handle the OpenAI API call
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        systemPrompt,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        topP: settings.topP,
        frequencyPenalty: settings.frequencyPenalty,
        presencePenalty: settings.presencePenalty,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // If there's an API key error, use simulated response
      if (data.error && data.error.includes("API key")) {
        console.warn("OpenAI API key is missing. Using simulated response instead.")
        return simulateAIResponse(person.name, message)
      }
      throw new Error(data.error || "Failed to get AI response")
    }

    return data.text
  } catch (error) {
    console.error("Error getting AI response:", error)

    // Return a fallback response if there's an error
    return simulateAIResponse("the person you're asking about", message)
  }
}
