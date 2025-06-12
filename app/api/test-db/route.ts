import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test 1: Check if we can connect and query
    console.log('Testing Supabase connection...')
    
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .limit(5)
    
    if (peopleError) {
      console.error('Error querying people:', peopleError)
      return NextResponse.json({ 
        error: 'Failed to query people table', 
        details: peopleError 
      }, { status: 500 })
    }
    
    console.log('People query successful:', people)
    
    // Test 2: Check departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
    
    if (deptError) {
      console.error('Error querying departments:', deptError)
    }
    
    // Test 3: Check documents
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .limit(5)
    
    if (docError) {
      console.error('Error querying documents:', docError)
    }
    
    return NextResponse.json({
      success: true,
      peopleCount: people?.length || 0,
      people: people || [],
      departmentCount: departments?.length || 0,
      documentCount: documents?.length || 0,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  } catch (error) {
    console.error('Test DB route error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
