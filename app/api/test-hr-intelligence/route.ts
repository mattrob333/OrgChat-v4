import { NextResponse } from "next/server"
import { HRIntelligence } from "@/lib/hr-intelligence"
import { IntentDetector } from "@/lib/intent-detector"
import { ContextBuilder } from "@/lib/context-builder"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }
    
    console.log('Testing HR Intelligence with prompt:', prompt)
    
    // Step 1: Detect intent
    const intentDetector = new IntentDetector()
    const intent = intentDetector.detectIntent(prompt)
    console.log('Detected intent:', intent)
    
    // Step 2: Build context
    const contextBuilder = new ContextBuilder()
    const context = await contextBuilder.buildContext(prompt)
    console.log('Built context:', JSON.stringify(context, null, 2))
    
    // Step 3: Test individual HR Intelligence queries
    const hrIntelligence = new HRIntelligence()
    
    // Test people queries
    const testResults: any = {
      intent,
      context,
      directQueries: {}
    }
    
    // If there are people mentioned, try to find them
    if (intent.entities.people.length > 0) {
      testResults.directQueries.peopleByName = []
      for (const person of intent.entities.people) {
        const result = await hrIntelligence.getEmployeeByName(person)
        testResults.directQueries.peopleByName.push({ name: person, result })
      }
    }
    
    // If there are departments mentioned, try to find employees
    if (intent.entities.departments.length > 0) {
      testResults.directQueries.peopleByDepartment = []
      for (const dept of intent.entities.departments) {
        const result = await hrIntelligence.getEmployeesByDepartment(dept)
        testResults.directQueries.peopleByDepartment.push({ department: dept, count: result.length, employees: result })
      }
    }
    
    // Test document search if relevant
    if (intent.entities.documentTypes.length > 0 || intent.primaryIntent === 'document_search') {
      const docs = await hrIntelligence.searchDocuments(prompt)
      testResults.directQueries.documents = { count: docs.length, documents: docs }
    }
    
    // Test a simple employee search
    const allEmployees = await hrIntelligence.searchEmployees("")
    testResults.directQueries.totalEmployees = allEmployees.length
    
    return NextResponse.json({
      success: true,
      prompt,
      results: testResults
    })
  } catch (error) {
    console.error('Test HR Intelligence error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
