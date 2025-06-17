"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Brain, 
  Lightbulb, 
  Target,
  BarChart3,
  FileSearch
} from "lucide-react"

interface AICompanionsDockProps {
  employeeId: string
}

interface AICompanion {
  id: string
  name: string
  icon: React.ReactNode
  color: string
}

export default function AICompanionsDock({ employeeId }: AICompanionsDockProps) {
  const companions: AICompanion[] = [
    {
      id: "1",
      name: "TaskMaster",
      icon: <Target className="h-4 w-4" />,
      color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
    },
    {
      id: "2",
      name: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      color: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
    },
    {
      id: "3",
      name: "HR Assistant",
      icon: <Lightbulb className="h-4 w-4" />,
      color: "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
    },
    {
      id: "4",
      name: "Doc Search",
      icon: <FileSearch className="h-4 w-4" />,
      color: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
    },
    {
      id: "5",
      name: "Strategy",
      icon: <Bot className="h-4 w-4" />,
      color: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
    },
    {
      id: "6",
      name: "Code Helper",
      icon: <Brain className="h-4 w-4" />,
      color: "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
    }
  ]

  const handleCompanionClick = (companionId: string) => {
    // In real implementation, this would open the AI chat interface
    console.log(`Starting chat with companion ${companionId}`)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">AI Assistants:</span>
      {companions.map((companion) => (
        <Button
          key={companion.id}
          variant="ghost"
          size="sm"
          onClick={() => handleCompanionClick(companion.id)}
          className={`h-8 px-3 rounded-full transition-colors ${companion.color}`}
        >
          {companion.icon}
          <span className="ml-1.5 text-xs font-medium">{companion.name}</span>
        </Button>
      ))}
    </div>
  )
}
