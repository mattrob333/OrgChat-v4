"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateAIResponse } from "@/lib/ai-chat-service"
import { Send, Bot, User } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatPanelProps {
  embedded?: boolean
}

export function AIChatPanel({ embedded = false }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your HR and Project Management Assistant. I have knowledge of your team's skills and roles. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel is opened
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

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

    try {
      // Get AI response
      const aiResponse = await generateAIResponse(input)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again later.",
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

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <div className="flex items-start gap-2">
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-assistant-concept.png" alt="AI" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}

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

              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-assistant-concept.png" alt="AI" />
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Textarea
            ref={inputRef}
            placeholder="Ask about team members for projects..."
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
