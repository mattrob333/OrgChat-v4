"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Bell, 
  Settings, 
  Home,
  ArrowLeft,
  MoreHorizontal
} from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderBarProps {
  employee: {
    id: string
    name: string
    role: string
    department: string
    email: string
    image?: string
  }
}

export default function HeaderBar({ employee }: HeaderBarProps) {
  const router = useRouter()
  const [status] = useState<"online" | "away" | "busy" | "offline">("online")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleBackToOrgChart = () => {
    router.push("/")
  }

  return (
    <header className="h-16 bg-[hsl(var(--panel-bg))] border-b border-[hsl(var(--border))] px-6 flex items-center justify-between">
      {/* Left: Employee Info */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToOrgChart}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Org Chart
        </Button>
        
        <div className="h-6 w-px bg-border" />
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee.image || "/placeholder.svg"} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {employee.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(status)}`} />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{employee.name}</h1>
              <Badge variant="secondary" className="text-xs">
                {status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{employee.role}</span>
              <span>•</span>
              <span>{employee.department}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
