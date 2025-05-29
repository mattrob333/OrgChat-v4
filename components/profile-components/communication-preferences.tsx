"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Mail, Phone, Video, AlertCircle, Plus, X } from "lucide-react"

export default function CommunicationPreferences() {
  const [availabilityRules, setAvailabilityRules] = useState([
    { id: 1, day: "weekdays", startTime: "09:00", endTime: "17:00" },
    { id: 2, day: "weekends", startTime: "10:00", endTime: "14:00" },
  ])

  const [outOfOffice, setOutOfOffice] = useState({
    enabled: false,
    startDate: "",
    endDate: "",
    message: "I'm currently out of the office and will return soon. For urgent matters, please contact my team.",
  })

  const addAvailabilityRule = () => {
    const newId = Math.max(0, ...availabilityRules.map((rule) => rule.id)) + 1
    setAvailabilityRules([...availabilityRules, { id: newId, day: "weekdays", startTime: "09:00", endTime: "17:00" }])
  }

  const removeAvailabilityRule = (id: number) => {
    setAvailabilityRules(availabilityRules.filter((rule) => rule.id !== id))
  }

  const updateAvailabilityRule = (id: number, field: string, value: string) => {
    setAvailabilityRules(availabilityRules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)))
  }

  const toggleOutOfOffice = (enabled: boolean) => {
    setOutOfOffice({ ...outOfOffice, enabled })
  }

  const updateOutOfOffice = (field: string, value: string) => {
    setOutOfOffice({ ...outOfOffice, [field]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Communication Preferences</h2>

        <Tabs defaultValue="availability">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="channels"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Channels
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              Auto-Responses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Working Hours</h3>
              <p className="text-sm text-muted-foreground">
                Set your regular working hours. Your AI clone will use this information when responding to availability
                questions.
              </p>

              <div className="space-y-4">
                {availabilityRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4">
                    <Select value={rule.day} onValueChange={(value) => updateAvailabilityRule(rule.id, "day", value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center">
                      <Input
                        type="time"
                        value={rule.startTime}
                        onChange={(e) => updateAvailabilityRule(rule.id, "startTime", e.target.value)}
                        className="w-[120px]"
                      />
                      <span className="mx-2">to</span>
                      <Input
                        type="time"
                        value={rule.endTime}
                        onChange={(e) => updateAvailabilityRule(rule.id, "endTime", e.target.value)}
                        className="w-[120px]"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAvailabilityRule(rule.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addAvailabilityRule} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Time Slot
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Out of Office</h3>
                  <p className="text-sm text-muted-foreground">Set your out of office status and message.</p>
                </div>
                <Switch checked={outOfOffice.enabled} onCheckedChange={toggleOutOfOffice} />
              </div>

              {outOfOffice.enabled && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={outOfOffice.startDate}
                        onChange={(e) => updateOutOfOffice("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={outOfOffice.endDate}
                        onChange={(e) => updateOutOfOffice("endDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ooo-message">Out of Office Message</Label>
                    <Textarea
                      id="ooo-message"
                      value={outOfOffice.message}
                      onChange={(e) => updateOutOfOffice("message", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preferred Communication Channels</h3>
              <p className="text-sm text-muted-foreground">
                Set your preferred communication channels and response times. Your AI clone will use this to suggest the
                best way to reach you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <Label htmlFor="chat-toggle" className="font-medium">
                      Chat/Messaging
                    </Label>
                  </div>
                  <Switch id="chat-toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <Label htmlFor="email-toggle" className="font-medium">
                      Email
                    </Label>
                  </div>
                  <Switch id="email-toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <Label htmlFor="phone-toggle" className="font-medium">
                      Phone Call
                    </Label>
                  </div>
                  <Switch id="phone-toggle" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <Label htmlFor="video-toggle" className="font-medium">
                      Video Call
                    </Label>
                  </div>
                  <Switch id="video-toggle" defaultChecked />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Response Time Expectations</h3>
              <p className="text-sm text-muted-foreground">
                Set expectations for how quickly you typically respond to different types of communication.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chat-response">Chat/Messaging</Label>
                    <Select defaultValue="1hour">
                      <SelectTrigger id="chat-response">
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within minutes)</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="sameday">Same day</SelectItem>
                        <SelectItem value="nextday">Next business day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-response">Email</Label>
                    <Select defaultValue="sameday">
                      <SelectTrigger id="email-response">
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within minutes)</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="sameday">Same day</SelectItem>
                        <SelectItem value="nextday">Next business day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-response">Phone Call</Label>
                    <Select defaultValue="4hours">
                      <SelectTrigger id="phone-response">
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within minutes)</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="sameday">Same day</SelectItem>
                        <SelectItem value="nextday">Next business day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-response">Video Call</Label>
                    <Select defaultValue="nextday">
                      <SelectTrigger id="video-response">
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (within minutes)</SelectItem>
                        <SelectItem value="1hour">Within 1 hour</SelectItem>
                        <SelectItem value="4hours">Within 4 hours</SelectItem>
                        <SelectItem value="sameday">Same day</SelectItem>
                        <SelectItem value="nextday">Next business day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="responses" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Automated Responses</h3>
              <p className="text-sm text-muted-foreground">
                Configure how your AI clone should respond to common scenarios.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="urgent-response">Urgent Matters</Label>
                  <Textarea
                    id="urgent-response"
                    defaultValue="For urgent matters, please contact me directly via phone at [your phone number]. If I don't answer, you can reach out to [backup contact name] at [backup contact info]."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting-response">Meeting Requests</Label>
                  <Textarea
                    id="meeting-response"
                    defaultValue="I'm currently available for meetings on [days/times]. Please check my calendar for open slots or suggest a few times that work for you."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followup-response">Follow-up Requests</Label>
                  <Textarea
                    id="followup-response"
                    defaultValue="I typically follow up on requests within [timeframe]. If you haven't heard back from me by then, please feel free to send a reminder."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 border border-amber-500/20 rounded-lg bg-amber-500/10">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-500">
                These responses will be used by your AI clone when appropriate. Make sure they accurately reflect your
                preferences.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
