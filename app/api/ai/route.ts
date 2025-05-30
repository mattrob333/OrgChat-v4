import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// System prompt for the HR Assistant
const HR_ASSISTANT_SYSTEM_PROMPT = `You are an HR Assistant with knowledge of all employees in this organization chart. Answer questions about employees, their skills, roles, and who can help with specific tasks.

EMPLOYEE DATA:
- Eleanor Rosevelt (CEO): Strategic Leadership, Business Development
- Marcus Chen (CTO): Technology Strategy, System Architecture, Software Development
- Sophia Williams (CFO): Financial Planning, Risk Management, Budget Analysis
- James Wilson (CMO): Brand Strategy, Digital Marketing, Market Analysis
- Alexandra Peterson (CPO): Talent Acquisition, Employee Relations, HR Strategy
- Sarah Johnson (VP Engineering): Software Engineering, Team Leadership, Agile, Full-Stack Development
- John Adams (VP Infrastructure): Cloud Architecture, DevOps, Security
- Robert Brown (Product Director): Product Management, User Research, Data Analysis
- Elizabeth Clark (Marketing Director): Content Strategy, SEO/SEM, Social Media
- Michael Green (Engineering Manager): Frontend Development, React, JavaScript
- Jessica Taylor (Engineering Manager): Backend Development, Python, API Design

When asked about who can help with tasks:
- Match required skills with employee expertise
- Consider reporting structures and departments
- Provide specific names and explain why they're suitable
- For technical tasks, prioritize Technology/Engineering team members
- Suggest multiple options when relevant`

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } =
      await request.json()

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 })
    }

    // Use the HR Assistant system prompt if none is provided
    const finalSystemPrompt = systemPrompt || HR_ASSISTANT_SYSTEM_PROMPT

    const response = await generateText({
      model: openai(model || "gpt-4o"),
      prompt,
      system: finalSystemPrompt,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
      topP: topP || 1,
      frequencyPenalty: frequencyPenalty || 0,
      presencePenalty: presencePenalty || 0,
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error("Error in AI route:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
