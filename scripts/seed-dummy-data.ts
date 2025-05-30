import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Dummy data
const dummyData = {
  organization: {
    name: "TechCorp Industries",
    website: "https://techcorp.example.com",
    description: "A leading technology company specializing in innovative software solutions"
  },
  departments: [
    { name: "Engineering", description: "Product development and technical innovation" },
    { name: "Sales", description: "Business development and customer acquisition" },
    { name: "Marketing", description: "Brand management and market strategy" },
    { name: "Human Resources", description: "People operations and talent management" },
    { name: "Finance", description: "Financial planning and accounting" },
    { name: "Operations", description: "Business operations and process optimization" }
  ],
  employees: [
    // CEO
    {
      name: "Sarah Johnson",
      role: "Chief Executive Officer",
      department: "Operations",
      email: "sarah.johnson@techcorp.com",
      phone: "+1 (555) 100-0001",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      bio: "Visionary leader with 20+ years of experience in tech industry",
      responsibilities: ["Company Strategy", "Board Relations", "Executive Leadership"],
      managerEmail: null,
      enneagram_type: "8"
    },
    // C-Suite
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      department: "Engineering",
      email: "michael.chen@techcorp.com",
      phone: "+1 (555) 100-0002",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      bio: "Technology innovator passionate about scalable systems",
      responsibilities: ["Technical Strategy", "Engineering Leadership", "Innovation"],
      managerEmail: "sarah.johnson@techcorp.com",
      enneagram_type: "5"
    },
    {
      name: "Emily Rodriguez",
      role: "Chief Financial Officer",
      department: "Finance",
      email: "emily.rodriguez@techcorp.com",
      phone: "+1 (555) 100-0003",
      location: "New York, NY",
      timezone: "America/New_York",
      bio: "Strategic financial leader with expertise in growth companies",
      responsibilities: ["Financial Planning", "Investor Relations", "Risk Management"],
      managerEmail: "sarah.johnson@techcorp.com",
      enneagram_type: "3"
    },
    {
      name: "David Kim",
      role: "Chief Marketing Officer",
      department: "Marketing",
      email: "david.kim@techcorp.com",
      phone: "+1 (555) 100-0004",
      location: "Los Angeles, CA",
      timezone: "America/Los_Angeles",
      bio: "Creative marketing executive focused on brand growth",
      responsibilities: ["Brand Strategy", "Marketing Campaigns", "Customer Insights"],
      managerEmail: "sarah.johnson@techcorp.com",
      enneagram_type: "7"
    },
    // VPs
    {
      name: "Lisa Thompson",
      role: "VP of Engineering",
      department: "Engineering",
      email: "lisa.thompson@techcorp.com",
      phone: "+1 (555) 200-0001",
      location: "Seattle, WA",
      timezone: "America/Los_Angeles",
      bio: "Engineering leader specializing in distributed systems",
      responsibilities: ["Product Development", "Team Management", "Technical Architecture"],
      managerEmail: "michael.chen@techcorp.com",
      enneagram_type: "1"
    },
    {
      name: "Robert Martinez",
      role: "VP of Sales",
      department: "Sales",
      email: "robert.martinez@techcorp.com",
      phone: "+1 (555) 200-0002",
      location: "Chicago, IL",
      timezone: "America/Chicago",
      bio: "Sales executive with track record of exceeding targets",
      responsibilities: ["Sales Strategy", "Client Relations", "Revenue Growth"],
      managerEmail: "sarah.johnson@techcorp.com",
      enneagram_type: "3"
    },
    {
      name: "Jennifer Lee",
      role: "VP of Human Resources",
      department: "Human Resources",
      email: "jennifer.lee@techcorp.com",
      phone: "+1 (555) 200-0003",
      location: "Austin, TX",
      timezone: "America/Chicago",
      bio: "People-first HR leader building inclusive cultures",
      responsibilities: ["Talent Acquisition", "Employee Experience", "Culture Development"],
      managerEmail: "sarah.johnson@techcorp.com",
      enneagram_type: "2"
    },
    // Directors
    {
      name: "Alex Wang",
      role: "Director of Frontend Engineering",
      department: "Engineering",
      email: "alex.wang@techcorp.com",
      phone: "+1 (555) 300-0001",
      location: "San Francisco, CA",
      timezone: "America/Los_Angeles",
      bio: "Frontend architect passionate about user experience",
      responsibilities: ["Frontend Architecture", "UI/UX Standards", "Team Leadership"],
      managerEmail: "lisa.thompson@techcorp.com",
      enneagram_type: "6"
    },
    {
      name: "Maria Garcia",
      role: "Director of Backend Engineering",
      department: "Engineering",
      email: "maria.garcia@techcorp.com",
      phone: "+1 (555) 300-0002",
      location: "Denver, CO",
      timezone: "America/Denver",
      bio: "Backend specialist focused on scalability and performance",
      responsibilities: ["Backend Systems", "API Design", "Infrastructure"],
      managerEmail: "lisa.thompson@techcorp.com",
      enneagram_type: "5"
    },
    {
      name: "James Wilson",
      role: "Director of Product Marketing",
      department: "Marketing",
      email: "james.wilson@techcorp.com",
      phone: "+1 (555) 300-0003",
      location: "Boston, MA",
      timezone: "America/New_York",
      bio: "Product marketing strategist driving go-to-market success",
      responsibilities: ["Product Positioning", "Launch Strategy", "Market Analysis"],
      managerEmail: "david.kim@techcorp.com",
      enneagram_type: "7"
    },
    // Senior Engineers
    {
      name: "Sophie Anderson",
      role: "Senior Frontend Engineer",
      department: "Engineering",
      email: "sophie.anderson@techcorp.com",
      phone: "+1 (555) 400-0001",
      location: "Portland, OR",
      timezone: "America/Los_Angeles",
      bio: "React specialist building delightful user interfaces",
      responsibilities: ["Feature Development", "Code Reviews", "Mentoring"],
      managerEmail: "alex.wang@techcorp.com",
      enneagram_type: "4"
    },
    {
      name: "Daniel Brown",
      role: "Senior Backend Engineer",
      department: "Engineering",
      email: "daniel.brown@techcorp.com",
      phone: "+1 (555) 400-0002",
      location: "Miami, FL",
      timezone: "America/New_York",
      bio: "Distributed systems engineer with cloud expertise",
      responsibilities: ["System Design", "Performance Optimization", "Technical Documentation"],
      managerEmail: "maria.garcia@techcorp.com",
      enneagram_type: "5"
    },
    {
      name: "Rachel Green",
      role: "Senior Data Engineer",
      department: "Engineering",
      email: "rachel.green@techcorp.com",
      phone: "+1 (555) 400-0003",
      location: "Atlanta, GA",
      timezone: "America/New_York",
      bio: "Data pipeline architect enabling data-driven decisions",
      responsibilities: ["Data Infrastructure", "ETL Pipelines", "Analytics Support"],
      managerEmail: "maria.garcia@techcorp.com",
      enneagram_type: "6"
    },
    // Mid-level employees
    {
      name: "Kevin Park",
      role: "Software Engineer",
      department: "Engineering",
      email: "kevin.park@techcorp.com",
      phone: "+1 (555) 500-0001",
      location: "San Diego, CA",
      timezone: "America/Los_Angeles",
      bio: "Full-stack developer passionate about clean code",
      responsibilities: ["Feature Implementation", "Bug Fixes", "Testing"],
      managerEmail: "sophie.anderson@techcorp.com",
      enneagram_type: "9"
    },
    {
      name: "Amanda White",
      role: "Marketing Manager",
      department: "Marketing",
      email: "amanda.white@techcorp.com",
      phone: "+1 (555) 500-0002",
      location: "Nashville, TN",
      timezone: "America/Chicago",
      bio: "Digital marketing specialist driving online engagement",
      responsibilities: ["Campaign Management", "Content Strategy", "Analytics"],
      managerEmail: "james.wilson@techcorp.com",
      enneagram_type: "3"
    },
    {
      name: "Chris Taylor",
      role: "Sales Manager",
      department: "Sales",
      email: "chris.taylor@techcorp.com",
      phone: "+1 (555) 500-0003",
      location: "Dallas, TX",
      timezone: "America/Chicago",
      bio: "Sales professional focused on enterprise accounts",
      responsibilities: ["Account Management", "Deal Closing", "Client Success"],
      managerEmail: "robert.martinez@techcorp.com",
      enneagram_type: "8"
    },
    {
      name: "Nicole Davis",
      role: "HR Manager",
      department: "Human Resources",
      email: "nicole.davis@techcorp.com",
      phone: "+1 (555) 500-0004",
      location: "Phoenix, AZ",
      timezone: "America/Phoenix",
      bio: "HR generalist supporting employee lifecycle",
      responsibilities: ["Recruiting", "Onboarding", "Employee Relations"],
      managerEmail: "jennifer.lee@techcorp.com",
      enneagram_type: "2"
    },
    {
      name: "Brian Miller",
      role: "Financial Analyst",
      department: "Finance",
      email: "brian.miller@techcorp.com",
      phone: "+1 (555) 500-0005",
      location: "Charlotte, NC",
      timezone: "America/New_York",
      bio: "Financial analyst providing data-driven insights",
      responsibilities: ["Financial Modeling", "Budget Analysis", "Reporting"],
      managerEmail: "emily.rodriguez@techcorp.com",
      enneagram_type: "6"
    }
  ]
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...')

    // 1. Create organization
    console.log('Creating organization...')
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert([dummyData.organization])
      .select()
      .single()

    if (orgError) throw orgError
    console.log('✅ Organization created:', org.name)

    // 2. Create departments
    console.log('Creating departments...')
    const departmentsWithOrgId = dummyData.departments.map(dept => ({
      ...dept,
      organization_id: org.id
    }))

    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .insert(departmentsWithOrgId)
      .select()

    if (deptError) throw deptError
    console.log(`✅ Created ${departments.length} departments`)

    // Create department lookup map
    const deptMap = new Map(departments.map(d => [d.name, d.id]))

    // 3. Create employees
    console.log('Creating employees...')
    const employeesWithIds = dummyData.employees.map(emp => ({
      name: emp.name,
      role: emp.role,
      department_id: deptMap.get(emp.department),
      email: emp.email,
      phone: emp.phone,
      location: emp.location,
      timezone: emp.timezone,
      bio: emp.bio,
      responsibilities: emp.responsibilities,
      organization_id: org.id,
      enneagram_type: emp.enneagram_type || null
    }))

    const { data: employees, error: empError } = await supabase
      .from('people')
      .insert(employeesWithIds)
      .select()

    if (empError) throw empError
    console.log(`✅ Created ${employees.length} employees`)

    // Create employee lookup map
    const empMap = new Map(employees.map(e => [e.email, e.id]))

    // 4. Create reporting relationships
    console.log('Creating reporting relationships...')
    const relationships = dummyData.employees
      .filter(emp => emp.managerEmail)
      .map(emp => ({
        manager_id: empMap.get(emp.managerEmail),
        report_id: empMap.get(emp.email),
        organization_id: org.id
      }))
      .filter(rel => rel.manager_id && rel.report_id)

    const { error: relError } = await supabase
      .from('reporting_relationships')
      .insert(relationships)

    if (relError) throw relError
    console.log(`✅ Created ${relationships.length} reporting relationships`)

    // 5. Create AI settings for each employee
    console.log('Creating AI settings...')
    const aiSettings = employees.map(emp => ({
      person_id: emp.id,
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 500,
      persona: 'professional',
      knowledge_level: 'expert',
      response_style: 'balanced'
    }))

    const { error: aiError } = await supabase
      .from('ai_settings')
      .insert(aiSettings)

    if (aiError) throw aiError
    console.log(`✅ Created AI settings for ${aiSettings.length} employees`)

    console.log('\n🎉 Database seeded successfully!')
    console.log(`Organization: ${org.name}`)
    console.log(`Departments: ${departments.length}`)
    console.log(`Employees: ${employees.length}`)
    console.log(`Reporting relationships: ${relationships.length}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed function
seedDatabase()
