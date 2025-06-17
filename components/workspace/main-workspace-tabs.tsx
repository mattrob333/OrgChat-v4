"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ChatThread from "./chat-thread"
import TaskBoard from "./task-board"

interface MainWorkspaceTabsProps {
  employeeId: string
}

// Simple DocumentList component for now
function DocumentList({ employeeId }: { employeeId: string }) {
  return (
    <div className="flex flex-col flex-1 p-4">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Document list will be implemented here
      </div>
    </div>
  )
}

export default function MainWorkspaceTabs({ employeeId }: MainWorkspaceTabsProps) {
  return (
    <Tabs defaultValue="chat" className="flex flex-col flex-1 h-full">
      <TabsList className="border-b border-[hsl(var(--border))] bg-transparent h-auto p-0 rounded-none">
        <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Chat</TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Tasks</TabsTrigger>
        <TabsTrigger value="docs" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">Docs</TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex-1 mt-0 h-0">
        <ChatThread recipientName="Team Chat" />
      </TabsContent>

      <TabsContent value="tasks" className="flex-1 overflow-y-auto mt-0">
        <TaskBoard employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="docs" className="flex-1 overflow-y-auto mt-0">
        <DocumentList employeeId={employeeId} />
      </TabsContent>
    </Tabs>
  )
}
