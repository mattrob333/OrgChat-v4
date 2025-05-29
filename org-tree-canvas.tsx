"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import EmployeePanel from "./employee-panel"
import type { Person } from "./types/person"
import SettingsButton from "./settings-button"

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
}

export default function OrgTreeCanvas({
  onSelectPerson,
  containerWidth = 800,
  containerHeight = 600,
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

  // Sample organization data with responsibilities and bio
  const orgData: Person = {
    id: "1",
    name: "Eleanor Rosevelt",
    role: "Chief Executive Officer",
    department: "Executive",
    email: "eleanor.rosevelt@company.com",
    image: "/placeholder.svg?height=40&width=40",
    responsibilities: [
      "Overall company strategy and vision",
      "Executive leadership and decision making",
      "Stakeholder and board relations",
      "Company culture and values",
    ],
    bio: "Eleanor has over 20 years of experience in executive leadership roles across technology and finance sectors. She joined the company in 2018 and has led the organization through significant growth and transformation.",
    children: [
      {
        id: "2",
        name: "Marcus Chen",
        role: "Chief Technology Officer",
        department: "Technology",
        email: "marcus.chen@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Technology strategy and roadmap",
          "Engineering leadership",
          "Technical architecture oversight",
          "Innovation and R&D",
        ],
        bio: "Marcus has a background in computer science and has been with the company for 5 years. He previously worked at several leading tech companies and brings expertise in cloud infrastructure and AI.",
        children: [
          {
            id: "6",
            name: "Sarah Johnson",
            role: "VP of Engineering",
            department: "Engineering",
            email: "sarah.johnson@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Engineering team leadership",
              "Product development execution",
              "Technical hiring and team growth",
              "Engineering processes and quality",
            ],
            bio: "Sarah leads our engineering organization with a focus on scalable, maintainable software practices. She has a strong background in distributed systems and team leadership.",
            children: [
              {
                id: "10",
                name: "Michael Green",
                role: "Engineering Manager",
                department: "Engineering",
                email: "michael.green@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Frontend team management",
                  "UI/UX implementation oversight",
                  "Frontend architecture",
                  "Developer experience",
                ],
                bio: "Michael manages our frontend engineering team, focusing on creating exceptional user experiences and maintainable code.",
              },
              {
                id: "11",
                name: "Jessica Taylor",
                role: "Engineering Manager",
                department: "Engineering",
                email: "jessica.taylor@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Backend team management",
                  "API development oversight",
                  "Database architecture",
                  "System reliability",
                ],
                bio: "Jessica leads our backend engineering team with a focus on scalable architecture and system reliability. She has extensive experience in distributed systems.",
              },
            ],
          },
          {
            id: "7",
            name: "John Adams",
            role: "VP of Infrastructure",
            department: "Infrastructure",
            email: "john.adams@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Cloud infrastructure management",
              "DevOps practices",
              "System reliability and uptime",
              "Security implementation",
            ],
            bio: "John oversees our infrastructure and DevOps teams, ensuring our systems are reliable, secure, and scalable. He has a background in network engineering and cloud architecture.",
          },
        ],
      },
      {
        id: "3",
        name: "Sophia Williams",
        role: "Chief Financial Officer",
        department: "Finance",
        email: "sophia.williams@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Financial strategy and planning",
          "Budgeting and forecasting",
          "Investor relations",
          "Financial reporting and compliance",
        ],
        bio: "Sophia leads our finance organization with expertise in strategic financial planning and investor relations. She has an MBA and previously worked in investment banking.",
        children: [
          {
            id: "8",
            name: "Robert Brown",
            role: "Finance Director",
            department: "Finance",
            email: "robert.brown@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: ["Financial analysis", "Budget management", "Financial reporting", "Audit coordination"],
            bio: "Robert manages our financial reporting and analysis team. He has a background in accounting and financial management.",
          },
        ],
      },
      {
        id: "4",
        name: "James Wilson",
        role: "Chief Marketing Officer",
        department: "Marketing",
        email: "james.wilson@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: ["Marketing strategy", "Brand management", "Customer acquisition", "Market research"],
        bio: "James leads our marketing efforts with a focus on brand development and customer acquisition. He has extensive experience in digital marketing and brand strategy.",
        children: [
          {
            id: "9",
            name: "Elizabeth Clark",
            role: "Marketing Director",
            department: "Marketing",
            email: "elizabeth.clark@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: ["Campaign management", "Content strategy", "Digital marketing", "Marketing analytics"],
            bio: "Elizabeth oversees our marketing campaigns and content strategy. She specializes in digital marketing and data-driven campaign optimization.",
          },
        ],
      },
      {
        id: "5",
        name: "Alexandra Peterson",
        role: "Chief People Officer",
        department: "Human Resources",
        email: "alexandra.peterson@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Talent acquisition and retention",
          "Employee development",
          "Company culture",
          "HR policies and compliance",
        ],
        bio: "Alexandra leads our people operations with a focus on building a strong company culture and developing talent. She has a background in organizational psychology.",
      },
    ],
  }

  // Calculate tree layout and auto-fit to container
  useEffect(() => {
    const calculateTreeLayout = () => {
      const nodeWidth = 220
      const nodeHeight = 100
      const horizontalSpacing = 60
      const verticalSpacing = 100
      const positions: NodeMap = {}

      // Calculate tree depth and width
      const getTreeDimensions = (node: Person) => {
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
      const positionNode = (node: Person, depth: number, horizontalOffset: number, widthUnits: number) => {
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
  }, [containerWidth, containerHeight, autoFit])

  // Find person by ID
  const findPersonById = (id: string, node: Person = orgData): Person | null => {
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

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent, personId: string) => {
    e.stopPropagation() // Stop event propagation
    setIsNodeClicked(true)

    const person = findPersonById(personId)
    if (person) {
      // If an external handler is provided, call it
      if (onSelectPerson) {
        onSelectPerson(person)
      } else {
        // Otherwise, use the internal panel
        setSelectedPerson(person)
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
    const connections: React.ReactNode[] = []

    const addConnection = (parent: Person, child: Person) => {
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

    const traverseTree = (node: Person) => {
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
    const nodes: React.ReactNode[] = []

    const traverseTree = (node: Person) => {
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

  return (
    <div
      className="relative w-full h-full overflow-hidden border border-border rounded-lg bg-background/30"
      ref={containerRef}
    >
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
        <SettingsButton />
      </div>

      {/* Only show the panel if we're not using the sidebar integration */}
      {!onSelectPerson && <EmployeePanel person={selectedPerson} isOpen={isPanelOpen} onClose={handleClosePanel} />}
    </div>
  )
}
