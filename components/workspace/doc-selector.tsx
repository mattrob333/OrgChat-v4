"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  FileText,
  File,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Search,
  X,
  ChevronDown
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface DocSelectorProps {
  employeeId: string
}

interface Document {
  id: string
  name: string
  type: "policy" | "guide" | "report" | "code" | "spreadsheet" | "presentation"
  category: string
  lastAccessed?: Date
  size: string
  shared: boolean
}

export default function DocSelector({ employeeId }: DocSelectorProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Mock documents data
  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "Employee Handbook 2024",
      type: "policy",
      category: "HR Policies",
      lastAccessed: new Date(Date.now() - 1000 * 60 * 30),
      size: "2.4 MB",
      shared: true
    },
    {
      id: "2",
      name: "Q4 Sales Report",
      type: "report",
      category: "Sales",
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      size: "1.8 MB",
      shared: true
    },
    {
      id: "3",
      name: "Product Roadmap",
      type: "presentation",
      category: "Product",
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      size: "5.2 MB",
      shared: false
    },
    {
      id: "4",
      name: "API Documentation",
      type: "code",
      category: "Engineering",
      lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 48),
      size: "892 KB",
      shared: true
    },
    {
      id: "5",
      name: "Budget Analysis 2024",
      type: "spreadsheet",
      category: "Finance",
      size: "3.1 MB",
      shared: false
    },
    {
      id: "6",
      name: "Marketing Guidelines",
      type: "guide",
      category: "Marketing",
      size: "1.2 MB",
      shared: true
    }
  ]

  const getDocIcon = (type: Document["type"]) => {
    switch (type) {
      case "policy":
      case "guide":
        return <FileText className="h-4 w-4" />
      case "report":
      case "presentation":
        return <File className="h-4 w-4" />
      case "code":
        return <FileCode className="h-4 w-4" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-4 w-4" />
      default:
        return <FileImage className="h-4 w-4" />
    }
  }

  const getDocColor = (type: Document["type"]) => {
    switch (type) {
      case "policy":
        return "text-blue-500"
      case "guide":
        return "text-green-500"
      case "report":
        return "text-purple-500"
      case "code":
        return "text-orange-500"
      case "spreadsheet":
        return "text-emerald-500"
      case "presentation":
        return "text-pink-500"
      default:
        return "text-gray-500"
    }
  }

  const toggleDoc = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const clearSelection = () => {
    setSelectedDocs([])
  }

  const filteredDocs = mockDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Documents:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <FileText className="h-4 w-4 mr-1.5" />
            {selectedDocs.length > 0 ? (
              <span>{selectedDocs.length} selected</span>
            ) : (
              <span>Select context</span>
            )}
            <ChevronDown className="h-3 w-3 ml-1.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocs.includes(doc.id) 
                        ? 'bg-accent border-accent-foreground/20' 
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={getDocColor(doc.type)}>
                        {getDocIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.category} • {doc.size}</p>
                      </div>
                    </div>
                    {selectedDocs.includes(doc.id) && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <X className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedDocs.length > 0 && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
