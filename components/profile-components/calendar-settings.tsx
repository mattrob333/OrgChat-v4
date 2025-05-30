"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, RefreshCw, AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalendarAccount {
  id: string
  name: string
  type: "google" | "outlook" | "apple" | "other"
  email: string
  connected: boolean
  lastSync?: string
}

export default function CalendarSettings() {
  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([
    {
      id: "cal-1",
      name: "Work Calendar",
      type: "google",
      email: "eleanor.rosevelt@company.com",
      connected: true,
      lastSync: "2023-07-15T14:30:00Z",
    },
    {
      id: "cal-2",
      name: "Personal Calendar",
      type: "outlook",
      email: "eleanor.personal@outlook.com",
      connected: false,
    },
  ])

  const [calendarVisibility, setCalendarVisibility] = useState({
    showMeetingDetails: true,
    showAttendees: true,
    showPrivateEvents: false,
    showDeclinedEvents: false,
  })

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: "evt-1",
      title: "Executive Team Meeting",
      start: "2023-07-20T10:00:00Z",
      end: "2023-07-20T11:30:00Z",
      location: "Conference Room A",
      attendees: 8,
    },
    {
      id: "evt-2",
      title: "Quarterly Review",
      start: "2023-07-21T14:00:00Z",
      end: "2023-07-21T16:00:00Z",
      location: "Virtual",
      attendees: 12,
    },
    {
      id: "evt-3",
      title: "Product Launch Planning",
      start: "2023-07-22T09:00:00Z",
      end: "2023-07-22T10:30:00Z",
      location: "Conference Room B",
      attendees: 5,
    },
  ])

  const handleToggleVisibility = (key: string, value: boolean) => {
    setCalendarVisibility((prev) => ({ ...prev, [key]: value }))
  }

  const handleConnectCalendar = (id: string) => {
    setCalendarAccounts(
      calendarAccounts.map((account) =>
        account.id === id ? { ...account, connected: true, lastSync: new Date().toISOString() } : account,
      ),
    )
  }

  const handleDisconnectCalendar = (id: string) => {
    setCalendarAccounts(
      calendarAccounts.map((account) =>
        account.id === id ? { ...account, connected: false, lastSync: undefined } : account,
      ),
    )
  }

  const handleSyncCalendar = (id: string) => {
    setCalendarAccounts(
      calendarAccounts.map((account) =>
        account.id === id ? { ...account, lastSync: new Date().toISOString() } : account,
      ),
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getCalendarIcon = (type: string) => {
    switch (type) {
      case "google":
        return "text-red-500"
      case "outlook":
        return "text-blue-500"
      case "apple":
        return "text-gray-500"
      default:
        return "text-primary"
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Calendar Integration</h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Connected Calendars</h3>
            <p className="text-sm text-muted-foreground">
              Connect your calendars to allow your AI clone to access your schedule and availability.
            </p>

            <div className="space-y-4">
              {calendarAccounts.map((account) => (
                <Card key={account.id} className="border border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className={`h-5 w-5 ${getCalendarIcon(account.type)}`} />
                        <CardTitle className="text-base">{account.name}</CardTitle>
                      </div>
                      {account.connected ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{account.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        {account.lastSync && (
                          <p className="text-xs text-muted-foreground">Last synced: {formatDate(account.lastSync)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {account.connected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncCalendar(account.id)}
                              className="gap-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Sync
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnectCalendar(account.id)}
                              className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-3 w-3" />
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectCalendar(account.id)}
                            className="gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Check className="h-3 w-3" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Calendar
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Calendar Visibility Settings</h3>
            <p className="text-sm text-muted-foreground">
              Control what calendar information your AI clone can access and share.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-meeting-details" className="flex-1">
                  <div className="font-medium">Show Meeting Details</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Allow your AI clone to see and share meeting titles and descriptions
                  </div>
                </Label>
                <Switch
                  id="show-meeting-details"
                  checked={calendarVisibility.showMeetingDetails}
                  onCheckedChange={(checked) => handleToggleVisibility("showMeetingDetails", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-attendees" className="flex-1">
                  <div className="font-medium">Show Attendees</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Allow your AI clone to see and share who is attending your meetings
                  </div>
                </Label>
                <Switch
                  id="show-attendees"
                  checked={calendarVisibility.showAttendees}
                  onCheckedChange={(checked) => handleToggleVisibility("showAttendees", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-private-events" className="flex-1">
                  <div className="font-medium">Show Private Events</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Allow your AI clone to see and share events marked as private
                  </div>
                </Label>
                <Switch
                  id="show-private-events"
                  checked={calendarVisibility.showPrivateEvents}
                  onCheckedChange={(checked) => handleToggleVisibility("showPrivateEvents", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-declined-events" className="flex-1">
                  <div className="font-medium">Show Declined Events</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Allow your AI clone to see and share events you've declined
                  </div>
                </Label>
                <Switch
                  id="show-declined-events"
                  checked={calendarVisibility.showDeclinedEvents}
                  onCheckedChange={(checked) => handleToggleVisibility("showDeclinedEvents", checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Set your preferences for how your AI clone should handle scheduling requests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buffer-time">Buffer Time Between Meetings</Label>
                <Select defaultValue="15">
                  <SelectTrigger id="buffer-time">
                    <SelectValue placeholder="Select buffer time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-meetings">Maximum Meetings Per Day</Label>
                <Select defaultValue="5">
                  <SelectTrigger id="max-meetings">
                    <SelectValue placeholder="Select maximum meetings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meetings</SelectItem>
                    <SelectItem value="5">5 meetings</SelectItem>
                    <SelectItem value="7">7 meetings</SelectItem>
                    <SelectItem value="10">10 meetings</SelectItem>
                    <SelectItem value="unlimited">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred-meeting-length">Preferred Meeting Length</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="preferred-meeting-length">
                    <SelectValue placeholder="Select preferred length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduling-notice">Minimum Scheduling Notice</Label>
                <Select defaultValue="1day">
                  <SelectTrigger id="scheduling-notice">
                    <SelectValue placeholder="Select minimum notice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1hour">1 hour</SelectItem>
                    <SelectItem value="3hours">3 hours</SelectItem>
                    <SelectItem value="sameday">Same day</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="2days">2 days</SelectItem>
                    <SelectItem value="1week">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Meeting Types</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="meeting-1on1" defaultChecked />
                  <Label htmlFor="meeting-1on1" className="text-sm font-normal">
                    1:1 Meetings
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="meeting-team" defaultChecked />
                  <Label htmlFor="meeting-team" className="text-sm font-normal">
                    Team Meetings
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="meeting-client" defaultChecked />
                  <Label htmlFor="meeting-client" className="text-sm font-normal">
                    Client Meetings
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="meeting-interview" />
                  <Label htmlFor="meeting-interview" className="text-sm font-normal">
                    Interviews
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <Alert className="bg-primary/10 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle>Calendar Integration</AlertTitle>
            <AlertDescription>
              Your AI clone will use this calendar information to accurately respond to questions about your
              availability and schedule.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
