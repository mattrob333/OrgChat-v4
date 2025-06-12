// Function to call the OpenAI API
export async function callOpenAI(userInput: string): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userInput,
        systemPrompt: `You are an HR assistant with access to real-time organizational data. You help with:
- Finding the right people for projects based on skills, experience, and personality types
- Team composition recommendations using Enneagram compatibility
- Conflict resolution between team members
- Delegation and reporting structure queries
- Accessing HR documents and policies

Always provide specific, data-driven responses based on actual employee information, their roles, departments, and Enneagram types. When suggesting team compositions, consider personality compatibility and complementary skills.`,
        // Default model and parameters (can be overridden in the API route)
        model: "gpt-4o",
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to get AI response")
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    return "I'm sorry, I encountered an error while processing your request. Please try again later."
  }
}

// Legacy mock data for fallback
const teamData: Record<string, { skills: string[]; expertise: string[]; projects: string[] }> = {
  "Eleanor Roosevelt": {
    skills: ["Leadership", "Strategic Planning", "Executive Management"],
    expertise: ["Business Development", "Organizational Growth", "Corporate Strategy"],
    projects: ["Company Vision 2025", "Digital Transformation Initiative"],
  },
  "Marcus Chen": {
    skills: ["System Architecture", "Cloud Infrastructure", "Technical Leadership"],
    expertise: ["AWS", "Kubernetes", "Microservices", "DevOps"],
    projects: ["Cloud Migration", "Infrastructure Automation"],
  },
  "Sophia Williams": {
    skills: ["Financial Planning", "Risk Management", "Investment Strategy"],
    expertise: ["Financial Analysis", "Budgeting", "Forecasting", "M&A"],
    projects: ["Annual Budget Planning", "Cost Optimization"],
  },
  "James Wilson": {
    skills: ["Brand Strategy", "Digital Marketing", "Market Analysis"],
    expertise: ["SEO/SEM", "Content Marketing", "Social Media", "Analytics"],
    projects: ["Brand Refresh", "Digital Marketing Campaign"],
  },
  "Alexandra Peterson": {
    skills: ["Talent Acquisition", "Employee Development", "Culture Building"],
    expertise: ["Recruitment", "Training Programs", "Performance Management"],
    projects: ["Talent Development Program", "Employee Engagement Initiative"],
  },
  "Sarah Johnson": {
    skills: ["Software Architecture", "Frontend Development", "Team Leadership"],
    expertise: ["React", "TypeScript", "UI/UX Design", "Web Performance"],
    projects: ["Customer Portal Redesign", "Mobile App Development"],
  },
  "John Adams": {
    skills: ["Infrastructure Design", "Network Security", "System Reliability"],
    expertise: ["Server Management", "Database Administration", "Network Architecture"],
    projects: ["Data Center Upgrade", "Security Enhancement"],
  },
  "Robert Brown": {
    skills: ["Financial Reporting", "Compliance", "Auditing"],
    expertise: ["Tax Planning", "Financial Controls", "Regulatory Compliance"],
    projects: ["Financial Systems Upgrade", "Compliance Framework"],
  },
  "Elizabeth Clark": {
    skills: ["Campaign Management", "Content Strategy", "Brand Development"],
    expertise: ["Email Marketing", "Content Creation", "Marketing Automation"],
    projects: ["Product Launch Campaign", "Content Marketing Strategy"],
  },
  "Michael Green": {
    skills: ["Software Development", "Code Quality", "Technical Mentoring"],
    expertise: ["Backend Development", "API Design", "Testing Frameworks"],
    projects: ["API Gateway Implementation", "Microservice Architecture"],
  },
  "Jessica Taylor": {
    skills: ["Frontend Development", "UI Design", "Accessibility"],
    expertise: ["JavaScript", "CSS", "React", "Design Systems"],
    projects: ["Design System Implementation", "Frontend Performance Optimization"],
  },
}

// Legacy functions for fallback
function findTeamMembersForProject(requirements: string): string {
  const keywords = requirements.toLowerCase().split(/\s+/)

  // Score each team member based on matching skills and expertise
  const scores: Record<string, number> = {}

  Object.entries(teamData).forEach(([name, data]) => {
    let score = 0

    // Check skills
    data.skills.forEach((skill) => {
      if (keywords.some((keyword) => skill.toLowerCase().includes(keyword))) {
        score += 2
      }
    })

    // Check expertise
    data.expertise.forEach((expertise) => {
      if (keywords.some((keyword) => expertise.toLowerCase().includes(keyword))) {
        score += 3
      }
    })

    // Check projects
    data.projects.forEach((project) => {
      if (keywords.some((keyword) => project.toLowerCase().includes(keyword))) {
        score += 1
      }
    })

    scores[name] = score
  })

  // Sort team members by score
  const sortedMembers = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  if (sortedMembers.length === 0) {
    return "I couldn't find specific team members matching those requirements. Could you provide more details about the project?"
  }

  // Format the response
  const topMembers = sortedMembers.slice(0, 3)

  if (topMembers.length === 1) {
    return `Based on the requirements, I recommend ${topMembers[0]}. They have the skills and expertise that match your project needs.`
  }

  const lastMember = topMembers.pop()
  return `Based on the requirements, I recommend ${topMembers.join(", ")} and ${lastMember}. They have the skills and expertise that match your project needs.`
}

// Legacy function for fallback
function generateLegacyAIResponse(userInput: string): string {
  const input = userInput.toLowerCase()

  // Check if this is a project staffing question
  if (
    input.includes("who should") ||
    input.includes("which team") ||
    input.includes("best person") ||
    input.includes("recommend") ||
    input.includes("for a project") ||
    input.includes("for this task")
  ) {
    return findTeamMembersForProject(userInput)
  }

  // Handle specific department inquiries
  if (input.includes("engineering team") || input.includes("developers")) {
    return "Our Engineering team is led by Sarah Johnson (VP of Engineering). The team includes Michael Green and Jessica Taylor, who specialize in backend and frontend development respectively."
  }

  if (input.includes("marketing team")) {
    return "Our Marketing team is led by James Wilson (CMO) with Elizabeth Clark as the Marketing Director. They handle all our marketing campaigns, content strategy, and brand development."
  }

  if (input.includes("finance team")) {
    return "Our Finance team is led by Sophia Williams (CFO) with Robert Brown as the Finance Director. They manage all financial planning, reporting, and compliance matters."
  }

  if (input.includes("hr") || input.includes("people team")) {
    return "Our People team is led by Alexandra Peterson (Chief People Officer). They handle recruitment, employee development, and all HR-related matters."
  }

  if (input.includes("tech") || input.includes("it team")) {
    return "Our Technology team is led by Marcus Chen (CTO) with John Adams as VP of Infrastructure. They oversee all technical operations, infrastructure, and software development."
  }

  // Handle skill-based inquiries
  if (input.includes("who knows") || input.includes("who has experience") || input.includes("expert in")) {
    return findTeamMembersForProject(userInput)
  }

  // Default responses
  if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
    return "Hello! I'm your HR and Project Management Assistant. I can help you find the right team members for projects or answer questions about our organization. How can I assist you today?"
  }

  return "I'm here to help you find the right team members for your projects and answer questions about our organization. Could you provide more details about what you're looking for?"
}

// Main function that tries OpenAI first, falls back to legacy if needed
export async function generateAIResponse(userInput: string): Promise<string> {
  try {
    // Try to use OpenAI
    const openAIResponse = await callOpenAI(userInput)
    return openAIResponse
  } catch (error) {
    console.error("Error with OpenAI, falling back to legacy response:", error)
    // Fall back to legacy response generator
    return generateLegacyAIResponse(userInput)
  }
}
