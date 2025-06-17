"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import CalendarPanel from "./calendar-panel"
import { Lightbulb, Pin, FileText } from "lucide-react"

interface PinnedDoc {
  id: string
  title: string
  type: "policy" | "guide" | "template"
  lastAccessed: string
}

const mockPinnedDocs: PinnedDoc[] = [
  {
    id: "doc-1",
    title: "Employee Handbook 2024",
    type: "policy",
    lastAccessed: "2 hours ago"
  },
  {
    id: "doc-2",
    title: "Performance Review Template",
    type: "template",
    lastAccessed: "Yesterday"
  },
  {
    id: "doc-3",
    title: "Remote Work Guidelines",
    type: "guide",
    lastAccessed: "3 days ago"
  }
]

const assistantTips = [
  {
    id: "tip-1",
    title: "Quick Delegation",
    content: "Use '@' to quickly delegate tasks to team members in any conversation"
  },
  {
    id: "tip-2",
    title: "Smart Scheduling",
    content: "Type 'schedule meeting' to let AI find the best time slots for all attendees"
  },
  {
    id: "tip-3",
    title: "Document Search",
    content: "Ask questions about company policies and I'll search through all documents"
  }
]

export default function RightInfoPanel({ employeeId }: { employeeId: string }) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const [isTipsOpen, setIsTipsOpen] = useState(true)

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {/* Calendar Section */}
          <section className="px-4 py-3 border-b border-[hsl(var(--border))]">
            <CalendarPanel employeeId={employeeId} />
          </section>

          {/* Pinned Documents */}
          <section className="border-b border-[hsl(var(--border))] last:border-none">
            <Collapsible open={isPinnedOpen} onOpenChange={setIsPinnedOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Pin className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Pinned Documents</h3>
                </div>
                {isPinnedOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-3 space-y-2">
                  {mockPinnedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2 rounded-lg bg-[hsl(var(--panel-bg))] border border-[hsl(var(--border))] hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <h4 className="text-xs font-medium truncate">{doc.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1 py-0 ${
                                doc.type === "policy" ? "border-blue-500/50 text-blue-500" :
                                doc.type === "guide" ? "border-green-500/50 text-green-500" :
                                "border-purple-500/50 text-purple-500"
                              }`}
                            >
                              {doc.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{doc.lastAccessed}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>

          {/* Assistant Tips */}
          <section className="border-b border-[hsl(var(--border))] last:border-none">
            <Collapsible open={isTipsOpen} onOpenChange={setIsTipsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h3 className="text-sm font-medium">Assistant Tips</h3>
                </div>
                {isTipsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-3 space-y-2">
                  {assistantTips.map((tip) => (
                    <div
                      key={tip.id}
                      className="p-3 rounded-lg bg-[hsl(var(--panel-bg))] border border-[hsl(var(--border))]"
                    >
                      <h4 className="text-xs font-medium mb-1">{tip.title}</h4>
                      <p className="text-xs text-muted-foreground">{tip.content}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}
