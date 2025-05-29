"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

export default function SettingsButton() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="hover:bg-primary/10 hover:text-primary hover:border-primary/30"
        title="Global Settings"
      >
        <Settings className="h-4 w-4" />
        <span className="sr-only">Settings</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Organization Chart Settings</DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="general"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden"
          >
            <div className="border-b border-border">
              <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="general"
                  className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                >
                  AI Settings
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                >
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="general" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>Configure general organization chart settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input id="org-name" defaultValue="Acme Corporation" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-description">Organization Description</Label>
                      <Input id="org-description" defaultValue="A leading technology company" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="show-email" className="flex-1">
                        Show Email Addresses
                      </Label>
                      <Switch id="show-email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="show-department" className="flex-1">
                        Show Department
                      </Label>
                      <Switch id="show-department" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chart Layout</CardTitle>
                    <CardDescription>Configure how the organization chart is displayed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="layout-type">Layout Type</Label>
                      <Select defaultValue="hierarchical">
                        <SelectTrigger id="layout-type">
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hierarchical">Hierarchical</SelectItem>
                          <SelectItem value="horizontal">Horizontal</SelectItem>
                          <SelectItem value="vertical">Vertical</SelectItem>
                          <SelectItem value="radial">Radial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="node-spacing">Node Spacing</Label>
                        <span className="text-xs text-muted-foreground">60px</span>
                      </div>
                      <Slider id="node-spacing" min={30} max={100} step={5} defaultValue={[60]} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vertical-spacing">Vertical Spacing</Label>
                        <span className="text-xs text-muted-foreground">100px</span>
                      </div>
                      <Slider id="vertical-spacing" min={50} max={150} step={10} defaultValue={[100]} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Global AI Settings</CardTitle>
                    <CardDescription>Configure default settings for all AI assistants</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-model">Default AI Model</Label>
                      <Select defaultValue="gpt-4o">
                        <SelectTrigger id="default-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="default-temperature">Default Temperature</Label>
                        <span className="text-xs text-muted-foreground">0.7</span>
                      </div>
                      <Slider id="default-temperature" min={0} max={1} step={0.1} defaultValue={[0.7]} />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="auto-create-agents" className="flex-1">
                        <div className="font-medium">Auto-create AI Agents</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Automatically create AI agents for new employees
                        </div>
                      </Label>
                      <Switch id="auto-create-agents" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="inherit-settings" className="flex-1">
                        <div className="font-medium">Inherit Department Settings</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          New employees inherit AI settings from their department
                        </div>
                      </Label>
                      <Switch id="inherit-settings" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Department-Specific Settings</CardTitle>
                    <CardDescription>Configure AI settings for specific departments</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="department-select">Select Department</Label>
                      <Select defaultValue="engineering">
                        <SelectTrigger id="department-select">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept-persona">Department Persona</Label>
                      <Select defaultValue="technical">
                        <SelectTrigger id="dept-persona">
                          <SelectValue placeholder="Select persona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="concise">Concise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept-knowledge">Knowledge Level</Label>
                      <Select defaultValue="expert">
                        <SelectTrigger id="dept-knowledge">
                          <SelectValue placeholder="Select knowledge level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Settings</CardTitle>
                    <CardDescription>Configure the visual appearance of the organization chart</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select defaultValue="dark">
                        <SelectTrigger id="theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <Select defaultValue="green">
                        <SelectTrigger id="accent-color">
                          <SelectValue placeholder="Select accent color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="node-style">Node Style</Label>
                      <Select defaultValue="card">
                        <SelectTrigger id="node-style">
                          <SelectValue placeholder="Select node style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="show-avatars" className="flex-1">
                        Show Avatars
                      </Label>
                      <Switch id="show-avatars" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="animate-transitions" className="flex-1">
                        Animate Transitions
                      </Label>
                      <Switch id="animate-transitions" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Grid and Connection Settings</CardTitle>
                    <CardDescription>Configure the grid and connection lines</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="show-grid" className="flex-1">
                        Show Grid
                      </Label>
                      <Switch id="show-grid" defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="grid-size">Grid Size</Label>
                        <span className="text-xs text-muted-foreground">40px</span>
                      </div>
                      <Slider id="grid-size" min={20} max={80} step={10} defaultValue={[40]} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="connection-style">Connection Style</Label>
                      <Select defaultValue="orthogonal">
                        <SelectTrigger id="connection-style">
                          <SelectValue placeholder="Select connection style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orthogonal">Orthogonal</SelectItem>
                          <SelectItem value="curved">Curved</SelectItem>
                          <SelectItem value="straight">Straight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="connection-opacity">Connection Opacity</Label>
                        <span className="text-xs text-muted-foreground">20%</span>
                      </div>
                      <Slider id="connection-opacity" min={10} max={100} step={10} defaultValue={[20]} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="mt-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Configure advanced settings for the organization chart</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="data-source">Data Source</Label>
                      <Select defaultValue="local">
                        <SelectTrigger id="data-source">
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local Storage</SelectItem>
                          <SelectItem value="api">API Endpoint</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-endpoint">API Endpoint (if applicable)</Label>
                      <Input id="api-endpoint" placeholder="https://api.example.com/org-chart" />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="cache-data" className="flex-1">
                        <div className="font-medium">Cache Data</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Cache organization data for faster loading
                        </div>
                      </Label>
                      <Switch id="cache-data" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="debug-mode" className="flex-1">
                        <div className="font-medium">Debug Mode</div>
                        <div className="text-xs text-muted-foreground mt-1">Enable debug information in console</div>
                      </Label>
                      <Switch id="debug-mode" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Export & Import</CardTitle>
                    <CardDescription>Export and import organization chart data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full">
                        Export as JSON
                      </Button>
                      <Button variant="outline" className="w-full">
                        Export as CSV
                      </Button>
                      <Button variant="outline" className="w-full">
                        Export as Image
                      </Button>
                      <Button variant="outline" className="w-full">
                        Import Data
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Auto Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger id="backup-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
