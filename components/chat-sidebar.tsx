"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, MessageSquare, User } from "lucide-react"
import EmployeePanel from "../employee-panel"
import { cn } from "@/lib/utils"
import type { Person } from "../types/person"

interface ChatSidebarProps {
  className?: string
}

export default function ChatSidebar({ className }: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<"hr" | "employee">("hr")
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  // Listen for custom events to select a person
  useEffect(() => {
    const handleSelectPerson = (event: CustomEvent<Person>) => {
      setSelectedPerson(event.detail)
      setActiveTab("employee")
      setIsCollapsed(false) // Expand sidebar when a person is selected
    }

    window.addEventListener("selectPerson" as any, handleSelectPerson as EventListener)

    return () => {
      window.removeEventListener("selectPerson" as any, handleSelectPerson as EventListener)
    }
  }, [])

  return (
    <div
      className={cn(
        "relative flex flex-col border-l border-border bg-card transition-all duration-300",
        isCollapsed ? "w-12" : "w-[400px]",
        className,
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-4 h-6 w-6 rounded-full border border-border bg-background shadow-sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronRight className={cn("h-4 w-4 transition-transform", isCollapsed ? "rotate-0" : "rotate-180")} />
        <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} sidebar</span>
      </Button>

      {/* Sidebar Content */}
      <div className={cn("flex-1 overflow-hidden", isCollapsed ? "invisible" : "visible")}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "hr" | "employee")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hr" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>HR Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="employee" disabled={!selectedPerson} className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{selectedPerson ? "Employee" : "Select Employee"}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="hr" className="h-[calc(100vh-48px)] overflow-hidden">
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">HR Assistant Chat Panel</p>
            </div>
          </TabsContent>
          <TabsContent value="employee" className="h-[calc(100vh-48px)] overflow-hidden">
            {selectedPerson ? (
              <EmployeePanel 
                person={selectedPerson} 
                isOpen={true}
                embedded={true} 
                onClose={() => setActiveTab("hr")} 
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Select an employee from the org chart</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Collapsed View */}
      {isCollapsed && (
        <div className="flex flex-col items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => {
              setIsCollapsed(false)
              setActiveTab("hr")
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="sr-only">HR Assistant</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            disabled={!selectedPerson}
            onClick={() => {
              setIsCollapsed(false)
              setActiveTab("employee")
            }}
          >
            <User className="h-4 w-4" />
            <span className="sr-only">Employee</span>
          </Button>
        </div>
      )}
    </div>
  )
}
