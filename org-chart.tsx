"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import EmployeePanel from "./employee-panel"
import type { Person } from "./types/person"

interface OrgNodeProps {
  person: Person
  level: number
  isLast: boolean
  onSelectPerson: (person: Person) => void
}

const OrgNode = ({ person, level, isLast, onSelectPerson }: OrgNodeProps) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = person.children && person.children.length > 0

  return (
    <div className="relative group">
      <div className={cn("flex items-start", level > 0 && "pl-6 relative")}>
        {level > 0 && (
          <>
            <div className="absolute left-0 top-4 w-5 border-t border-border" />
            <div className={cn("absolute left-0 h-full border-l border-border", isLast ? "h-4" : "")} />
          </>
        )}

        <Card
          className="w-full p-4 shadow-sm hover:shadow-md transition-shadow border border-border bg-card cursor-pointer hover:border-primary/30"
          onClick={(e) => {
            e.stopPropagation()
            onSelectPerson(person)
          }}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={person.image || "/placeholder.svg"} alt={person.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {person.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm sm:text-base truncate">{person.name}</h3>
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(!expanded)
                    }}
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">Toggle</span>
                  </Button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{person.role}</p>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{person.email}</p>
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1 text-primary/70" />
                <span>{person.department}</span>
                {hasChildren && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • {person.children.length} direct report{person.children.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {hasChildren && expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {person.children.map((child, index) => (
            <OrgNode
              key={child.id}
              person={child}
              level={level + 1}
              isLast={index === person.children!.length - 1}
              onSelectPerson={onSelectPerson}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface OrgChartProps {
  onSelectPerson?: (person: Person) => void
  containerWidth?: number
}

export default function OrgChart({ onSelectPerson, containerWidth }: OrgChartProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)

  // Enhanced sample data with responsibilities and bio
  const orgData: Person = {
    id: "1",
    name: "Eleanor Rosevelt",
    role: "Chief Executive Officer",
    department: "Executive",
    email: "eleanor.rosevelt@company.com",
    image: "/placeholder.svg?height=40&width=40",
    responsibilities: [
      "Overall company strategy and vision",
      "Executive leadership and decision making",
      "Stakeholder and board relations",
      "Company culture and values",
    ],
    bio: "Eleanor has over 20 years of experience in executive leadership roles across technology and finance sectors. She joined the company in 2018 and has led the organization through significant growth and transformation.",
    children: [
      {
        id: "2",
        name: "Marcus Chen",
        role: "Chief Technology Officer",
        department: "Technology",
        email: "marcus.chen@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Technology strategy and roadmap",
          "Engineering leadership",
          "Technical architecture oversight",
          "Innovation and R&D",
        ],
        bio: "Marcus has a background in computer science and has been with the company for 5 years. He previously worked at several leading tech companies and brings expertise in cloud infrastructure and AI.",
        children: [
          {
            id: "6",
            name: "Sarah Johnson",
            role: "VP of Engineering",
            department: "Engineering",
            email: "sarah.johnson@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Engineering team leadership",
              "Product development execution",
              "Technical hiring and team growth",
              "Engineering processes and quality",
            ],
            bio: "Sarah leads our engineering organization with a focus on scalable, maintainable software practices. She has a strong background in distributed systems and team leadership.",
            children: [
              {
                id: "10",
                name: "Michael Green",
                role: "Engineering Manager",
                department: "Engineering",
                email: "michael.green@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Frontend team management",
                  "UI/UX implementation oversight",
                  "Frontend architecture",
                  "Developer experience",
                ],
                bio: "Michael manages our frontend engineering team, focusing on creating exceptional user experiences and maintainable code.",
                children: [
                  {
                    id: "15",
                    name: "Aisha Patel",
                    role: "Senior Developer",
                    department: "Engineering",
                    email: "aisha.patel@company.com",
                    image: "/placeholder.svg?height=40&width=40",
                    responsibilities: [
                      "Frontend architecture",
                      "Component system design",
                      "Performance optimization",
                      "Mentoring junior developers",
                    ],
                    bio: "Aisha is a senior developer specializing in React and modern JavaScript frameworks. She leads our component library development and frontend architecture.",
                    children: [
                      {
                        id: "20",
                        name: "Ryan Cooper",
                        role: "Junior Developer",
                        department: "Engineering",
                        email: "ryan.cooper@company.com",
                        image: "/placeholder.svg?height=40&width=40",
                        responsibilities: [
                          "Frontend implementation",
                          "Bug fixes and maintenance",
                          "UI component development",
                          "Testing and documentation",
                        ],
                        bio: "Ryan joined our team last year after completing a computer science degree. He's focused on frontend development and learning best practices.",
                      },
                      {
                        id: "21",
                        name: "Emma Mitchell",
                        role: "Junior Developer",
                        department: "Engineering",
                        email: "emma.mitchell@company.com",
                        image: "/placeholder.svg?height=40&width=40",
                        responsibilities: [
                          "Frontend implementation",
                          "Accessibility improvements",
                          "UI testing",
                          "Documentation",
                        ],
                        bio: "Emma specializes in frontend development with a focus on accessibility and user experience. She joined the company after a successful internship program.",
                      },
                    ],
                  },
                  {
                    id: "16",
                    name: "David Kim",
                    role: "Senior Developer",
                    department: "Engineering",
                    email: "david.kim@company.com",
                    image: "/placeholder.svg?height=40&width=40",
                    responsibilities: [
                      "Backend architecture",
                      "API design",
                      "Performance optimization",
                      "Security implementation",
                    ],
                    bio: "David is a backend specialist with expertise in distributed systems and database optimization. He leads our API development and backend architecture.",
                  },
                ],
              },
              {
                id: "11",
                name: "Jessica Taylor",
                role: "Engineering Manager",
                department: "Engineering",
                email: "jessica.taylor@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Backend team management",
                  "API development oversight",
                  "Backend architecture",
                  "Developer experience",
                ],
                bio: "Jessica manages our backend engineering team, focusing on robust API development and backend architecture.",
                children: [
                  {
                    id: "17",
                    name: "Carlos Rodriguez",
                    role: "Senior QA Engineer",
                    department: "Quality Assurance",
                    email: "carlos.rodriguez@company.com",
                    image: "/placeholder.svg?height=40&width=40",
                    responsibilities: [
                      "QA strategy and implementation",
                      "Test automation",
                      "Bug tracking and resolution",
                      "Continuous integration",
                    ],
                    bio: "Carlos is a senior QA engineer with experience in test automation and continuous integration. He ensures our software is of the highest quality.",
                    children: [
                      {
                        id: "22",
                        name: "Linda Hayes",
                        role: "QA Engineer",
                        department: "Quality Assurance",
                        email: "linda.hayes@company.com",
                        image: "/placeholder.svg?height=40&width=40",
                        responsibilities: ["Manual testing", "Test case creation", "Bug reporting", "Documentation"],
                        bio: "Linda is a QA engineer with a focus on manual testing and creating comprehensive test cases.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "7",
            name: "John Adams",
            role: "VP of Infrastructure",
            department: "Infrastructure",
            email: "john.adams@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Infrastructure strategy and roadmap",
              "Cloud infrastructure management",
              "Network architecture",
              "Security oversight",
            ],
            bio: "John has extensive experience in infrastructure management and cloud technologies. He leads our cloud infrastructure initiatives.",
            children: [
              {
                id: "12",
                name: "Patricia Morris",
                role: "Cloud Infrastructure Lead",
                department: "Infrastructure",
                email: "patricia.morris@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Cloud platform implementation",
                  "Infrastructure as code",
                  "Resource management",
                  "Monitoring and logging",
                ],
                bio: "Patricia specializes in cloud infrastructure and infrastructure as code. She ensures our cloud resources are efficiently managed.",
                children: [
                  {
                    id: "18",
                    name: "Thomas Wilson",
                    role: "DevOps Engineer",
                    department: "Infrastructure",
                    email: "thomas.wilson@company.com",
                    image: "/placeholder.svg?height=40&width=40",
                    responsibilities: [
                      "DevOps practices implementation",
                      "CI/CD pipeline management",
                      "Automation scripting",
                      "Infrastructure troubleshooting",
                    ],
                    bio: "Thomas is a DevOps engineer with expertise in CI/CD pipelines and automation. He streamlines our development and deployment processes.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "3",
        name: "Sophia Williams",
        role: "Chief Financial Officer",
        department: "Finance",
        email: "sophia.williams@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Financial strategy and planning",
          "Budget management",
          "Financial reporting",
          "Risk assessment",
        ],
        bio: "Sophia has a strong background in finance and has been with the company for 10 years. She leads our financial planning and risk management initiatives.",
        children: [
          {
            id: "8",
            name: "Robert Brown",
            role: "Finance Director",
            department: "Finance",
            email: "robert.brown@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Financial analysis",
              "Account management",
              "Tax compliance",
              "Financial process optimization",
            ],
            bio: "Robert is a finance director with experience in financial analysis and account management. He ensures our financial processes are optimized.",
            children: [
              {
                id: "13",
                name: "Jennifer Lopez",
                role: "Senior Accountant",
                department: "Finance",
                email: "jennifer.lopez@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Account reconciliation",
                  "Financial statement preparation",
                  "Tax preparation",
                  "Budget analysis",
                ],
                bio: "Jennifer is a senior accountant with expertise in financial statement preparation and tax compliance. She ensures accurate financial reporting.",
              },
            ],
          },
        ],
      },
      {
        id: "4",
        name: "James Wilson",
        role: "Chief Marketing Officer",
        department: "Marketing",
        email: "james.wilson@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "Marketing strategy and planning",
          "Brand management",
          "Campaign execution",
          "Market analysis",
        ],
        bio: "James has a background in marketing and has been with the company for 7 years. He leads our marketing strategy and brand initiatives.",
        children: [
          {
            id: "9",
            name: "Elizabeth Clark",
            role: "Marketing Director",
            department: "Marketing",
            email: "elizabeth.clark@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "Marketing campaign management",
              "Content creation",
              "SEO optimization",
              "Analytics and reporting",
            ],
            bio: "Elizabeth is a marketing director with experience in campaign management and content creation. She ensures our marketing efforts are effective.",
            children: [
              {
                id: "14",
                name: "Daniel Lee",
                role: "Marketing Manager",
                department: "Marketing",
                email: "daniel.lee@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Digital marketing",
                  "Social media management",
                  "Email marketing",
                  "Marketing analytics",
                ],
                bio: "Daniel specializes in digital marketing and social media management. He drives our online marketing campaigns.",
                children: [
                  {
                    id: "19",
                    name: "Olivia Martinez",
                    role: "Marketing Specialist",
                    department: "Marketing",
                    email: "olivia.martinez@company.com",
                    image: "/placeholder.svg?height=40&width=40",
                    responsibilities: ["Event planning", "PR coordination", "Marketing research", "Campaign support"],
                    bio: "Olivia is a marketing specialist with a focus on event planning and PR coordination. She supports our marketing campaigns.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "5",
        name: "Alexandra Peterson",
        role: "Chief People Officer",
        department: "Human Resources",
        email: "alexandra.peterson@company.com",
        image: "/placeholder.svg?height=40&width=40",
        responsibilities: [
          "HR strategy and planning",
          "Employee recruitment and management",
          "Training and development",
          "Employee relations",
        ],
        bio: "Alexandra has a background in human resources and has been with the company for 8 years. She leads our HR initiatives and employee development.",
        children: [
          {
            id: "23",
            name: "William Thompson",
            role: "HR Director",
            department: "Human Resources",
            email: "william.thompson@company.com",
            image: "/placeholder.svg?height=40&width=40",
            responsibilities: [
              "HR operations management",
              "Employee benefits and compensation",
              "Performance management",
              "Employee engagement",
            ],
            bio: "William is an HR director with experience in HR operations and employee benefits. He ensures our HR processes are efficient.",
            children: [
              {
                id: "24",
                name: "Mia Jackson",
                role: "HR Manager",
                department: "Human Resources",
                email: "mia.jackson@company.com",
                image: "/placeholder.svg?height=40&width=40",
                responsibilities: [
                  "Onboarding and orientation",
                  "Employee training",
                  "Performance reviews",
                  "HR compliance",
                ],
                bio: "Mia is an HR manager with a focus on onboarding and employee training. She ensures new hires are well-integrated into the company.",
              },
            ],
          },
        ],
      },
    ],
  }

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person)
    setIsPanelOpen(true)

    // If an external handler is provided, call it
    if (onSelectPerson) {
      onSelectPerson(person)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  return (
    <div className="p-4 w-full h-full overflow-auto bg-background">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Organization Chart</h1>
        <Button
          variant="outline"
          onClick={() => {
            const expandAll = (node: Person) => {
              if (node.children) {
                node.children.forEach(expandAll)
              }
              return { ...node }
            }
            expandAll(orgData)
            setExpanded(!expanded)
          }}
          className="border-primary/20 hover:border-primary hover:bg-primary/10"
        >
          {expanded ? "Collapse All" : "Expand All"}
        </Button>
      </div>
      <div className="space-y-4 mt-6">
        <OrgNode person={orgData} level={0} isLast={true} onSelectPerson={handleSelectPerson} />
      </div>

      {/* Only show the panel if we're not using the sidebar integration */}
      {!onSelectPerson && <EmployeePanel person={selectedPerson} isOpen={isPanelOpen} onClose={handleClosePanel} />}
    </div>
  )
}
