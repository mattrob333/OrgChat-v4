"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Move, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import EmployeePanel from "./employee-panel"
import type { Person } from "./types/person"
import type { OrgChartPerson } from "./types/database"
import SettingsButton from "./settings-button"
import { getOrgChartData, getOrganizations } from "@/lib/org-service"

interface NodePosition {
  x: number
  y: number
  width: number
  height: number
}

interface NodeMap {
  [key: string]: NodePosition
}

interface OrgTreeCanvasProps {
  onSelectPerson?: (person: Person) => void
  containerWidth?: number
  containerHeight?: number
  organizationId?: string
}

export default function OrgTreeCanvas({
  onSelectPerson,
  containerWidth = 800,
  containerHeight = 600,
  organizationId,
}: OrgTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [positions, setPositions] = useState<NodeMap>({})
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 3000, height: 2000 })
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isNodeClicked, setIsNodeClicked] = useState(false)
  const [autoFit, setAutoFit] = useState(true)
  
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
  }, [organizationId])

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

  // Calculate tree layout and auto-fit to container
  useEffect(() => {
    if (!orgData) return
    
    const calculateTreeLayout = () => {
      const nodeWidth = 220
      const nodeHeight = 100
      const horizontalSpacing = 60
      const verticalSpacing = 100
      const positions: NodeMap = {}

      // Calculate tree depth and width
      const getTreeDimensions = (node: OrgChartPerson) => {
        if (!node.children || node.children.length === 0) {
          return { depth: 0, width: 1 }
        }

        let width = 0
        let maxDepth = 0

        for (const child of node.children) {
          const dimensions = getTreeDimensions(child)
          width += dimensions.width
          maxDepth = Math.max(maxDepth, dimensions.depth)
        }

        return { depth: maxDepth + 1, width }
      }

      // Position nodes
      const positionNode = (node: OrgChartPerson, depth: number, horizontalOffset: number, widthUnits: number) => {
        const x = horizontalOffset + (widthUnits * (nodeWidth + horizontalSpacing)) / 2 - nodeWidth / 2
        const y = depth * (nodeHeight + verticalSpacing)

        positions[node.id] = { x, y, width: nodeWidth, height: nodeHeight }

        if (!node.children || node.children.length === 0) {
          return widthUnits
        }

        let currentOffset = horizontalOffset
        for (const child of node.children) {
          const childDimensions = getTreeDimensions(child)
          const childWidthUnits = childDimensions.width || 1
          positionNode(child, depth + 1, currentOffset, childWidthUnits)
          currentOffset += childWidthUnits * (nodeWidth + horizontalSpacing)
        }

        return widthUnits
      }

      const dimensions = getTreeDimensions(orgData)
      positionNode(orgData, 0, 0, dimensions.width || 1)

      // Calculate canvas size based on node positions
      let maxX = 0
      let maxY = 0

      Object.values(positions).forEach((pos) => {
        maxX = Math.max(maxX, pos.x + pos.width + horizontalSpacing)
        maxY = Math.max(maxY, pos.y + pos.height + verticalSpacing)
      })

      setCanvasSize({ width: maxX, height: maxY })
      setPositions(positions)

      // Auto-fit to container if needed
      if (autoFit && containerWidth && containerHeight) {
        const scaleX = (containerWidth - 40) / maxX // 40px padding
        const scaleY = (containerHeight - 40) / maxY
        const newScale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 100%

        setScale(newScale)
        setTranslate({
          x: (containerWidth - maxX * newScale) / 2 / newScale,
          y: 20 / newScale,
        })
      }
    }

    calculateTreeLayout()
  }, [orgData, containerWidth, containerHeight, autoFit])

  // Find person by ID
  const findPersonById = (id: string, node: OrgChartPerson = orgData as OrgChartPerson): OrgChartPerson | null => {
    if (!node) return null
    if (node.id === id) return node

    if (node.children) {
      for (const child of node.children) {
        const found = findPersonById(id, child)
        if (found) return found
      }
    }

    return null
  }

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isNodeClicked) return // Only left mouse button and not on node click
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const dx = e.clientX - startPos.x
    const dy = e.clientY - startPos.y
    setTranslate((prev) => ({ x: prev.x + dx / scale, y: prev.y + dy / scale }))
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setTimeout(() => {
      setIsNodeClicked(false)
    }, 10)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2))
    setAutoFit(false)
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
    setAutoFit(false)
  }

  // Reset view
  const handleResetView = () => {
    setAutoFit(true)
    // Auto-fit will be applied on next render
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

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation() // Stop event propagation
    setIsNodeClicked(true)

    const person = findPersonById(personId)
    if (person) {
      // If an external handler is provided, call it
      if (onSelectPerson) {
        onSelectPerson(person as unknown as Person)
      } else {
        // Otherwise, use the internal panel
        setSelectedPerson(person as unknown as Person)
        setIsPanelOpen(true)
      }
    }
  }

  // Handle panel close
  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  // Render connections between nodes
  const renderConnections = () => {
    if (!orgData) return null
    
    const connections: React.ReactNode[] = []

    const addConnection = (parent: OrgChartPerson, child: OrgChartPerson) => {
      const parentPos = positions[parent.id]
      const childPos = positions[child.id]

      if (!parentPos || !childPos) return

      const startX = parentPos.x + parentPos.width / 2
      const startY = parentPos.y + parentPos.height
      const endX = childPos.x + childPos.width / 2
      const endY = childPos.y

      // Draw vertical line from parent
      connections.push(
        <line
          key={`${parent.id}-${child.id}-1`}
          x1={startX}
          y1={startY}
          x2={startX}
          y2={startY + (endY - startY) / 2}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth={2}
        />,
      )

      // Draw horizontal line
      connections.push(
        <line
          key={`${parent.id}-${child.id}-2`}
          x1={startX}
          y1={startY + (endY - startY) / 2}
          x2={endX}
          y2={startY + (endY - startY) / 2}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth={2}
        />,
      )

      // Draw vertical line to child
      connections.push(
        <line
          key={`${parent.id}-${child.id}-3`}
          x1={endX}
          y1={startY + (endY - startY) / 2}
          x2={endX}
          y2={endY}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth={2}
        />,
      )
    }

    const traverseTree = (node: OrgChartPerson) => {
      if (node.children) {
        node.children.forEach((child) => {
          addConnection(node, child)
          traverseTree(child)
        })
      }
    }

    traverseTree(orgData)
    return connections
  }

  // Render nodes
  const renderNodes = () => {
    if (!orgData) return null
    
    const nodes: React.ReactNode[] = []

    const traverseTree = (node: OrgChartPerson) => {
      const pos = positions[node.id]
      if (!pos) return

      nodes.push(
        <div
          key={node.id}
          className="absolute transform-gpu"
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.width,
            height: pos.height,
          }}
        >
          <Card
            className="w-full h-full p-3 shadow-md hover:shadow-lg transition-shadow border border-border bg-card hover:border-primary/30 cursor-pointer"
            onClick={(e) => handleNodeClick(e, node.id)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={node.image || "/placeholder.svg"} alt={node.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {node.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{node.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{node.role}</p>
                <p className="text-xs text-primary/70 mt-1">{node.department}</p>
              </div>
            </div>
          </Card>
        </div>,
      )

      if (node.children) {
        node.children.forEach(traverseTree)
      }
    }

    traverseTree(orgData)
    return nodes
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
    <div
      className="relative w-full h-full overflow-hidden border border-border rounded-lg bg-background/30"
      ref={containerRef}
    >
      {isLoading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : !orgData ? (
        renderEmpty()
      ) : (
        <>
          {/* Canvas */}
          <div
            ref={canvasRef}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
              transformOrigin: "0 0",
              width: canvasSize.width,
              height: canvasSize.height,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid background */}
            <div
              className="absolute bg-grid-pattern opacity-50"
              style={{
                width: canvasSize.width,
                height: canvasSize.height,
                pointerEvents: "none",
              }}
            />

            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">{renderConnections()}</svg>

            {/* Nodes */}
            {renderNodes()}
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2 bg-background/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom In"
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetView}
              title="Reset View"
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshData}
              title="Refresh Data"
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <SettingsButton />
          </div>
        </>
      )}

      {/* Only show the panel if we're not using the sidebar integration */}
      {!onSelectPerson && <EmployeePanel person={selectedPerson} isOpen={isPanelOpen} onClose={handleClosePanel} />}
    </div>
  )
}
