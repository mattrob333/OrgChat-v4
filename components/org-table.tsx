"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Edit, 
  FileSpreadsheet, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Save, 
  Search, 
  Trash2, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle2,
  ArrowUpDown
} from "lucide-react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { 
  getOrgChartData, 
  getOrganizations, 
  getDepartments,
  clearCache
} from "@/lib/org-service"
import type { Person } from "@/types/person"
import type { 
  Organization, 
  Department, 
  PersonInsert, 
  OrgChartPerson 
} from "@/types/database"

// Enneagram types
const ENNEAGRAM_TYPES = [
  { id: "1", name: "Type 1 - The Reformer" },
  { id: "2", name: "Type 2 - The Helper" },
  { id: "3", name: "Type 3 - The Achiever" },
  { id: "4", name: "Type 4 - The Individualist" },
  { id: "5", name: "Type 5 - The Investigator" },
  { id: "6", name: "Type 6 - The Loyalist" },
  { id: "7", name: "Type 7 - The Enthusiast" },
  { id: "8", name: "Type 8 - The Challenger" },
  { id: "9", name: "Type 9 - The Peacemaker" }
]

// Required and optional columns for the CSV
const REQUIRED_COLUMNS = ["name", "email", "role", "department"]
const OPTIONAL_COLUMNS = [
  "manager_email", 
  "bio", 
  "phone", 
  "location", 
  "timezone", 
  "responsibilities",
  "enneagram_type"
]
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS]

// Sample CSV template with enneagram type
const CSV_TEMPLATE = `name,email,role,department,manager_email,enneagram_type,bio,phone,location,timezone,responsibilities
John Doe,john.doe@company.com,CEO,Executive,,8,20 years of leadership experience,555-123-4567,New York,America/New_York,"Strategic planning, Executive leadership"
Jane Smith,jane.smith@company.com,CTO,Technology,john.doe@company.com,5,15 years in tech leadership,555-234-5678,San Francisco,America/Los_Angeles,"Technology strategy, Engineering management"
Bob Johnson,bob.johnson@company.com,Engineering Manager,Engineering,jane.smith@company.com,1,10 years of engineering experience,555-345-6789,Seattle,America/Los_Angeles,"Team leadership, Software architecture"
Alice Williams,alice.williams@company.com,Senior Developer,Engineering,bob.johnson@company.com,4,8 years of development experience,555-456-7890,Remote,Europe/London,"Frontend development, UI/UX design"
`

interface TablePerson extends OrgChartPerson {
  manager_name?: string;
  manager_email?: string;
  department_name?: string;
  isEditing?: boolean;
  enneagram_type?: string;
}

interface CSVPerson {
  name: string;
  email: string;
  role: string;
  department: string;
  manager_email?: string;
  enneagram_type?: string;
  bio?: string;
  phone?: string;
  location?: string;
  timezone?: string;
  responsibilities?: string;
}

interface UploadStats {
  total: number;
  processed: number;
  success: number;
  failed: number;
  skipped: number;
}

interface SortConfig {
  key: keyof TablePerson | "";
  direction: "asc" | "desc";
}

interface OrgTableProps {
  onSelectPerson?: (person: Person) => void;
  containerWidth?: number;
  organizationId?: string;
}

export default function OrgTable({
  onSelectPerson,
  containerWidth = 800,
  organizationId,
}: OrgTableProps) {
  // State for table data
  const [people, setPeople] = useState<TablePerson[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<TablePerson[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  
  // State for editing
  const [editingPerson, setEditingPerson] = useState<TablePerson | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for sorting and filtering
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  
  // State for CSV upload
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState<CSVPerson[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("upload");
  const [organizationName, setOrganizationName] = useState("My Organization");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [newPerson, setNewPerson] = useState<Partial<TablePerson>>({
    name: "",
    email: "",
    role: "",
    department_id: "",
    manager_id: "",
    enneagram_type: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organizations
        const orgs = await getOrganizations();
        setOrganizations(orgs);
        
        // Set default organization if not already set
        if (orgs.length > 0 && !selectedOrganization) {
          const orgId = organizationId || orgs[0].id;
          setSelectedOrganization(orgId);
          
          // Fetch departments for this organization
          const depts = await getDepartments(orgId);
          setDepartments(depts);
          
          // Fetch org chart data
          const orgChartData = await getOrgChartData(orgId);
          
          // Transform data for table display
          const tableData = await transformOrgChartForTable(orgChartData);
          setPeople(tableData);
          setFilteredPeople(tableData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load organization data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [organizationId, selectedOrganization]);

  // Transform org chart data for table display
  const transformOrgChartForTable = async (orgChartData: OrgChartPerson): Promise<TablePerson[]> => {
    const tableData: TablePerson[] = [];
    
    // Function to recursively flatten the org chart
    const flattenOrgChart = async (person: OrgChartPerson, managerName?: string, managerEmail?: string) => {
      // Get department name
      let departmentName = "";
      if (person.department_id) {
        const dept = departments.find(d => d.id === person.department_id);
        departmentName = dept?.name || "";
      }
      
      // Get manager email
      let manager_email = managerEmail || "";
      if (person.manager_id && !managerEmail) {
        const { data } = await supabase
          .from('people')
          .select('email')
          .eq('id', person.manager_id)
          .single();
          
        if (data) {
          manager_email = data.email;
        }
      }
      
      // Add person to table data
      tableData.push({
        ...person,
        manager_name: managerName,
        manager_email,
        department_name: departmentName,
        isEditing: false,
      });
      
      // Process children recursively
      if (person.children && person.children.length > 0) {
        for (const child of person.children) {
          await flattenOrgChart(child, person.name, person.email);
        }
      }
    };
    
    // Start with the root person
    await flattenOrgChart(orgChartData);
    
    return tableData;
  };

  // Handle sorting
  const handleSort = (key: keyof TablePerson) => {
    let direction: "asc" | "desc" = "asc";
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    
    setSortConfig({ key, direction });
    
    const sortedData = [...filteredPeople].sort((a, b) => {
      if (a[key] === null || a[key] === undefined) return 1;
      if (b[key] === null || b[key] === undefined) return -1;
      
      if (typeof a[key] === 'string' && typeof b[key] === 'string') {
        return direction === "asc" 
          ? (a[key] as string).localeCompare(b[key] as string)
          : (b[key] as string).localeCompare(a[key] as string);
      }
      
      return direction === "asc" 
        ? (a[key] as number) - (b[key] as number)
        : (b[key] as number) - (a[key] as number);
    });
    
    setFilteredPeople(sortedData);
  };

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...people];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(person => 
        person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.manager_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(person => person.department_id === departmentFilter);
    }
    
    // Apply sorting if set
    if (sortConfig.key) {
      filtered = filtered.sort((a, b) => {
        if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
        
        if (typeof a[sortConfig.key] === 'string' && typeof b[sortConfig.key] === 'string') {
          return sortConfig.direction === "asc" 
            ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
            : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
        }
        
        return sortConfig.direction === "asc" 
          ? (a[sortConfig.key] as number) - (b[sortConfig.key] as number)
          : (b[sortConfig.key] as number) - (a[sortConfig.key] as number);
      });
    }
    
    setFilteredPeople(filtered);
  }, [searchTerm, departmentFilter, people, sortConfig]);

  // Handle editing
  const startEditing = (person: TablePerson) => {
    setEditingId(person.id);
    setEditingPerson({ ...person });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingPerson(null);
  };

  const saveEditing = async () => {
    if (!editingPerson) return;
    
    try {
      // Update person in Supabase
      const { error: personError } = await supabase
        .from('people')
        .update({
          name: editingPerson.name,
          email: editingPerson.email,
          role: editingPerson.role,
          department_id: editingPerson.department_id,
          bio: editingPerson.bio,
          phone: editingPerson.phone,
          location: editingPerson.location,
          timezone: editingPerson.timezone,
          enneagram_type: editingPerson.enneagram_type,
        })
        .eq('id', editingPerson.id);
        
      if (personError) throw personError;
      
      // Update reporting relationship if manager changed
      if (editingPerson.manager_email) {
        // Get manager ID from email
        const { data: managerData } = await supabase
          .from('people')
          .select('id')
          .eq('email', editingPerson.manager_email)
          .single();
          
        if (managerData) {
          // Check if relationship already exists
          const { data: existingRelationship } = await supabase
            .from('reporting_relationships')
            .select('*')
            .eq('report_id', editingPerson.id);
            
          if (existingRelationship && existingRelationship.length > 0) {
            // Update existing relationship
            const { error: relationshipError } = await supabase
              .from('reporting_relationships')
              .update({ manager_id: managerData.id })
              .eq('report_id', editingPerson.id);
              
            if (relationshipError) throw relationshipError;
          } else {
            // Create new relationship
            const { error: relationshipError } = await supabase
              .from('reporting_relationships')
              .insert({ manager_id: managerData.id, report_id: editingPerson.id });
              
            if (relationshipError) throw relationshipError;
          }
        }
      } else {
        // Remove reporting relationship if manager is empty
        const { error: deleteError } = await supabase
          .from('reporting_relationships')
          .delete()
          .eq('report_id', editingPerson.id);
          
        if (deleteError) throw deleteError;
      }
      
      // Clear cache and refresh data
      clearCache();
      refreshData();
      
      // Reset editing state
      setEditingId(null);
      setEditingPerson(null);
    } catch (err) {
      console.error("Error saving changes:", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  // Handle adding a new person
  const handleAddPerson = async () => {
    try {
      if (!newPerson.name || !newPerson.email || !newPerson.role || !newPerson.department_id) {
        setError("Name, email, role, and department are required.");
        return;
      }
      
      // Check if email already exists
      const { data: existingPerson } = await supabase
        .from('people')
        .select('id')
        .eq('email', newPerson.email);
        
      if (existingPerson && existingPerson.length > 0) {
        setError("A person with this email already exists.");
        return;
      }
      
      // Insert new person
      const { data: personData, error: personError } = await supabase
        .from('people')
        .insert({
          name: newPerson.name,
          email: newPerson.email,
          role: newPerson.role,
          department_id: newPerson.department_id,
          organization_id: selectedOrganization,
          bio: newPerson.bio || null,
          phone: newPerson.phone || null,
          location: newPerson.location || null,
          timezone: newPerson.timezone || null,
          enneagram_type: newPerson.enneagram_type || null,
        })
        .select();
        
      if (personError) throw personError;
      
      // Add reporting relationship if manager is specified
      if (newPerson.manager_id) {
        const { error: relationshipError } = await supabase
          .from('reporting_relationships')
          .insert({
            manager_id: newPerson.manager_id,
            report_id: personData[0].id,
          });
          
        if (relationshipError) throw relationshipError;
      }
      
      // Clear cache and refresh data
      clearCache();
      refreshData();
      
      // Reset new person form
      setNewPerson({
        name: "",
        email: "",
        role: "",
        department_id: "",
        manager_id: "",
        enneagram_type: "",
      });
      
      // Close add person dialog
      setIsAddingPerson(false);
    } catch (err) {
      console.error("Error adding person:", err);
      setError("Failed to add person. Please try again.");
    }
  };

  // Handle deleting a person
  const handleDeletePerson = async (personId: string) => {
    try {
      // First delete reporting relationships
      const { error: relationshipError } = await supabase
        .from('reporting_relationships')
        .delete()
        .or(`manager_id.eq.${personId},report_id.eq.${personId}`);
        
      if (relationshipError) throw relationshipError;
      
      // Then delete the person
      const { error: personError } = await supabase
        .from('people')
        .delete()
        .eq('id', personId);
        
      if (personError) throw personError;
      
      // Clear cache and refresh data
      clearCache();
      refreshData();
    } catch (err) {
      console.error("Error deleting person:", err);
      setError("Failed to delete person. Please try again.");
    }
  };

  // Refresh data
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Clear cache to ensure fresh data
      clearCache();
      
      // Fetch org chart data
      const orgChartData = await getOrgChartData(selectedOrganization);
      
      // Transform data for table display
      const tableData = await transformOrgChartForTable(orgChartData);
      setPeople(tableData);
      setFilteredPeople(tableData);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Upload Functions
  const resetUploadState = () => {
    setFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setUploadStats({
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    });
    setIsUploading(false);
    setUploadComplete(false);
    setUploadError(null);
    setSelectedTab("upload");
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFile(file);
        parseCSV(file);
      } else {
        setValidationErrors(["Please upload a CSV file."]);
      }
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setFile(file);
        parseCSV(file);
      } else {
        setValidationErrors(["Please upload a CSV file."]);
      }
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Normalize column names (lowercase, trim, replace spaces with underscores)
        const normalizedData = results.data.map(row => {
          const normalizedRow: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, '_');
            normalizedRow[normalizedKey] = value;
          });
          return normalizedRow as unknown as CSVPerson;
        });
        
        setCsvData(normalizedData);
        validateCSV(normalizedData);
      },
      error: (error) => {
        setValidationErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };

  const validateCSV = (data: CSVPerson[]) => {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push("CSV file is empty.");
      setValidationErrors(errors);
      return;
    }

    // Check for required columns
    const firstRow = data[0];
    const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Check for duplicate emails
    const emails = data.map(row => row.email);
    const duplicateEmails = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicateEmails.length > 0) {
      errors.push(`Duplicate email addresses found: ${[...new Set(duplicateEmails)].join(", ")}`);
    }

    // Validate manager emails exist in the dataset
    const allEmails = new Set(emails);
    const invalidManagerEmails = data
      .filter(row => row.manager_email && !allEmails.has(row.manager_email))
      .map(row => `${row.name} (${row.email}) has manager_email ${row.manager_email} that doesn't exist in the dataset`);
    
    if (invalidManagerEmails.length > 0) {
      errors.push(`Invalid manager emails: ${invalidManagerEmails.join(", ")}`);
    }

    // Check for circular references in manager relationships
    const managerMap = new Map<string, string>();
    data.forEach(row => {
      if (row.manager_email) {
        managerMap.set(row.email, row.manager_email);
      }
    });

    data.forEach(row => {
      if (row.manager_email) {
        let currentEmail = row.manager_email;
        const visited = new Set<string>([row.email]);
        
        while (currentEmail && !visited.has(currentEmail)) {
          visited.add(currentEmail);
          currentEmail = managerMap.get(currentEmail) || "";
        }
        
        if (currentEmail === row.email) {
          errors.push(`Circular reference detected: ${row.name} (${row.email}) is in a reporting loop.`);
        }
      }
    });

    // Validate enneagram types
    const invalidEnneagramTypes = data
      .filter(row => row.enneagram_type && !["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(row.enneagram_type))
      .map(row => `${row.name} (${row.email}) has invalid enneagram type: ${row.enneagram_type}`);
    
    if (invalidEnneagramTypes.length > 0) {
      errors.push(`Invalid enneagram types: ${invalidEnneagramTypes.join(", ")}. Must be a number from 1-9.`);
    }

    setValidationErrors(errors);
  };

  const uploadCSV = async () => {
    if (validationErrors.length > 0) {
      setUploadError("Please fix validation errors before uploading.");
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);
    setUploadError(null);
    setSelectedTab("progress");
    
    const stats: UploadStats = {
      total: csvData.length,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
    };
    
    try {
      // Get or create organization
      let organizationId = selectedOrganization;
      
      if (!organizationId) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', organizationName)
          .maybeSingle();
          
        if (orgError) throw orgError;
        
        if (orgData) {
          organizationId = orgData.id;
        } else {
          const { data: newOrg, error: newOrgError } = await supabase
            .from('organizations')
            .insert({ name: organizationName })
            .select();
            
          if (newOrgError) throw newOrgError;
          organizationId = newOrg[0].id;
        }
        
        setSelectedOrganization(organizationId);
      }
      
      // Process each person
      for (const row of csvData) {
        try {
          stats.processed++;
          
          // Get or create department
          let departmentId: string;
          const { data: deptData, error: deptError } = await supabase
            .from('departments')
            .select('id')
            .eq('name', row.department)
            .eq('organization_id', organizationId)
            .maybeSingle();
            
          if (deptError) throw deptError;
          
          if (deptData) {
            departmentId = deptData.id;
          } else {
            const { data: newDept, error: newDeptError } = await supabase
              .from('departments')
              .insert({
                name: row.department,
                organization_id: organizationId,
              })
              .select();
              
            if (newDeptError) throw newDeptError;
            departmentId = newDept[0].id;
          }
          
          // Check if person already exists
          const { data: existingPerson, error: existingError } = await supabase
            .from('people')
            .select('id')
            .eq('email', row.email)
            .maybeSingle();
            
          if (existingError) throw existingError;
          
          let personId: string;
          
          if (existingPerson) {
            // Update existing person
            const { data: updatedPerson, error: updateError } = await supabase
              .from('people')
              .update({
                name: row.name,
                role: row.role,
                department_id: departmentId,
                organization_id: organizationId,
                bio: row.bio || null,
                phone: row.phone || null,
                location: row.location || null,
                timezone: row.timezone || null,
                enneagram_type: row.enneagram_type || null,
              })
              .eq('id', existingPerson.id)
              .select();
              
            if (updateError) throw updateError;
            personId = existingPerson.id;
            stats.skipped++;
          } else {
            // Create new person
            const { data: newPerson, error: insertError } = await supabase
              .from('people')
              .insert({
                name: row.name,
                email: row.email,
                role: row.role,
                department_id: departmentId,
                organization_id: organizationId,
                bio: row.bio || null,
                phone: row.phone || null,
                location: row.location || null,
                timezone: row.timezone || null,
                enneagram_type: row.enneagram_type || null,
              })
              .select();
              
            if (insertError) throw insertError;
            personId = newPerson[0].id;
            stats.success++;
          }
          
          // Update upload stats
          setUploadStats({ ...stats });
        } catch (error) {
          console.error(`Error processing ${row.name} (${row.email}):`, error);
          stats.failed++;
          setUploadStats({ ...stats });
        }
      }
      
      // Process manager relationships after all people are created
      for (const row of csvData) {
        if (row.manager_email) {
          try {
            // Get person ID
            const { data: person, error: personError } = await supabase
              .from('people')
              .select('id')
              .eq('email', row.email)
              .single();
              
            if (personError) throw personError;
            
            // Get manager ID
            const { data: manager, error: managerError } = await supabase
              .from('people')
              .select('id')
              .eq('email', row.manager_email)
              .single();
              
            if (managerError) throw managerError;
            
            // Check if relationship already exists
            const { data: existingRel, error: relError } = await supabase
              .from('reporting_relationships')
              .select('id')
              .eq('report_id', person.id)
              .maybeSingle();
              
            if (relError) throw relError;
            
            if (existingRel) {
              // Update existing relationship
              const { error: updateError } = await supabase
                .from('reporting_relationships')
                .update({ manager_id: manager.id })
                .eq('id', existingRel.id);
                
              if (updateError) throw updateError;
            } else {
              // Create new relationship
              const { error: insertError } = await supabase
                .from('reporting_relationships')
                .insert({
                  manager_id: manager.id,
                  report_id: person.id,
                });
                
              if (insertError) throw insertError;
            }
          } catch (error) {
            console.error(`Error processing manager relationship for ${row.email}:`, error);
          }
        }
      }
      
      // Clear cache and refresh data
      clearCache();
      refreshData();
      
      setUploadComplete(true);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadError("An error occurred during the upload process.");
    } finally {
      setIsUploading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV data
    const csvData = filteredPeople.map(person => ({
      name: person.name,
      email: person.email,
      role: person.role,
      department: departments.find(d => d.id === person.department_id)?.name || "",
      manager_email: person.manager_email || "",
      enneagram_type: person.enneagram_type || "",
      bio: person.bio || "",
      phone: person.phone || "",
      location: person.location || "",
      timezone: person.timezone || "",
      responsibilities: person.responsibilities || "",
    }));
    
    // Convert to CSV string
    const csv = Papa.unparse(csvData);
    
    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `org_chart_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV template
  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "org_chart_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold">Organization Table</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isLoading}
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsUploadDialogOpen(true)}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            onClick={() => setIsAddingPerson(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Button>
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={selectedOrganization}
          onValueChange={setSelectedOrganization}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="ml-1 h-4 w-4" /> 
                      : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                  {sortConfig.key !== 'name' && (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  Role
                  {sortConfig.key === 'role' && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="ml-1 h-4 w-4" /> 
                      : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                  {sortConfig.key !== 'role' && (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('department_name')}
                >
                  Department
                  {sortConfig.key === 'department_name' && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="ml-1 h-4 w-4" /> 
                      : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                  {sortConfig.key !== 'department_name' && (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('manager_name')}
                >
                  Reports To
                  {sortConfig.key === 'manager_name' && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="ml-1 h-4 w-4" /> 
                      : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                  {sortConfig.key !== 'manager_name' && (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div 
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort('enneagram_type')}
                >
                  Enneagram
                  {sortConfig.key === 'enneagram_type' && (
                    sortConfig.direction === 'asc' 
                      ? <ChevronUp className="ml-1 h-4 w-4" /> 
                      : <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                  {sortConfig.key !== 'enneagram_type' && (
                    <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                  )}
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
                    <p>Loading organization data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
                    <p>No people found.</p>
                    <Button 
                      variant="link" 
                      onClick={() => setIsUploadDialogOpen(true)}
                      className="mt-2"
                    >
                      Import from CSV
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">
                    {editingId === person.id ? (
                      <Input
                        value={editingPerson?.name || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson!, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={person.image || "/placeholder.svg"} alt={person.name} />
                          <AvatarFallback>
                            {person.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span 
                          className="cursor-pointer hover:text-primary"
                          onClick={() => onSelectPerson && onSelectPerson(person as unknown as Person)}
                        >
                          {person.name}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Input
                        value={editingPerson?.role || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson!, role: e.target.value })}
                      />
                    ) : (
                      person.role
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Select
                        value={editingPerson?.department_id || ""}
                        onValueChange={(value) => setEditingPerson({ ...editingPerson!, department_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      person.department_name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Select
                        value={editingPerson?.manager_email || ""}
                        onValueChange={(value) => setEditingPerson({ ...editingPerson!, manager_email: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Manager</SelectItem>
                          {people
                            .filter(p => p.id !== person.id) // Can't report to yourself
                            .map((p) => (
                              <SelectItem key={p.id} value={p.email}>
                                {p.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      person.manager_name || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Select
                        value={editingPerson?.enneagram_type || ""}
                        onValueChange={(value) => setEditingPerson({ ...editingPerson!, enneagram_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Not Set</SelectItem>
                          {ENNEAGRAM_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      person.enneagram_type ? (
                        <Badge variant="outline">
                          Type {person.enneagram_type}
                        </Badge>
                      ) : (
                        "—"
                      )
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Input
                        value={editingPerson?.email || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson!, email: e.target.value })}
                      />
                    ) : (
                      person.email
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Input
                        value={editingPerson?.phone || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson!, phone: e.target.value })}
                      />
                    ) : (
                      person.phone || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === person.id ? (
                      <Input
                        value={editingPerson?.location || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson!, location: e.target.value })}
                      />
                    ) : (
                      person.location || "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === person.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={saveEditing}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => onSelectPerson && onSelectPerson(person as unknown as Person)}
                          >
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEditing(person)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeletePerson(person.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* CSV Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Import Organization Data</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import or update your organization structure.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
              <TabsTrigger value="preview" disabled={!csvData.length}>Preview Data</TabsTrigger>
              <TabsTrigger value="progress" disabled={!isUploading && !uploadComplete}>Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organization-name">Organization Name</Label>
                  <Input
                    id="organization-name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDragging ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileSpreadsheet className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium">Drag and drop your CSV file here</h3>
                    <p className="text-sm text-muted-foreground">
                      or click the button below to browse
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {file && (
                  <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                    <div className="flex items-center">
                      <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                      <span>{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFile(null);
                        setCsvData([]);
                        setValidationErrors([]);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Validation Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                  >
                    Download Template
                  </Button>
                  
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (csvData.length > 0) {
                          setSelectedTab("preview");
                        }
                      }}
                      disabled={csvData.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reports To</TableHead>
                      <TableHead>Enneagram</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.role}</TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell>{row.manager_email || "—"}</TableCell>
                        <TableCell>
                          {row.enneagram_type ? `Type ${row.enneagram_type}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {csvData.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing 10 of {csvData.length} rows
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTab("upload")}
                >
                  Back
                </Button>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={uploadCSV}
                    disabled={validationErrors.length > 0}
                  >
                    Upload and Create Org Chart
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Upload Progress</span>
                    <span>
                      {uploadStats.processed} of {uploadStats.total}
                    </span>
                  </div>
                  <Progress
                    value={(uploadStats.processed / uploadStats.total) * 100}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {uploadStats.success}
                      </Badge>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Updated</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {uploadStats.skipped}
                      </Badge>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Failed</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {uploadStats.failed}
                      </Badge>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <Badge variant="outline">
                        {uploadStats.total}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}
                
                {uploadComplete && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Upload Complete</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your organization data has been successfully uploaded and processed.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setIsUploadDialogOpen(false);
                      resetUploadState();
                    }}
                  >
                    {uploadComplete ? "Close" : "Cancel"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Add Person Dialog */}
      <Dialog open={isAddingPerson} onOpenChange={setIsAddingPerson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Person</DialogTitle>
            <DialogDescription>
              Add a new person to the organization chart.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newPerson.name}
                onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newPerson.email}
                onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                placeholder="john.doe@company.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={newPerson.role}
                onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={newPerson.department_id}
                onValueChange={(value) => setNewPerson({ ...newPerson, department_id: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">Reports To</Label>
              <Select
                value={newPerson.manager_id}
                onValueChange={(value) => setNewPerson({ ...newPerson, manager_id: value })}
              >
                <SelectTrigger id="manager">
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enneagram">Enneagram Type</Label>
              <Select
                value={newPerson.enneagram_type}
                onValueChange={(value) => setNewPerson({ ...newPerson, enneagram_type: value })}
              >
                <SelectTrigger id="enneagram">
                  <SelectValue placeholder="Select enneagram type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Set</SelectItem>
                  {ENNEAGRAM_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newPerson.phone || ""}
                onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                placeholder="555-123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newPerson.location || ""}
                onChange={(e) => setNewPerson({ ...newPerson, location: e.target.value })}
                placeholder="New York"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPerson(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPerson}>
              Add Person
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
