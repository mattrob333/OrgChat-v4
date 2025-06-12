import { NextResponse } from 'next/server'
import { getOrganizations, getOrgChartData } from '@/lib/org-service'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get organizations
    const organizations = await getOrganizations()
    console.log('Organizations:', organizations)
    
    // Get people directly from Supabase
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
    
    if (peopleError) {
      console.error('Error fetching people:', peopleError)
    }
    
    // Get relationships
    const { data: relationships, error: relError } = await supabase
      .from('reporting_relationships')
      .select('*')
    
    if (relError) {
      console.error('Error fetching relationships:', relError)
    }
    
    // Try to get org chart data for the first organization
    let orgChartData = null
    if (organizations.length > 0) {
      orgChartData = await getOrgChartData(organizations[0].id)
    }
    
    return NextResponse.json({
      organizations: organizations.length,
      people: people?.length || 0,
      relationships: relationships?.length || 0,
      firstOrg: organizations[0] || null,
      orgChartData: orgChartData,
      peopleList: people?.slice(0, 5) || [], // First 5 people
      error: null
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      organizations: 0,
      people: 0,
      relationships: 0
    })
  }
}
