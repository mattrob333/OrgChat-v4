"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getPersonById } from "@/lib/hr-intelligence"
import type { Person as DatabasePerson } from "@/types/database"

import HeaderBar from "@/components/workspace/header-bar"
import AlertsPanel from "@/components/workspace/alerts-panel"
import MainWorkspaceTabs from "@/components/workspace/main-workspace-tabs"
import RightInfoPanel from "@/components/workspace/right-info-panel"
import AICompanionsDock from "@/components/workspace/ai-companions-dock"
import DocSelector from "@/components/workspace/doc-selector"

import { Loader2 } from "lucide-react"

// Transform database person to frontend person format
const transformPerson = (dbPerson: DatabasePerson): any => ({
  id: dbPerson.id,
  name: dbPerson.name,
  role: dbPerson.role,
  department: dbPerson.department_id,
  email: dbPerson.email,
  image: dbPerson.image,
  responsibilities: dbPerson.responsibilities,
  bio: dbPerson.bio,
})

export default function EmployeeWorkspacePage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  const [employee, setEmployee] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(true)

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const foundEmployee = await getPersonById(employeeId)
        if (foundEmployee) {
          setEmployee(transformPerson(foundEmployee))
        }
      } catch (err) {
        console.error("Error fetching employee:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployee()
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

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Alerts Panel (Left) */}
        <AlertsPanel 
          isOpen={isAlertsPanelOpen} 
          setIsOpen={setIsAlertsPanelOpen} 
          employeeId={employee.id} 
          className="border-r border-[hsl(var(--border))]" 
        />

        {/* Central Workspace Tabs */}
        <div className="flex-1 flex flex-col bg-[hsl(var(--workspace-background))] min-h-0">
          <MainWorkspaceTabs employeeId={employee.id} />
        </div>

        {/* Right Info Panel - Hidden on mobile */}
        <div className="hidden lg:block w-80 bg-[hsl(var(--panel-bg))] overflow-hidden border-l border-[hsl(var(--border))]">
          <RightInfoPanel employeeId={employee.id} />
        </div>
      </main>

      {/* AI Experts Dock & Docs Context Selector (Bottom) */}
      <footer className="h-20 border-t border-[hsl(var(--border))] bg-[hsl(var(--panel-bg))] shadow-inner p-3 flex items-center justify-between">
        <AICompanionsDock employeeId={employee.id} />
        <DocSelector employeeId={employee.id} />
      </footer>
    </div>
  )
}
