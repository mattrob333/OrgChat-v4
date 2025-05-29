"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAIResponse, type AISettings, defaultAISettings } from "@/lib/openai-service"
import { Send, Bot, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPersonById } from "@/lib/supabase"
import type { Person as PersonType } from "@/types/database"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatPanelProps {
  embedded?: boolean
  personId?: string
  aiSettings?: Partial<AISettings>
  avatarUrl?: string
  initialMessage?: string
}

export function AIChatPanel({ 
  embedded = false, 
  personId,
  aiSettings,
  avatarUrl = "/ai-assistant-concept.png",
  initialMessage
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [personInfo, setPersonInfo] = useState<PersonType | null>(null)
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Merge provided AI settings with defaults
  const mergedAISettings: AISettings = {
    ...defaultAISettings,
    ...aiSettings
  }

  // Fetch person info if personId is provided
  useEffect(() => {
    async function fetchPersonInfo() {
      if (personId) {
        try {
          const person = await getPersonById(personId)
          setPersonInfo(person)
        } catch (error) {
          console.error("Error fetching person info:", error)
          setError("Could not load person information")
        }
      }
    }
    
    fetchPersonInfo()
  }, [personId])

  // Set initial message
  useEffect(() => {
    const defaultMessage = personId 
      ? `Hello! I'm an AI assistant representing ${personInfo?.name || "your colleague"}. How can I help you today?`
      : "Hello! I'm your HR and Project Management Assistant. I have knowledge of your team's skills, roles, and organization structure. How can I help you today?"
    
    setMessages([{
      id: "1",
      role: "assistant",
      content: initialMessage || defaultMessage,
      timestamp: new Date()
    }])
  }, [initialMessage, personId, personInfo])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel is opened
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: input }
    ]
    setConversationHistory(updatedHistory)

    try {
      // Get AI response
      const aiResponse = await getAIResponse(
        personId || "hr-assistant", // Use personId if available, otherwise use "hr-assistant"
        input,
        mergedAISettings,
        updatedHistory
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Update conversation history with AI response
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse }
      ])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setError("Failed to get a response. Please try again.")

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Get the appropriate avatar image and fallback
  const getAvatar = (role: "user" | "assistant") => {
    if (role === "user") {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )
    } else {
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={personInfo?.image || avatarUrl} alt={personInfo?.name || "AI"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {personInfo?.name ? 
              personInfo.name.split(" ").map(part => part[0]).join("") : 
              <Bot className="h-4 w-4" />
            }
          </AvatarFallback>
        </Avatar>
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <div className="flex items-start gap-2">
              {message.role === "assistant" && getAvatar("assistant")}

              <div
                className={`p-3 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground ml-auto"
                } max-w-[85%]`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.role === "user" && getAvatar("user")}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2">
            {getAvatar("assistant")}
            <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Textarea
            ref={inputRef}
            placeholder={personId ? `Ask ${personInfo?.name || "this person"} a question...` : "Ask about team members, projects, or organization structure..."}
            className="min-h-[60px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
