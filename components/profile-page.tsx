"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Save } from "lucide-react"
import ProfileInfo from "@/components/profile-components/profile-info"
import DocumentUpload from "@/components/profile-components/document-upload"
import CommunicationPreferences from "@/components/profile-components/communication-preferences"
import CalendarSettings from "@/components/profile-components/calendar-settings"
import TaskManager from "@/components/profile-components/task-manager"
import AISettings from "@/components/profile-components/ai-settings"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Mock user data - in a real app, this would come from an API or state management
  const userData = {
    id: "user-1",
    name: "Eleanor Rosevelt",
    role: "Chief Executive Officer",
    department: "Executive",
    email: "eleanor.rosevelt@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    timezone: "America/New_York",
    bio: "Eleanor has over 20 years of experience in executive leadership roles across technology and finance sectors. She joined the company in 2018 and has led the organization through significant growth and transformation.",
    image: "/placeholder.svg?height=200&width=200",
  }

  const handleSaveAll = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSaving(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    })
  }

  return (
    <div className="w-full py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">User Profile</h2>
        </div>
        <Button onClick={handleSaveAll} className="gap-2" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save All"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Communication
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            AI Settings
          </TabsTrigger>
        </TabsList>

        <Card className="p-8 border border-border mt-4">
          <TabsContent value="profile" className="mt-0">
            <ProfileInfo userData={userData} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="communication" className="mt-0">
            <CommunicationPreferences />
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <CalendarSettings />
          </TabsContent>

          <TabsContent value="tasks" className="mt-0">
            <TaskManager />
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <AISettings />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}
