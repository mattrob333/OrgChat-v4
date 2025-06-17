"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: "meeting" | "deadline" | "reminder"
}

const mockEvents: Record<string, CalendarEvent[]> = {
  "2025-07-22": [
    { id: "1", title: "Team Standup", time: "9:00 AM", type: "meeting" },
    { id: "2", title: "Budget Review", time: "2:00 PM", type: "meeting" },
  ],
  "2025-07-24": [
    { id: "3", title: "Q3 Report Due", time: "5:00 PM", type: "deadline" },
  ],
  "2025-07-25": [
    { id: "4", title: "All Hands Meeting", time: "10:00 AM", type: "meeting" },
    { id: "5", title: "Performance Reviews", time: "3:00 PM", type: "reminder" },
  ],
}

export default function CalendarPanel({ employeeId }: { employeeId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 22)) // July 22, 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
      2,
      "0",
    )}`
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateKey = formatDateKey(date)
      const hasEvents = mockEvents[dateKey] && mockEvents[dateKey].length > 0
      const isToday =
        date.toDateString() === new Date(2025, 6, 22).toDateString() // Mock "today" as July 22, 2025
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={cn(
            "aspect-square rounded-md text-sm font-medium relative transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
            isSelected && !isToday && "bg-accent text-accent-foreground",
            hasEvents && "font-bold",
          )}
        >
          {day}
          {hasEvents && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
          )}
        </button>,
      )
    }

    return days
  }

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null
  const selectedEvents = selectedDateKey ? mockEvents[selectedDateKey] || [] : []

  const getEventTypeColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400"
      case "deadline":
        return "bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400"
      case "reminder":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400"
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={`day-${index}`} className="text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="space-y-2 pt-2 border-t border-[hsl(var(--workspace-border))]">
            <h4 className="text-sm font-medium">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            {selectedEvents.length > 0 ? (
              <div className="space-y-1">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={cn("text-xs", getEventTypeColor(event.type))}>
                      {event.type}
                    </Badge>
                    <span className="font-medium">{event.time}</span>
                    <span className="text-muted-foreground truncate">{event.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events scheduled</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
