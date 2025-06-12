import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt, model, temperature, maxTokens, topP, frequencyPenalty, presencePenalty } =
      await request.json()

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 })
    }

    // Use the provided system prompt
    if (!systemPrompt) {
      return NextResponse.json({ error: "System prompt is required" }, { status: 400 })
    }

    const response = await generateText({
      model: openai(model || "gpt-4o"),
      prompt,
      system: systemPrompt,
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
