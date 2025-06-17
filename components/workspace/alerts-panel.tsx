"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertsPanelProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  employeeId: string
  className?: string
}

interface Alert {
  id: string
  type: "warning" | "info" | "success" | "urgent"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionRequired?: boolean
}

export default function AlertsPanel({ isOpen, setIsOpen, employeeId, className }: AlertsPanelProps) {
  // Mock alerts - in real implementation, fetch from Supabase
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      type: "urgent",
      title: "Performance Review Due",
      message: "Your Q4 performance review is due in 2 days. Please complete the self-assessment.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      actionRequired: true
    },
    {
      id: "2",
      type: "warning",
      title: "Meeting Conflict",
      message: "You have overlapping meetings scheduled for tomorrow at 2 PM.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionRequired: true
    },
    {
      id: "3",
      type: "info",
      title: "New Team Member",
      message: "Sarah Chen has joined your team as a Junior Developer.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      actionRequired: false
    },
    {
      id: "4",
      type: "success",
      title: "Project Milestone",
      message: "Great job! The Q4 project milestone has been completed ahead of schedule.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
      actionRequired: false
    }
  ])

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertBadgeColor = (type: Alert["type"]) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) {
      return "Just now"
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const markAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ))
  }

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <div className={cn(
      "flex flex-col h-full bg-[hsl(var(--panel-bg))] transition-all duration-300",
      isOpen ? "w-full md:w-60" : "w-14",
      className
    )}>
      {/* Header with toggle button */}
      <div className="p-3 border-b border-[hsl(var(--border))]">
        {isOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-semibold">Alerts</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-8 w-8 p-0 relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </Button>
        )}
      </div>

      {/* Alerts List */}
      {isOpen && (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  alert.read 
                    ? "bg-[hsl(var(--panel-bg))] border-[hsl(var(--border))] opacity-60" 
                    : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--border))] hover:bg-slate-800",
                  alert.type === "urgent" && !alert.read && "border-red-500/50"
                )}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "mt-0.5",
                    alert.type === "warning" && "text-yellow-500",
                    alert.type === "info" && "text-blue-500",
                    alert.type === "success" && "text-green-500",
                    alert.type === "urgent" && "text-red-500"
                  )}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          dismissAlert(alert.id)
                        }}
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      {alert.actionRequired && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
