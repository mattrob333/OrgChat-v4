"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { allOrgPeopleList } from "../../../lib/org-data-mock"
import type { Person } from "../../../types/person"

import HeaderBar from "@/components/workspace/header-bar"
import AlertsPanel from "@/components/workspace/alerts-panel"
import MainWorkspaceTabs from "@/components/workspace/main-workspace-tabs" // New Tabs component
import ActionPanel from "@/components/workspace/action-panel" // New ActionPanel component
import AICompanionsDock from "@/components/workspace/ai-companions-dock"
import DocSelector from "@/components/workspace/doc-selector"

import { Loader2 } from "lucide-react"

export default function EmployeeWorkspacePage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  const [employee, setEmployee] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(true)

  useEffect(() => {
    if (employeeId) {
      const foundEmployee = allOrgPeopleList.find((p) => p.id === employeeId)
      setEmployee(foundEmployee || null)
      setLoading(false)
    }
  }, [employeeId])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[hsl(var(--workspace-background))] text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[hsl(var(--workspace-background))] text-foreground">
        Employee not found.
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-[hsl(var(--workspace-background))] text-foreground overflow-hidden pointer-events-auto">
      <HeaderBar employee={employee} />

      <div className="flex flex-1 overflow-hidden">
        {/* Alerts Panel (Left) */}
        <AlertsPanel isOpen={isAlertsPanelOpen} setIsOpen={setIsAlertsPanelOpen} employeeId={employee.id} />

        {/* Main Content Area: Central Workspace Tabs and Right Action Panel */}
        <main className="flex-1 grid grid-cols-12 gap-px bg-[hsl(var(--workspace-border))] overflow-hidden">
          {/* Central Workspace Tabs (col-span-8 or 9) */}
          <div className="col-span-8 flex flex-col bg-[hsl(var(--workspace-background))] relative z-10 pointer-events-auto">
            {" "}
            {/* Adjusted from col-span-6 */}
            <MainWorkspaceTabs employee={employee} />
          </div>

          {/* Right Action Panel (col-span-4 or 3) */}
          <div className="col-span-4 flex flex-col bg-[hsl(var(--workspace-background))] p-4 overflow-y-auto relative z-10 pointer-events-auto">
            {" "}
            {/* Adjusted from col-span-4 */}
            <ActionPanel employeeId={employee.id} />
          </div>
        </main>
      </div>

      {/* AI Experts Dock & Docs Context Selector (Bottom) */}
      <footer className="h-20 border-t border-[hsl(var(--workspace-border))] bg-[hsl(var(--workspace-panel-background))] shadow-inner p-3 flex items-center justify-between">
        <AICompanionsDock />
        <DocSelector employeeId={employee.id} />
      </footer>
    </div>
  )
}
