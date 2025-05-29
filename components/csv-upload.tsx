"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, FileSpreadsheet, Upload, X } from "lucide-react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { Organization, Department, PersonInsert, OrgChartPerson } from "@/types/database"

// Required and optional columns for the CSV
const REQUIRED_COLUMNS = ["name", "email", "role", "department"]
const OPTIONAL_COLUMNS = ["manager_email", "bio", "phone", "location", "timezone", "responsibilities"]
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

// Sample CSV template
const CSV_TEMPLATE = `name,email,role,department,manager_email,bio,phone,location,timezone,responsibilities
John Doe,john.doe@company.com,CEO,Executive,,20 years of leadership experience,555-123-4567,New York,America/New_York,"Strategic planning, Executive leadership"
Jane Smith,jane.smith@company.com,CTO,Technology,john.doe@company.com,15 years in tech leadership,555-234-5678,San Francisco,America/Los_Angeles,"Technology strategy, Engineering management"
Bob Johnson,bob.johnson@company.com,Engineering Manager,Engineering,jane.smith@company.com,10 years of engineering experience,555-345-6789,Seattle,America/Los_Angeles,"Team leadership, Software architecture"
Alice Williams,alice.williams@company.com,Senior Developer,Engineering,bob.johnson@company.com,8 years of development experience,555-456-7890,Remote,Europe/London,"Frontend development, UI/UX design"
`

interface CSVPerson {
  name: string
  email: string
  role: string
  department: string
  manager_email?: string
  bio?: string
  phone?: string
  location?: string
  timezone?: string
  responsibilities?: string
}

interface UploadStats {
  total: number
  processed: number
  success: number
  failed: number
  skipped: number
}

export default function CSVUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [csvData, setCsvData] = useState<CSVPerson[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("upload")
  const [organizationName, setOrganizationName] = useState("My Organization")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setFile(null)
    setCsvData([])
    setValidationErrors([])
    setUploadStats({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    })
    setIsUploading(false)
    setUploadComplete(false)
    setUploadError(null)
    setSelectedTab("upload")
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFile(file)
        parseCSV(file)
      } else {
        setValidationErrors(["Please upload a CSV file."])
      }
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFile(file)
        parseCSV(file)
      } else {
        setValidationErrors(["Please upload a CSV file."])
      }
    }
  }

  const parseCSV = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Normalize column names (lowercase, trim, replace spaces with underscores)
        const normalizedData = results.data.map(row => {
          const normalizedRow: Record<string, string> = {}
          Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_')
            normalizedRow[normalizedKey] = value
          })
          return normalizedRow as unknown as CSVPerson
        })
        
        setCsvData(normalizedData)
        validateCSV(normalizedData)
      },
      error: (error) => {
        setValidationErrors([`Error parsing CSV: ${error.message}`])
      }
    })
  }

  const validateCSV = (data: CSVPerson[]) => {
    const errors: string[] = []

    if (data.length === 0) {
      errors.push("CSV file is empty.")
      setValidationErrors(errors)
      return
    }

    // Check for required columns
    const firstRow = data[0]
    const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow))
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`)
    }

    // Check for duplicate emails
    const emails = data.map(row => row.email)
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index)
    
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate email addresses found: ${[...new Set(duplicateEmails)].join(", ")}`)
    }

    // Validate manager emails exist in the dataset
    const allEmails = new Set(emails)
    const invalidManagerEmails = data
      .filter(row => row.manager_email && !allEmails.has(row.manager_email))
      .map(row => `${row.name} (${row.email}) has manager_email ${row.manager_email} that doesn't exist in the dataset`)
    
    if (invalidManagerEmails.length > 0) {
      errors.push(`Invalid manager emails: ${invalidManagerEmails.join(", ")}`)
    }

    // Check for circular references in manager relationships
    const managerMap = new Map<string, string>()
    data.forEach(row => {
      if (row.manager_email) {
        managerMap.set(row.email, row.manager_email)
      }
    })

    data.forEach(row => {
      if (row.manager_email) {
        let currentEmail = row.email
        const visited = new Set<string>()
        
        while (managerMap.has(currentEmail)) {
          if (visited.has(currentEmail)) {
            errors.push(`Circular manager reference detected for ${row.name} (${row.email})`)
            break
          }
          
          visited.add(currentEmail)
          currentEmail = managerMap.get(currentEmail)!
        }
      }
    })

    setValidationErrors(errors)
  }

  const handleUpload = async () => {
    if (validationErrors.length > 0) {
      setUploadError("Please fix validation errors before uploading.")
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadComplete(false)
    setSelectedTab("progress")

    try {
      // Step 1: Create or get organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', organizationName)
        .maybeSingle()

      let organizationId: string
      
      if (orgError) throw new Error(`Error fetching organization: ${orgError.message}`)
      
      if (!orgData) {
        // Create new organization
        const { data: newOrg, error: newOrgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (newOrgError || !newOrg) throw new Error(`Error creating organization: ${newOrgError?.message}`)
        organizationId = newOrg.id
      } else {
        organizationId = orgData.id
      }

      // Step 2: Create departments
      const departments = [...new Set(csvData.map(person => person.department))]
      const departmentMap = new Map<string, string>()
      
      for (const deptName of departments) {
        const { data: existingDept, error: deptCheckError } = await supabase
          .from('departments')
          .select('id')
          .eq('name', deptName)
          .eq('organization_id', organizationId)
          .maybeSingle()
        
        if (deptCheckError) throw new Error(`Error checking department: ${deptCheckError.message}`)
        
        if (existingDept) {
          departmentMap.set(deptName, existingDept.id)
        } else {
          const { data: newDept, error: newDeptError } = await supabase
            .from('departments')
            .insert({
              name: deptName,
              organization_id: organizationId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (newDeptError || !newDept) throw new Error(`Error creating department: ${newDeptError?.message}`)
          departmentMap.set(deptName, newDept.id)
        }
      }

      // Step 3: Create people
      const emailToIdMap = new Map<string, string>()
      setUploadStats(prev => ({ ...prev, total: csvData.length }))
      
      for (let i = 0; i < csvData.length; i++) {
        const person = csvData[i]
        
        try {
          // Check if person already exists
          const { data: existingPerson, error: personCheckError } = await supabase
            .from('people')
            .select('id')
            .eq('email', person.email)
            .maybeSingle()
          
          if (personCheckError) throw new Error(`Error checking person: ${personCheckError.message}`)
          
          let personId: string
          
          if (existingPerson) {
            // Update existing person
            const { data: updatedPerson, error: updateError } = await supabase
              .from('people')
              .update({
                name: person.name,
                role: person.role,
                department_id: departmentMap.get(person.department)!,
                phone: person.phone || null,
                location: person.location || null,
                timezone: person.timezone || null,
                bio: person.bio || null,
                responsibilities: person.responsibilities ? person.responsibilities.split(',').map(r => r.trim()) : null,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingPerson.id)
              .select()
              .single()
            
            if (updateError || !updatedPerson) throw new Error(`Error updating person: ${updateError?.message}`)
            personId = updatedPerson.id
            setUploadStats(prev => ({ ...prev, processed: prev.processed + 1, success: prev.success + 1 }))
          } else {
            // Create new person
            const { data: newPerson, error: createError } = await supabase
              .from('people')
              .insert({
                name: person.name,
                email: person.email,
                role: person.role,
                department_id: departmentMap.get(person.department)!,
                phone: person.phone || null,
                location: person.location || null,
                timezone: person.timezone || null,
                bio: person.bio || null,
                responsibilities: person.responsibilities ? person.responsibilities.split(',').map(r => r.trim()) : null,
                organization_id: organizationId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()
            
            if (createError || !newPerson) throw new Error(`Error creating person: ${createError?.message}`)
            personId = newPerson.id
            setUploadStats(prev => ({ ...prev, processed: prev.processed + 1, success: prev.success + 1 }))
          }
          
          emailToIdMap.set(person.email, personId)
        } catch (error) {
          console.error(`Error processing person ${person.name}:`, error)
          setUploadStats(prev => ({ ...prev, processed: prev.processed + 1, failed: prev.failed + 1 }))
        }
      }

      // Step 4: Create reporting relationships
      for (const person of csvData) {
        if (person.manager_email && emailToIdMap.has(person.email) && emailToIdMap.has(person.manager_email)) {
          try {
            const reportId = emailToIdMap.get(person.email)!
            const managerId = emailToIdMap.get(person.manager_email)!
            
            // Check if relationship already exists
            const { data: existingRelation, error: relationCheckError } = await supabase
              .from('reporting_relationships')
              .select('id')
              .eq('report_id', reportId)
              .eq('manager_id', managerId)
              .maybeSingle()
            
            if (relationCheckError) throw new Error(`Error checking relationship: ${relationCheckError.message}`)
            
            if (!existingRelation) {
              // Create new relationship
              const { error: createRelationError } = await supabase
                .from('reporting_relationships')
                .insert({
                  report_id: reportId,
                  manager_id: managerId,
                  organization_id: organizationId,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
              
              if (createRelationError) throw new Error(`Error creating relationship: ${createRelationError.message}`)
            }
          } catch (error) {
            console.error(`Error creating relationship for ${person.name}:`, error)
          }
        }
      }

      setUploadComplete(true)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'org_chart_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Organization Chart Setup</CardTitle>
        <CardDescription>
          Upload a CSV file with your team structure to create an interactive organization chart.
        </CardDescription>
      </CardHeader>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-3 mx-6">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="preview" disabled={!file || csvData.length === 0}>Preview Data</TabsTrigger>
          <TabsTrigger value="progress" disabled={!isUploading && !uploadComplete}>Progress</TabsTrigger>
        </TabsList>
        
        <CardContent className="p-6">
          <TabsContent value="upload" className="mt-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input 
                  id="organization" 
                  value={organizationName} 
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Enter your organization name" 
                />
              </div>
              
              <Separator />
              
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                } ${file ? "bg-muted/50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB • {csvData.length} records
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetState}>
                      <X className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-muted-foreground mb-2 mx-auto" />
                    <h3 className="font-medium text-lg">Drag & Drop CSV File</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  Download Template
                </Button>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || validationErrors.length > 0 || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload and Create Org Chart"}
                </Button>
              </div>
              
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Errors</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm space-y-2">
                <h4 className="font-medium">CSV Format Requirements:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-xs">Required Columns:</h5>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">
                      {REQUIRED_COLUMNS.map((col) => (
                        <li key={col}>{col}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-xs">Optional Columns:</h5>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground">
                      {OPTIONAL_COLUMNS.map((col) => (
                        <li key={col}>{col}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Data Preview</h3>
                <Badge variant="outline">
                  {csvData.length} Records
                </Badge>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {ALL_COLUMNS.map((col) => (
                          <TableHead key={col} className="whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <TableRow key={index}>
                          {ALL_COLUMNS.map((col) => (
                            <TableCell key={col} className="whitespace-nowrap">
                              {row[col as keyof CSVPerson] || "-"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {csvData.length > 10 && (
                        <TableRow>
                          <TableCell colSpan={ALL_COLUMNS.length} className="text-center text-muted-foreground">
                            + {csvData.length - 10} more records
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTab("upload")}>
                  Back
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={validationErrors.length > 0 || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload and Create Org Chart"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Upload Progress</h3>
                  <Badge variant={uploadComplete ? "success" : "outline"}>
                    {uploadComplete ? "Complete" : isUploading ? "Uploading..." : "Idle"}
                  </Badge>
                </div>
                
                <Progress value={(uploadStats.processed / uploadStats.total) * 100} className="h-2" />
                
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="font-medium">{uploadStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="font-medium">{uploadStats.processed}</p>
                    <p className="text-xs text-muted-foreground">Processed</p>
                  </div>
                  <div>
                    <p className="font-medium text-green-500">{uploadStats.success}</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div>
                    <p className="font-medium text-red-500">{uploadStats.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>
              </div>
              
              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              
              {uploadComplete && (
                <Alert variant="success" className="bg-green-500/10 border-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Upload Complete</AlertTitle>
                  <AlertDescription>
                    Your organization chart has been created successfully. You can now view and interact with it.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-6">
          {uploadComplete ? (
            <div className="w-full flex justify-between">
              <Button variant="outline" onClick={resetState}>
                Upload Another File
              </Button>
              <Button onClick={() => window.location.href = "/"}>
                View Organization Chart
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with your team structure to create an interactive organization chart.
              <br />
              For large organizations, consider breaking the upload into smaller departments.
            </p>
          )}
        </CardFooter>
      </Tabs>
    </Card>
  )
}
