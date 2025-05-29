"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Eye,
  FileArchive,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileCode,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: string
  status: "private" | "shared" | "ai-only"
  icon: React.ReactNode
}

export default function DocumentUpload() {
  const [activeTab, setActiveTab] = useState("all")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Mock documents data
  const documents: Document[] = [
    {
      id: "doc-1",
      name: "Q1 2023 Strategy.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2023-04-15",
      status: "private",
      icon: <FilePdf className="h-4 w-4 text-red-500" />,
    },
    {
      id: "doc-2",
      name: "Team Structure.xlsx",
      type: "Spreadsheet",
      size: "1.8 MB",
      uploadDate: "2023-05-20",
      status: "shared",
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
    },
    {
      id: "doc-3",
      name: "Project Timeline.docx",
      type: "Document",
      size: "950 KB",
      uploadDate: "2023-06-10",
      status: "ai-only",
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    },
    {
      id: "doc-4",
      name: "Company Handbook.pdf",
      type: "PDF",
      size: "5.2 MB",
      uploadDate: "2023-03-05",
      status: "shared",
      icon: <FilePdf className="h-4 w-4 text-red-500" />,
    },
    {
      id: "doc-5",
      name: "Brand Assets.zip",
      type: "Archive",
      size: "24.6 MB",
      uploadDate: "2023-02-18",
      status: "private",
      icon: <FileArchive className="h-4 w-4 text-yellow-500" />,
    },
    {
      id: "doc-6",
      name: "API Documentation.json",
      type: "Code",
      size: "340 KB",
      uploadDate: "2023-07-01",
      status: "ai-only",
      icon: <FileCode className="h-4 w-4 text-purple-500" />,
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
    }
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) return

    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setUploadProgress(null), 1000)
          setSelectedFiles([])
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const filteredDocuments = activeTab === "all" ? documents : documents.filter((doc) => doc.status === activeTab)

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "private":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Private
          </Badge>
        )
      case "shared":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Shared
          </Badge>
        )
      case "ai-only":
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            AI Access
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card/50">
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-medium">Upload Documents</h3>
          <p className="text-sm text-muted-foreground">
            Upload documents that your AI clone can reference when answering questions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="file-upload">Select Files</Label>
              <Input id="file-upload" type="file" multiple onChange={handleFileChange} className="mt-1" />
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="private" defaultChecked />
                  <Label htmlFor="private" className="text-sm font-normal">
                    Private
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="shared" />
                  <Label htmlFor="shared" className="text-sm font-normal">
                    Shared
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ai-only" />
                  <Label htmlFor="ai-only" className="text-sm font-normal">
                    AI Only
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Selected files:</p>
              <ul className="text-sm text-muted-foreground">
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadProgress !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploadProgress !== null}
            className="w-full md:w-auto gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              All Documents
            </TabsTrigger>
            <TabsTrigger value="private" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              Private
            </TabsTrigger>
            <TabsTrigger value="shared" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              Shared
            </TabsTrigger>
            <TabsTrigger value="ai-only" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              AI Access
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {doc.icon}
                      {doc.name}
                    </TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>{doc.uploadDate}</TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
