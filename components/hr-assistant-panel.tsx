"use client"

import { useState } from "react"
import { AIChatPanel } from "./ai-chat-panel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Brain, Target, Sparkles } from "lucide-react"

interface HRAssistantPanelProps {
  isOpen: boolean
  embedded?: boolean
  onClose?: () => void
}

export function HRAssistantPanel({ isOpen, embedded = false, onClose }: HRAssistantPanelProps) {
  if (!isOpen) return null

  // Default AI settings for HR Assistant
  const hrAssistantSettings = {
    model: "gpt-4o" as const,
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: "", // Will be generated dynamically
    knowledgeLevel: "expert" as const,
    responseStyle: "balanced" as const,
    persona: "professional" as const,
  }

  return (
    <div className="flex h-full flex-col">
      {!embedded && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              HR Assistant - Team Orchestrator
            </CardTitle>
            <CardDescription>
              Your intelligent team orchestrator with complete knowledge of all team members, their skills, and personality types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Complete Team Knowledge</p>
                  <p className="text-muted-foreground">I know every team member's skills, enneagram type, and work style</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Intelligent Task Delegation</p>
                  <p className="text-muted-foreground">I can match tasks to the most suitable team members based on their capabilities</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Team Optimization</p>
                  <p className="text-muted-foreground">I suggest optimal team formations considering skills and personality compatibility</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex-1 overflow-hidden">
        <AIChatPanel
          personId="hr-assistant"
          aiSettings={hrAssistantSettings}
          embedded={embedded}
        />
      </div>
    </div>
  )
}
