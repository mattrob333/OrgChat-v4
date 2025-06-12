import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { contextBuilder } from "@/lib/context-builder"

// Enhanced system prompt for the HR Assistant with Supabase integration
const HR_ASSISTANT_SYSTEM_PROMPT = `You are an advanced HR Assistant with real-time access to organizational data, employee profiles, Enneagram personality insights, and company documents. You provide intelligent, context-aware responses about team composition, conflict resolution, delegation, and organizational queries.

Your capabilities include:
1. **Employee Information**: Look up employees by name, role, department, skills, or location
2. **Team Composition**: Recommend optimal teams based on skills, personality compatibility (Enneagram), and project requirements
3. **Conflict Resolution**: Provide personality-aware mediation strategies using Enneagram insights
4. **Delegation Guidance**: Suggest delegation paths based on reporting structures and communication styles
5. **Document Reference**: Search and cite relevant policies, handbooks, and guides
6. **Department Analysis**: Provide overviews of departments, their composition, and dynamics

When responding:
- Use the provided context data to give accurate, specific information
- Reference actual employee names, roles, and departments from the database
- Consider Enneagram personality types when discussing interpersonal dynamics
- Cite relevant documents when they support your recommendations
- Provide actionable insights based on the organizational structure
- Be respectful of privacy and only share appropriate information`

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } =
      await request.json()

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 })
    }

    console.log('Building context for prompt:', prompt)
    
    try {
      // Build context from the prompt using our HR Intelligence system
      const context = await contextBuilder.buildContext(prompt)
      console.log('Context built:', JSON.stringify(context, null, 2))
      
      // Create an enriched prompt with the context
      const enrichedPrompt = createEnrichedPrompt(prompt, context)
      console.log('Enriched prompt:', enrichedPrompt)
      
      // Use the HR Assistant system prompt if none is provided
      const finalSystemPrompt = systemPrompt || HR_ASSISTANT_SYSTEM_PROMPT

      const response = await generateText({
        model: openai(model || "gpt-4o"),
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        topP: topP || 1,
        frequencyPenalty: frequencyPenalty || 0,
        presencePenalty: presencePenalty || 0,
        prompt: enrichedPrompt,
        system: finalSystemPrompt,
      })

      return NextResponse.json({ text: response.text })
    } catch (contextError) {
      console.error("Error building context:", contextError)
      // Fallback to original prompt if context building fails
      const response = await generateText({
        model: openai(model || "gpt-4o"),
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000,
        topP: topP || 1,
        frequencyPenalty: frequencyPenalty || 0,
        presencePenalty: presencePenalty || 0,
        prompt,
        system: systemPrompt || HR_ASSISTANT_SYSTEM_PROMPT,
      })
      return NextResponse.json({ text: response.text })
    }
  } catch (error) {
    console.error("Error in AI route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

function createEnrichedPrompt(originalPrompt: string, context: any): string {
  let enrichedPrompt = `User Query: ${originalPrompt}\n\n`
  
  // Add context summary
  if (context.summary) {
    enrichedPrompt += `Context Summary: ${context.summary}\n\n`
  }
  
  // Add people data
  if (context.people.length > 0) {
    enrichedPrompt += "Relevant Employees:\n"
    context.people.forEach((person: any) => {
      enrichedPrompt += `- ${person.name} (${person.role})`
      if (person.department_id) enrichedPrompt += ` - ${person.department_id}`
      if (person.enneagram_type) enrichedPrompt += ` - Enneagram Type ${person.enneagram_type}`
      if (person.location) enrichedPrompt += ` - ${person.location}`
      enrichedPrompt += "\n"
      if (person.bio) enrichedPrompt += `  Bio: ${person.bio}\n`
      if (person.responsibilities?.length > 0) {
        enrichedPrompt += `  Responsibilities: ${person.responsibilities.join(", ")}\n`
      }
    })
    enrichedPrompt += "\n"
  }
  
  // Add relationship data
  if (context.relationships.length > 0) {
    enrichedPrompt += "Reporting Relationships:\n"
    context.relationships.forEach((rel: any) => {
      if (rel.manager) {
        enrichedPrompt += `- ${rel.person.name} reports to ${rel.manager.name}\n`
      }
      if (rel.directReports.length > 0) {
        enrichedPrompt += `- ${rel.person.name} manages: ${rel.directReports.map((r: any) => r.name).join(", ")}\n`
      }
    })
    enrichedPrompt += "\n"
  }
  
  // Add Enneagram insights
  if (Object.keys(context.enneagramInsights.profiles).length > 0) {
    enrichedPrompt += "Personality Insights (Enneagram):\n"
    Object.values(context.enneagramInsights.profiles).forEach((insight: any) => {
      const { person, profile } = insight
      enrichedPrompt += `- ${person.name} (Type ${person.enneagram_type} - ${profile.name}):\n`
      enrichedPrompt += `  Strengths: ${profile.strengths.join(", ")}\n`
      enrichedPrompt += `  Communication style: ${profile.communication}\n`
    })
    enrichedPrompt += "\n"
  }
  
  // Add team compatibility analysis
  if (context.enneagramInsights.teamCompatibility) {
    const { compatibility, strengths, challenges, recommendations } = context.enneagramInsights.teamCompatibility
    enrichedPrompt += `Team Compatibility Analysis:\n`
    enrichedPrompt += `- Overall Compatibility: ${compatibility}%\n`
    if (strengths.length > 0) {
      enrichedPrompt += `- Strengths: ${strengths.join("; ")}\n`
    }
    if (challenges.length > 0) {
      enrichedPrompt += `- Challenges: ${challenges.join("; ")}\n`
    }
    if (recommendations.length > 0) {
      enrichedPrompt += `- Recommendations: ${recommendations.join("; ")}\n`
    }
    enrichedPrompt += "\n"
  }
  
  // Add document references
  if (context.documents.length > 0) {
    enrichedPrompt += "Relevant Documents:\n"
    context.documents.forEach((doc: any) => {
      enrichedPrompt += `- "${doc.title}"`
      if (doc.description) enrichedPrompt += ` - ${doc.description}`
      enrichedPrompt += "\n"
    })
    enrichedPrompt += "\n"
  }
  
  // Add recommendations
  if (context.recommendations.length > 0) {
    enrichedPrompt += "System Recommendations:\n"
    context.recommendations.forEach((rec: string) => {
      enrichedPrompt += `- ${rec}\n`
    })
    enrichedPrompt += "\n"
  }
  
  enrichedPrompt += "Please provide a helpful response based on the above context and data."
  
  return enrichedPrompt
}
