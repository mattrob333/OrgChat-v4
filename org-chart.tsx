"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Users, RefreshCw, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import EmployeePanel from "./employee-panel"
import type { Person } from "./types/person"
import type { OrgChartPerson } from "./types/database"
import { getOrgChartData, getOrganizations } from "@/lib/org-service"

interface OrgNodeProps {
  person: OrgChartPerson
  level: number
  isLast: boolean
  onSelectPerson: (person: Person) => void
}

const OrgNode = ({ person, level, isLast, onSelectPerson }: OrgNodeProps) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = person.children && person.children.length > 0

  return (
    <div className="relative group">
      <div className={cn("flex items-start", level > 0 && "pl-6 relative")}>
        {level > 0 && (
          <>
            <div className="absolute left-0 top-4 w-5 border-t border-border" />
            <div className={cn("absolute left-0 h-full border-l border-border", isLast ? "h-4" : "")} />
          </>
        )}

        <Card
          className="w-full p-4 shadow-sm hover:shadow-md transition-shadow border border-border bg-card cursor-pointer hover:border-primary/30"
          onClick={(e) => {
            e.stopPropagation()
            onSelectPerson(person as unknown as Person)
          }}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={person.image || "/placeholder.svg"} alt={person.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {person.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm sm:text-base truncate">{person.name}</h3>
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(!expanded)
                    }}
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">Toggle</span>
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{person.role}</p>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{person.email}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1 text-primary/70" />
                <span>{person.department}</span>
                {hasChildren && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • {person.children.length} direct report{person.children.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {person.children.map((child, index) => (
            <OrgNode
              key={child.id}
              person={child}
              level={level + 1}
              isLast={index === person.children!.length - 1}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface OrgChartProps {
  onSelectPerson?: (person: Person) => void
  containerWidth?: number
  organizationId?: string
}

export default function OrgChart({ onSelectPerson, containerWidth, organizationId }: OrgChartProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)
  
  // Add state for loading, error, and organization data
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orgData, setOrgData] = useState<OrgChartPerson | null>(null)
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string | undefined>(organizationId)

  // Fetch organization data
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const orgs = await getOrganizations()
        setOrganizations(orgs.map(org => ({ id: org.id, name: org.name })))
        
        // If no organizationId is provided and we have organizations, use the first one
        if (!selectedOrgId && orgs.length > 0) {
          setSelectedOrgId(orgs[0].id)
        }
      } catch (err) {
        console.error("Error fetching organizations:", err)
      }
    }
    
    fetchOrganizations()
  }, [organizationId, selectedOrgId])

  // Fetch org chart data when selectedOrgId changes
  useEffect(() => {
    async function fetchOrgChartData() {
      if (!selectedOrgId) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const data = await getOrgChartData(selectedOrgId)
        if (data) {
          setOrgData(data)
        } else {
          setError("No organization data found. Please upload your organization chart data.")
        }
      } catch (err) {
        console.error("Error fetching org chart data:", err)
        setError("Failed to load organization chart. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrgChartData()
  }, [selectedOrgId])

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person)
    setIsPanelOpen(true)

    // If an external handler is provided, call it
    if (onSelectPerson) {
      onSelectPerson(person)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }
  
  // Refresh data
  const handleRefreshData = async () => {
    if (!selectedOrgId) return
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await getOrgChartData(selectedOrgId)
      if (data) {
        setOrgData(data)
      } else {
        setError("No organization data found. Please upload your organization chart data.")
      }
    } catch (err) {
      console.error("Error refreshing org chart data:", err)
      setError("Failed to refresh organization chart. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render loading state
  const renderLoading = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium mb-2">Loading Organization Chart</h3>
        <p className="text-sm text-muted-foreground text-center">
          Please wait while we fetch your organization data...
        </p>
      </div>
    )
  }

  // Render error state
  const renderError = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Organization Chart</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Render empty state
  const renderEmpty = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Organization Data</AlertTitle>
          <AlertDescription>
            No organization chart data found. Please upload your organization structure using the CSV upload tool.
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/upload"}>
                Upload Organization Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 w-full h-full overflow-auto bg-background">
      {isLoading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : !orgData ? (
        renderEmpty()
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Company Organization Chart</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="border-primary/20 hover:border-primary hover:bg-primary/10"
              >
                {expanded ? "Collapse All" : "Expand All"}
              </Button>
              <Button
                variant="outline"
                onClick={handleRefreshData}
                className="border-primary/20 hover:border-primary hover:bg-primary/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-4 mt-6">
            <OrgNode person={orgData} level={0} isLast={true} onSelectPerson={handleSelectPerson} />
          </div>
        </>
      )}

      {/* Only show the panel if we're not using the sidebar integration */}
      {!onSelectPerson && <EmployeePanel person={selectedPerson} isOpen={isPanelOpen} onClose={handleClosePanel} />}
    </div>
  )
}
