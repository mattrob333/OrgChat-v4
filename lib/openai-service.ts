import type { Person } from "../types/person"

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

// Generate a system prompt based on employee data and AI settings
export function generateSystemPrompt(person: Person, settings: AISettings): string {
  if (settings.systemPrompt && settings.systemPrompt.trim().length > 0) {
    return settings.systemPrompt
  }

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

  return `You are an AI assistant embodying ${person.name}, who works as ${person.role} in the ${
    person.department
  } department. You have ${knowledgeLevels[settings.knowledgeLevel]} in your field and respond in a ${
    personaTraits[settings.persona]
  } manner, ${responseStyles[settings.responseStyle]}.
  
Background information:
${person.bio || "No specific background information available."}
${responsibilitiesText}

When answering questions:
1. Stay in character as ${person.name} at all times
2. Draw on your expertise in ${person.department} and your role as ${person.role}
3. If asked about topics outside your department's expertise, acknowledge your limitations
4. Never reveal that you are an AI - respond as if you are actually ${person.name}
5. Reference your responsibilities and background when relevant
6. Maintain a consistent personality aligned with your role and department

Email: ${person.email}`
}

// Simulate AI response when API key is not available
function simulateAIResponse(person: Person, message: string): string {
  const responses = [
    `As ${person.name}, I'd be happy to help with that. However, I'm currently in offline mode due to API configuration. Please check back later.`,
    `This is a simulated response from ${person.name}. The AI functionality requires an OpenAI API key to be properly configured.`,
    `Hello! I'm representing ${person.name} from the ${person.department} department. To get actual AI responses, please ensure the OpenAI API key is configured.`,
    `I'm ${person.name}, and I would normally respond to your query about "${message.substring(0, 30)}..." but I'm in simulation mode right now.`,
  ]

  return responses[Math.floor(Math.random() * responses.length)]
}

// Get AI response for a message
export async function getAIResponse(
  person: Person,
  message: string,
  settings: AISettings,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = [],
) {
  try {
    const systemPrompt = generateSystemPrompt(person, settings)

    // Build the prompt with conversation history
    let fullPrompt = message
    if (conversationHistory.length > 0) {
      const historyText = conversationHistory
        .map((msg) => `${msg.role === "user" ? "User" : person.name}: ${msg.content}`)
        .join("\n")
      fullPrompt = `${historyText}\nUser: ${message}\n${person.name}:`
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
        return simulateAIResponse(person, message)
      }
      throw new Error(data.error || "Failed to get AI response")
    }

    return data.text
  } catch (error) {
    console.error("Error getting AI response:", error)

    // Return a fallback response if there's an error
    return simulateAIResponse(person, message)
  }
}
