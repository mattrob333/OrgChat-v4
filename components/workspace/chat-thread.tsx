"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  sender: {
    id: string
    name: string
    avatar?: string
    isCurrentUser?: boolean
  }
  content: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
}

const mockMessages: Message[] = [
  {
    id: "1",
    sender: {
      id: "sarah",
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
    },
    content: "Hi! I've reviewed the Q3 budget proposals. Can we discuss the marketing allocation?",
    timestamp: new Date(2025, 6, 22, 9, 30),
    status: "read",
  },
  {
    id: "2",
    sender: {
      id: "current",
      name: "You",
      isCurrentUser: true,
    },
    content: "Of course! I noticed they're requesting a 20% increase. Do you have the ROI projections from Q2?",
    timestamp: new Date(2025, 6, 22, 9, 35),
    status: "read",
  },
  {
    id: "3",
    sender: {
      id: "sarah",
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
    },
    content: "Yes, I'll send them over. The summer campaign exceeded targets by 15%.",
    timestamp: new Date(2025, 6, 22, 9, 37),
    status: "read",
  },
  {
    id: "4",
    sender: {
      id: "sarah",
      name: "Sarah Chen",
      avatar: "/avatars/sarah.jpg",
    },
    content: "📊 Q2_Marketing_ROI_Report.pdf",
    timestamp: new Date(2025, 6, 22, 9, 38),
    status: "read",
  },
  {
    id: "5",
    sender: {
      id: "current",
      name: "You",
      isCurrentUser: true,
    },
    content: "Perfect, thanks! Let's schedule a meeting with the finance team to finalize.",
    timestamp: new Date(2025, 6, 22, 9, 40),
    status: "delivered",
  },
]

export default function ChatThread({ recipientName = "Sarah Chen" }: { recipientName?: string }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate recipient typing
    const typingTimer = setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }, 5000)

    return () => clearTimeout(typingTimer)
  }, [messages])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: {
          id: "current",
          name: "You",
          isCurrentUser: true,
        },
        content: newMessage,
        timestamp: new Date(),
        status: "sent",
      }
      setMessages([...messages, message])
      setNewMessage("")

      // Simulate message delivery
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" as const } : msg)),
        )
      }, 1000)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--workspace-background))]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatars/sarah.jpg" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <p className="text-xs text-muted-foreground">VP of Marketing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="px-6 py-5 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.sender.isCurrentUser && "flex-row-reverse")}
            >
              {!message.sender.isCurrentUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "flex flex-col gap-1 max-w-[70%]",
                  message.sender.isCurrentUser && "items-end",
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-3 py-2",
                    message.sender.isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-[hsl(var(--panel-bg))]",
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.sender.isCurrentUser && message.status && (
                    <span className="text-xs">
                      {message.status === "sent" && "✓"}
                      {message.status === "delivered" && "✓✓"}
                      {message.status === "read" && <span className="text-primary">✓✓</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/sarah.jpg" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="bg-[hsl(var(--panel-bg))] rounded-lg px-3 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-[hsl(var(--border))] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex gap-2"
        >
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[hsl(var(--panel-bg))]"
          />
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
            <Smile className="h-4 w-4" />
          </Button>
          <Button type="submit" size="icon" className="h-9 w-9">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
