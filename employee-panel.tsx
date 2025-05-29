"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X, Settings, Send, User, Bot, Calendar, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getAIResponse } from "./lib/openai-service"
import { useSettingsStore } from "./lib/settings-store"
import type { Person, Message } from "./types/person"
import AISettingsPanel from "./ai-settings-panel"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EmployeePanelProps {
  person: Person | null
  isOpen: boolean
  onClose: () => void
  embedded?: boolean
}

export default function EmployeePanel({ person, isOpen, onClose, embedded = false }: EmployeePanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const getSettings = useSettingsStore((state) => state.getSettings)

  // Add a welcome message when a new person is selected
  useEffect(() => {
    if (person) {
      setMessages([
        {
          id: "welcome",
          content: `Hello! I'm an AI assistant for ${person.name}. How can I help you today?`,
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    }
  }, [person])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isOpen])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !person) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Get conversation history for context
      const conversationHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        }))

      // Get AI settings for this employee
      const settings = getSettings(person.id)

      // Get AI response
      const response = await getAIResponse(person, inputValue, settings, conversationHistory)

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      // Check if the error is related to the API key
      if (error instanceof Error && error.message.includes("API key")) {
        setApiKeyMissing(true)
      }

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle calendar check
  const handleCheckCalendar = () => {
    // This would be replaced with actual calendar integration
    alert(`Checking calendar for ${person?.name}`)
  }

  // Toggle details section
  const toggleDetails = () => {
    setIsDetailsExpanded(!isDetailsExpanded)
  }

  if (!person) return null

  // If embedded in sidebar, render without modal/backdrop
  if (embedded) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Employee Profile</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckCalendar}
              className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary"
            >
              <Calendar className="h-4 w-4" />
              <span>Open Calendar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>

        {/* Settings Panel (conditionally rendered) */}
        {isSettingsOpen && <AISettingsPanel person={person} onClose={() => setIsSettingsOpen(false)} />}

        {/* Collapsible Employee Details */}
        <div className="border-b border-border">
          {/* Basic Info - Always Visible */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={person.image || "/placeholder.svg"} alt={person.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-primary/90 text-sm font-medium">{person.role}</p>
                <p className="text-muted-foreground text-xs">{person.department}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDetails}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              {isDetailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">{isDetailsExpanded ? "Collapse" : "Expand"} details</span>
            </Button>
          </div>

          {/* Extended Details - Collapsible */}
          {isDetailsExpanded && (
            <div className="px-4 pb-4 bg-card/50 space-y-3">
              <p className="text-muted-foreground text-xs">{person.email}</p>

              {person.responsibilities && person.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1">Responsibilities:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {person.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {person.bio && <p className="text-xs text-muted-foreground">{person.bio}</p>}
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* API Key Missing Alert */}
          {apiKeyMissing && (
            <Alert variant="warning" className="m-4 border-amber-500 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500">OpenAI API Key Missing</AlertTitle>
              <AlertDescription className="text-sm">
                The OpenAI API key is not configured. Responses are simulated. Please add your API key in the Vercel
                project settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[75%]",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[75%]">
                  <div className="flex space-x-2 items-center h-5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask ${person.name} something...`}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Original modal implementation for non-embedded use
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full sm:w-[450px] md:w-[550px] bg-card border-l border-border shadow-xl transition-transform duration-300 transform flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Employee Profile</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckCalendar}
              className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary"
            >
              <Calendar className="h-4 w-4" />
              <span>Open Calendar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-primary/10 hover:text-primary">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Collapsible Employee Details */}
        <div className="border-b border-border">
          {/* Basic Info - Always Visible */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-border">
                <AvatarImage src={person.image || "/placeholder.svg"} alt={person.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {person.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{person.name}</h3>
                <p className="text-primary/90 text-sm font-medium">{person.role}</p>
                <p className="text-muted-foreground text-xs">{person.department}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDetails}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
            >
              {isDetailsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">{isDetailsExpanded ? "Collapse" : "Expand"} details</span>
            </Button>
          </div>

          {/* Extended Details - Collapsible */}
          {isDetailsExpanded && (
            <div className="px-4 pb-4 bg-card/50 space-y-3">
              <p className="text-muted-foreground text-xs">{person.email}</p>

              {person.responsibilities && person.responsibilities.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-1">Responsibilities:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {person.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {person.bio && <p className="text-xs text-muted-foreground">{person.bio}</p>}
            </div>
          )}
        </div>

        {/* Settings Panel (conditionally rendered) */}
        {isSettingsOpen && <AISettingsPanel person={person} onClose={() => setIsSettingsOpen(false)} />}

        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* API Key Missing Alert */}
          {apiKeyMissing && (
            <Alert variant="warning" className="m-4 border-amber-500 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500">OpenAI API Key Missing</AlertTitle>
              <AlertDescription className="text-sm">
                The OpenAI API key is not configured. Responses are simulated. Please add your API key in the Vercel
                project settings.
              </AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
              >
                {message.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 max-w-[75%]",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-secondary text-secondary-foreground rounded-lg p-3 max-w-[75%]">
                  <div className="flex space-x-2 items-center h-5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask ${person.name} something...`}
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 p-0 rounded-full bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
