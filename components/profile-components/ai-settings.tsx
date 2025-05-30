"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AISettings() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 500,
    topP: 0.95,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: "",
    persona: "professional",
    knowledgeLevel: "expert",
    responseStyle: "balanced",
    memory: true,
    citations: false,
    creativity: true,
    formality: 3,
    friendliness: 4,
    technicalDetail: 3,
    humor: 2,
    communicationStyle: "balanced",
    useJargon: false,
    useMetaphors: false,
    provideExamples: true,
    useStorytelling: false,
  })

  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  const handleSliderChange = (name: string, value: number[]) => {
    setSettings({ ...settings, [name]: value[0] })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings({ ...settings, [name]: checked })
  }

  const handleSelectChange = (name: string, value: string) => {
    setSettings({ ...settings, [name]: value })
  }

  const handleTextChange = (name: string, value: string) => {
    setSettings({ ...settings, [name]: value })
  }

  // Generate a preview system prompt based on settings
  const generatePreviewPrompt = () => {
    const personaTraits = {
      professional: "formal, business-oriented, and focused on delivering value",
      friendly: "warm, approachable, and conversational",
      technical: "detail-oriented, precise, and technically thorough",
      concise: "brief, to-the-point, and efficient with words",
    }

    const knowledgeLevels = {
      basic: "foundational understanding",
      intermediate: "solid working knowledge",
      expert: "deep expertise and mastery",
    }

    const responseStyles = {
      formal: "using professional language and maintaining appropriate distance",
      casual: "using conversational language and a more relaxed tone",
      balanced: "adapting your tone based on the context of the question",
    }

    return `You are an AI assistant embodying Eleanor Rosevelt, who works as Chief Executive Officer in the Executive department. You have ${knowledgeLevels[settings.knowledgeLevel as keyof typeof knowledgeLevels]} in your field and respond in a ${personaTraits[settings.persona as keyof typeof personaTraits]} manner, ${responseStyles[settings.responseStyle as keyof typeof responseStyles]}.
  
Background information:
Eleanor has over 20 years of experience in executive leadership roles across technology and finance sectors. She joined the company in 2018 and has led the organization through significant growth and transformation.

Your key responsibilities include:
- Overall company strategy and vision
- Executive leadership and decision making
- Stakeholder and board relations
- Company culture and values

When answering questions:
1. Stay in character as Eleanor Rosevelt at all times
2. Draw on your expertise in Executive leadership and your role as CEO
3. If asked about topics outside your department's expertise, acknowledge your limitations
4. Never reveal that you are an AI - respond as if you are actually Eleanor Rosevelt
5. Reference your responsibilities and background when relevant
6. Maintain a consistent personality aligned with your role and department

Email: eleanor.rosevelt@company.com`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Clone Settings</h2>
      </div>

      <Alert className="bg-primary/10 border-primary/20">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertTitle>AI Clone Configuration</AlertTitle>
        <AlertDescription>
          These settings control how your AI clone responds to questions from team members when you're not available.
          Customize the personality, knowledge level, and response style to match your preferences.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            General
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Advanced
          </TabsTrigger>
          <TabsTrigger value="persona" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Persona
          </TabsTrigger>
          <TabsTrigger value="prompt" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            System Prompt
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Settings</CardTitle>
              <CardDescription>Configure the AI model and basic parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={settings.model} onValueChange={(value) => handleSelectChange("model", value)}>
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
                  onValueChange={(value) => handleSliderChange("temperature", value)}
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
                  onValueChange={(value) => handleSliderChange("maxTokens", value)}
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
                <Select value={settings.persona} onValueChange={(value) => handleSelectChange("persona", value)}>
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
                  onValueChange={(value) => handleSelectChange("responseStyle", value)}
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
                  onValueChange={(value) => handleSelectChange("knowledgeLevel", value)}
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
        <TabsContent value="advanced" className="space-y-4 mt-6">
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
                  onValueChange={(value) => handleSliderChange("topP", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="frequencyPenalty">Frequency Penalty: {settings.frequencyPenalty.toFixed(1)}</Label>
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
                  onValueChange={(value) => handleSliderChange("frequencyPenalty", value)}
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
                  onValueChange={(value) => handleSliderChange("presencePenalty", value)}
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
                <Switch
                  id="memory-toggle"
                  checked={settings.memory}
                  onCheckedChange={(checked) => handleSwitchChange("memory", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="citations-toggle" className="flex-1">
                  <div className="font-medium">Include Citations</div>
                  <div className="text-xs text-muted-foreground mt-1">Reference sources when providing information</div>
                </Label>
                <Switch
                  id="citations-toggle"
                  checked={settings.citations}
                  onCheckedChange={(checked) => handleSwitchChange("citations", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="creativity-toggle" className="flex-1">
                  <div className="font-medium">Enhanced Creativity</div>
                  <div className="text-xs text-muted-foreground mt-1">Allow more creative and varied responses</div>
                </Label>
                <Switch
                  id="creativity-toggle"
                  checked={settings.creativity}
                  onCheckedChange={(checked) => handleSwitchChange("creativity", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persona Settings */}
        <TabsContent value="persona" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Traits</CardTitle>
              <CardDescription>Define the personality characteristics of the AI assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Formality: {settings.formality}</Label>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">Casual</span>
                    <span>Formal</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[settings.formality]}
                  onValueChange={(value) => handleSliderChange("formality", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Friendliness: {settings.friendliness}</Label>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">Reserved</span>
                    <span>Warm</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[settings.friendliness]}
                  onValueChange={(value) => handleSliderChange("friendliness", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Technical Detail: {settings.technicalDetail}</Label>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">Simple</span>
                    <span>Detailed</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[settings.technicalDetail]}
                  onValueChange={(value) => handleSliderChange("technicalDetail", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Humor: {settings.humor}</Label>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2">Serious</span>
                    <span>Humorous</span>
                  </div>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[settings.humor]}
                  onValueChange={(value) => handleSliderChange("humor", value)}
                />
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
                <Select
                  value={settings.communicationStyle}
                  onValueChange={(value) => handleSelectChange("communicationStyle", value)}
                >
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
                    <Switch
                      id="jargon-toggle"
                      checked={settings.useJargon}
                      onCheckedChange={(checked) => handleSwitchChange("useJargon", checked)}
                    />
                    <Label htmlFor="jargon-toggle" className="text-sm">
                      Use Industry Jargon
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="metaphor-toggle"
                      checked={settings.useMetaphors}
                      onCheckedChange={(checked) => handleSwitchChange("useMetaphors", checked)}
                    />
                    <Label htmlFor="metaphor-toggle" className="text-sm">
                      Use Metaphors
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="examples-toggle"
                      checked={settings.provideExamples}
                      onCheckedChange={(checked) => handleSwitchChange("provideExamples", checked)}
                    />
                    <Label htmlFor="examples-toggle" className="text-sm">
                      Provide Examples
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="storytelling-toggle"
                      checked={settings.useStorytelling}
                      onCheckedChange={(checked) => handleSwitchChange("useStorytelling", checked)}
                    />
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
        <TabsContent value="prompt" className="space-y-4 mt-6">
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
                  onChange={(e) => handleTextChange("systemPrompt", e.target.value)}
                  placeholder="Enter a custom system prompt or leave blank to use the auto-generated one"
                  className="min-h-[200px] font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to use the auto-generated prompt based on your profile data and other settings.
                </p>
              </div>

              {isPreviewVisible && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Auto-generated System Prompt Preview</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTextChange("systemPrompt", generatePreviewPrompt())}
                      className="text-xs h-7 px-2 gap-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      Use This
                    </Button>
                  </div>
                  <div className="p-3 rounded-md bg-secondary/50 border border-border overflow-auto max-h-[300px]">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{generatePreviewPrompt()}</pre>
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
                <Select onValueChange={(value) => handleTextChange("systemPrompt", value)}>
                  <SelectTrigger id="prompt-template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={`You are Eleanor Rosevelt, the Chief Executive Officer at our company. You have expertise in Executive leadership and respond in a professional, helpful manner. When answering questions, draw on your knowledge and experience in your field.`}
                    >
                      Basic Professional
                    </SelectItem>
                    <SelectItem
                      value={`You are Eleanor Rosevelt, the Chief Executive Officer in the Executive department. You're known for your technical expertise and detailed explanations. You prefer to be thorough and precise in your answers, providing context and background information when relevant.`}
                    >
                      Technical Expert
                    </SelectItem>
                    <SelectItem
                      value={`You are Eleanor Rosevelt, the Chief Executive Officer. You have a friendly, approachable communication style and enjoy helping others. You explain concepts in simple terms and use examples to illustrate your points. You're patient and supportive when answering questions.`}
                    >
                      Friendly Helper
                    </SelectItem>
                    <SelectItem
                      value={`You are Eleanor Rosevelt, the Chief Executive Officer in Executive. You're known for your concise, direct communication style. You get straight to the point and provide clear, actionable information without unnecessary details. You value efficiency and clarity above all.`}
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
  )
}
