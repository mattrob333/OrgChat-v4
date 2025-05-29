"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, FileSpreadsheet, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CSVUpload from "@/components/csv-upload"

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<string>("upload")

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Organization Chart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          <span className="text-primary">Organization</span> Data Upload
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CSVUpload />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                Upload Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to create your organization chart
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="format">CSV Format</TabsTrigger>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Prepare Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a CSV file with your organization structure. You can download our template to get started.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Upload the File</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your CSV file or use the browse button to select it from your computer.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Review and Confirm</h3>
                    <p className="text-sm text-muted-foreground">
                      Preview the data to ensure it's correct, then click "Upload and Create Org Chart".
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="format" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Required Columns</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li><span className="font-medium">name</span> - Full name of the employee</li>
                      <li><span className="font-medium">email</span> - Email address (must be unique)</li>
                      <li><span className="font-medium">role</span> - Job title or position</li>
                      <li><span className="font-medium">department</span> - Department or team name</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Optional Columns</h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                      <li><span className="font-medium">manager_email</span> - Email of the person's manager</li>
                      <li><span className="font-medium">bio</span> - Short biography or description</li>
                      <li><span className="font-medium">phone</span> - Phone number</li>
                      <li><span className="font-medium">location</span> - Office location or remote</li>
                      <li><span className="font-medium">timezone</span> - Preferred timezone</li>
                      <li><span className="font-medium">responsibilities</span> - Comma-separated list</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="tips" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Reporting Structure</h3>
                    <p className="text-sm text-muted-foreground">
                      The <span className="font-medium">manager_email</span> column defines the reporting structure. 
                      The CEO or top-level person should have this field empty.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Large Organizations</h3>
                    <p className="text-sm text-muted-foreground">
                      For large organizations, consider uploading department by department to make validation easier.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Data Validation</h3>
                    <p className="text-sm text-muted-foreground">
                      The system will check for circular references, duplicate emails, and missing required fields.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                Sample CSV
              </CardTitle>
              <CardDescription>
                Example of a properly formatted CSV file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono">
                <pre>name,email,role,department,manager_email
John Doe,john.doe@company.com,CEO,Executive,
Jane Smith,jane.smith@company.com,CTO,Technology,john.doe@company.com
Bob Johnson,bob.johnson@company.com,Engineering Manager,Engineering,jane.smith@company.com
Alice Williams,alice.williams@company.com,Senior Developer,Engineering,bob.johnson@company.com</pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Download Sample CSV
              </Button>
            </CardFooter>
          </Card>

          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription>
              If you need assistance with your data upload, please check our documentation or contact support.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  )
}
