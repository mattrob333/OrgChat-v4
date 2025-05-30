"use client"

import { useState, useEffect, useRef } from "react"
import OrgTreeCanvas from "../org-tree-canvas"
import OrgTable from "@/components/org-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIChatPanel } from "@/components/ai-chat-panel"
import type { Person } from "../types/person"
import EmployeePanel from "../employee-panel"
import { AppSidebar } from "@/components/app-sidebar"
import { Calendar } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Page() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [activeTab, setActiveTab] = useState<"hr" | "employee">("hr")
  const [chatPanelWidth] = useState(400)
  const [sidebarWidth] = useState(60)
  const orgChartContainerRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })

  // Function to handle selecting a person from the org chart
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person)
    setActiveTab("employee")
  }

  // Update container dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (orgChartContainerRef.current) {
        setContainerDimensions({
          width: orgChartContainerRef.current.clientWidth,
          height: orgChartContainerRef.current.clientHeight,
        })
      }
    }

    // Initial measurement
    updateDimensions()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateDimensions)
    if (orgChartContainerRef.current) {
      resizeObserver.observe(orgChartContainerRef.current)
    }

    // Clean up
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Left: App Sidebar */}
      <AppSidebar />

      {/* Middle: Org Chart Container */}
      <div
        ref={orgChartContainerRef}
        className="flex-1 overflow-hidden flex flex-col"
        style={{ maxWidth: `calc(100vw - ${chatPanelWidth}px - ${sidebarWidth}px)` }}
      >
        <div className="p-6 h-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6">
            <span className="text-primary">Organization</span> Chart
          </h1>

          <Tabs defaultValue="canvas" className="flex-1 flex flex-col">
            <TabsList className="mb-4 bg-secondary border border-border w-fit">
              <TabsTrigger
                value="canvas"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Interactive Canvas
              </TabsTrigger>
              <TabsTrigger
                value="tree"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Data Table
              </TabsTrigger>
            </TabsList>
            <TabsContent value="canvas" className="flex-1 overflow-hidden">
              <OrgTreeCanvas
                onSelectPerson={handleSelectPerson}
                containerWidth={containerDimensions.width}
                containerHeight={containerDimensions.height - 120} // Account for header and tabs
              />
            </TabsContent>
            <TabsContent value="tree" className="flex-1 overflow-auto">
              <OrgTable onSelectPerson={handleSelectPerson} containerWidth={containerDimensions.width} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right: Chat Panel */}
      <div
        className="h-screen border-l border-border bg-card flex flex-col"
        style={{ width: `${chatPanelWidth}px`, flexShrink: 0 }}
      >
        <div className="border-b border-border">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "hr" | "employee")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hr">HR Assistant</TabsTrigger>
              <TabsTrigger value="employee" disabled={!selectedPerson}>
                {selectedPerson ? selectedPerson.name : "Employee"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Employee Calendar Accordion */}
        <div className="border-b border-border">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="calendar" className="border-0">
              <AccordionTrigger className="py-2 px-4 text-sm hover:no-underline">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Employee Calendar</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-2 px-4">
                <div className="border rounded-md p-2 bg-background">
                  <div className="text-xs font-medium mb-2 text-center">May 2025</div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                    <div>Su</div>
                    <div>Mo</div>
                    <div>Tu</div>
                    <div>We</div>
                    <div>Th</div>
                    <div>Fr</div>
                    <div>Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    <div className="text-muted-foreground">28</div>
                    <div className="text-muted-foreground">29</div>
                    <div className="text-muted-foreground">30</div>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                    <div>6</div>
                    <div>7</div>
                    <div>8</div>
                    <div>9</div>
                    <div>10</div>
                    <div>11</div>
                    <div>12</div>
                    <div>13</div>
                    <div>14</div>
                    <div>15</div>
                    <div>16</div>
                    <div>17</div>
                    <div>18</div>
                    <div>19</div>
                    <div>20</div>
                    <div>21</div>
                    <div>22</div>
                    <div>23</div>
                    <div>24</div>
                    <div>25</div>
                    <div className="rounded-full bg-primary text-primary-foreground">26</div>
                    <div>27</div>
                    <div>28</div>
                    <div>29</div>
                    <div>30</div>
                    <div>31</div>
                    <div className="text-muted-foreground">1</div>
                  </div>
                  {selectedPerson && (
                    <div className="mt-2 text-xs">
                      <div className="flex items-center gap-1 text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span>{selectedPerson.name} has 3 meetings today</span>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === "hr" && <AIChatPanel embedded={true} />}
          {activeTab === "employee" && selectedPerson && (
            <EmployeePanel person={selectedPerson} isOpen={true} onClose={() => {}} embedded={true} />
          )}
        </div>
      </div>
    </main>
  )
}
