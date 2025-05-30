"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, Save, RotateCcw, Sparkles } from "lucide-react"
import { useSettingsStore } from "./lib/settings-store"
import { defaultAISettings, generateSystemPrompt } from "./lib/openai-service"
import type { AISettings } from "./lib/openai-service"
import type { Person } from "./types/person"

interface AISettingsPanelProps {
  person: Person
  onClose: () => void
}

export default function AISettingsPanel({ person, onClose }: AISettingsPanelProps) {
  const { getSettings, updateSettings, resetSettings } = useSettingsStore()
  const [settings, setSettings] = useState<AISettings>(getSettings(person.id))
  const [activeTab, setActiveTab] = useState("general")
  const [previewPrompt, setPreviewPrompt] = useState("")
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  // Update preview prompt when settings change
  useEffect(() => {
    const updatePreview = async () => {
      try {
        const prompt = await generateSystemPrompt(person.id, settings)
        setPreviewPrompt(prompt)
      } catch (error) {
        console.error('Error generating preview prompt:', error)
        setPreviewPrompt('Error generating preview prompt')
      }
    }
    updatePreview()
  }, [person.id, settings])

  // Handle saving settings
  const handleSave = () => {
    updateSettings(person.id, settings)
    onClose()
  }

  // Handle resetting settings
  const handleReset = () => {
    resetSettings(person.id)
    setSettings({ ...defaultAISettings })
  }

  // Handle updating a setting
  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-50 bg-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-semibold">AI Assistant Settings</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} className="gap-1">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {person.name}
            </Badge>
            <Badge variant="outline" className="bg-secondary/50 border-border">
              {person.role}
            </Badge>
            <Badge variant="outline" className="bg-secondary/50 border-border">
              {person.department}
            </Badge>
          </div>

          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 bg-secondary border border-border">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Advanced
              </TabsTrigger>
              <TabsTrigger
                value="persona"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                Persona
              </TabsTrigger>
              <TabsTrigger
                value="prompt"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                System Prompt
              </TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                  <CardDescription>Configure the AI model and basic parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">AI Model</Label>
                    <Select value={settings.model} onValueChange={(value) => updateSetting("model", value)}>
                      <SelectTrigger id="model">
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
                      <Label htmlFor="temperature">Temperature: {settings.temperature.toFixed(1)}</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.temperature]}
                      onValueChange={(value) => updateSetting("temperature", value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maxTokens">Max Response Length: {settings.maxTokens}</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Brief</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    <Slider
                      id="maxTokens"
                      min={100}
                      max={2000}
                      step={100}
                      value={[settings.maxTokens]}
                      onValueChange={(value) => updateSetting("maxTokens", value[0])}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Persona Configuration</CardTitle>
                  <CardDescription>Define how the AI assistant should behave</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="persona">Persona Style</Label>
                    <Select
                      value={settings.persona}
                      onValueChange={(value) => updateSetting("persona", value as AISettings["persona"])}
                    >
                      <SelectTrigger id="persona">
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
                    <Label htmlFor="responseStyle">Response Style</Label>
                    <Select
                      value={settings.responseStyle}
                      onValueChange={(value) => updateSetting("responseStyle", value as AISettings["responseStyle"])}
                    >
                      <SelectTrigger id="responseStyle">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledgeLevel">Knowledge Level</Label>
                    <Select
                      value={settings.knowledgeLevel}
                      onValueChange={(value) => updateSetting("knowledgeLevel", value as AISettings["knowledgeLevel"])}
                    >
                      <SelectTrigger id="knowledgeLevel">
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

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Model Parameters</CardTitle>
                  <CardDescription>Fine-tune the AI model behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="topP">Top P: {settings.topP.toFixed(2)}</Label>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Controls diversity</span>
                      </div>
                    </div>
                    <Slider
                      id="topP"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[settings.topP]}
                      onValueChange={(value) => updateSetting("topP", value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="frequencyPenalty">
                        Frequency Penalty: {settings.frequencyPenalty.toFixed(1)}
                      </Label>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Reduces repetition</span>
                      </div>
                    </div>
                    <Slider
                      id="frequencyPenalty"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[settings.frequencyPenalty]}
                      onValueChange={(value) => updateSetting("frequencyPenalty", value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="presencePenalty">Presence Penalty: {settings.presencePenalty.toFixed(1)}</Label>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Encourages new topics</span>
                      </div>
                    </div>
                    <Slider
                      id="presencePenalty"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[settings.presencePenalty]}
                      onValueChange={(value) => updateSetting("presencePenalty", value[0])}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Behavior Controls</CardTitle>
                  <CardDescription>Additional settings to control AI behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="memory-toggle" className="flex-1">
                      <div className="font-medium">Conversation Memory</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Remember previous messages in the conversation
                      </div>
                    </Label>
                    <Switch id="memory-toggle" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="citations-toggle" className="flex-1">
                      <div className="font-medium">Include Citations</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Reference sources when providing information
                      </div>
                    </Label>
                    <Switch id="citations-toggle" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="creativity-toggle" className="flex-1">
                      <div className="font-medium">Enhanced Creativity</div>
                      <div className="text-xs text-muted-foreground mt-1">Allow more creative and varied responses</div>
                    </Label>
                    <Switch id="creativity-toggle" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Persona Settings */}
            <TabsContent value="persona" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personality Traits</CardTitle>
                  <CardDescription>Define the personality characteristics of the AI assistant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Formality</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Casual</span>
                        <span>Formal</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} defaultValue={[3]} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Friendliness</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Reserved</span>
                        <span>Warm</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} defaultValue={[4]} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Technical Detail</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Simple</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} defaultValue={[3]} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Humor</Label>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-2">Serious</span>
                        <span>Humorous</span>
                      </div>
                    </div>
                    <Slider min={1} max={5} step={1} defaultValue={[2]} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communication Style</CardTitle>
                  <CardDescription>Configure how the AI assistant communicates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="communication-style">Primary Communication Style</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger id="communication-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analytical">Analytical & Logical</SelectItem>
                        <SelectItem value="empathetic">Empathetic & Supportive</SelectItem>
                        <SelectItem value="direct">Direct & Concise</SelectItem>
                        <SelectItem value="balanced">Balanced & Adaptable</SelectItem>
                        <SelectItem value="creative">Creative & Expressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Language Patterns</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="jargon-toggle" />
                        <Label htmlFor="jargon-toggle" className="text-sm">
                          Use Industry Jargon
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="metaphor-toggle" />
                        <Label htmlFor="metaphor-toggle" className="text-sm">
                          Use Metaphors
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="examples-toggle" defaultChecked />
                        <Label htmlFor="examples-toggle" className="text-sm">
                          Provide Examples
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="storytelling-toggle" />
                        <Label htmlFor="storytelling-toggle" className="text-sm">
                          Use Storytelling
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Prompt */}
            <TabsContent value="prompt" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom System Prompt</CardTitle>
                  <CardDescription>
                    Define a custom system prompt or use the auto-generated one based on other settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="system-prompt">System Prompt</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                        className="text-xs h-7 px-2"
                      >
                        {isPreviewVisible ? "Hide Preview" : "Show Preview"}
                      </Button>
                    </div>
                    <Textarea
                      id="system-prompt"
                      value={settings.systemPrompt}
                      onChange={(e) => updateSetting("systemPrompt", e.target.value)}
                      placeholder="Enter a custom system prompt or leave blank to use the auto-generated one"
                      className="min-h-[200px] font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use the auto-generated prompt based on employee data and other settings.
                    </p>
                  </div>

                  {isPreviewVisible && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Auto-generated System Prompt Preview</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSetting("systemPrompt", previewPrompt)}
                          className="text-xs h-7 px-2 gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          Use This
                        </Button>
                      </div>
                      <div className="p-3 rounded-md bg-secondary/50 border border-border overflow-auto max-h-[300px]">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{previewPrompt}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prompt Templates</CardTitle>
                  <CardDescription>Choose from pre-defined prompt templates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt-template">Select Template</Label>
                    <Select onValueChange={(value) => updateSetting("systemPrompt", value)}>
                      <SelectTrigger id="prompt-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={`You are ${person.name}, the ${person.role} at our company. You have expertise in ${person.department} and respond in a professional, helpful manner. When answering questions, draw on your knowledge and experience in your field.`}
                        >
                          Basic Professional
                        </SelectItem>
                        <SelectItem
                          value={`You are ${person.name}, the ${person.role} in the ${person.department} department. You're known for your technical expertise and detailed explanations. You prefer to be thorough and precise in your answers, providing context and background information when relevant.`}
                        >
                          Technical Expert
                        </SelectItem>
                        <SelectItem
                          value={`You are ${person.name}, the ${person.role}. You have a friendly, approachable communication style and enjoy helping others. You explain concepts in simple terms and use examples to illustrate your points. You're patient and supportive when answering questions.`}
                        >
                          Friendly Helper
                        </SelectItem>
                        <SelectItem
                          value={`You are ${person.name}, the ${person.role} in ${person.department}. You're known for your concise, direct communication style. You get straight to the point and provide clear, actionable information without unnecessary details. You value efficiency and clarity above all.`}
                        >
                          Concise Communicator
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
