import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all people
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .order('name')
    
    if (peopleError) {
      return NextResponse.json({ error: peopleError.message })
    }
    
    // Get all relationships
    const { data: relationships, error: relError } = await supabase
      .from('reporting_relationships')
      .select('*')
    
    if (relError) {
      return NextResponse.json({ error: relError.message })
    }
    
    // Find people without managers (potential roots)
    const peopleWithManagers = new Set(relationships?.map(r => r.person_id) || [])
    const peopleWithoutManagers = people?.filter(p => !peopleWithManagers.has(p.id)) || []
    
    // Find people who are managers
    const managers = new Set(relationships?.map(r => r.manager_id) || [])
    
    // Create a map of manager to reports
    const managerToReports = new Map<string, string[]>()
    relationships?.forEach(rel => {
      if (!managerToReports.has(rel.manager_id)) {
        managerToReports.set(rel.manager_id, [])
      }
      managerToReports.get(rel.manager_id)?.push(rel.person_id)
    })
    
    // Find Matthew Roberson specifically
    const matthew = people?.find(p => p.name === 'Matthew Roberson')
    const matthewReports = matthew ? (managerToReports.get(matthew.id) || []) : []
    
    return NextResponse.json({
      totalPeople: people?.length || 0,
      totalRelationships: relationships?.length || 0,
      peopleWithoutManagers: peopleWithoutManagers.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        organization_id: p.organization_id
      })),
      matthewRoberson: matthew ? {
        id: matthew.id,
        name: matthew.name,
        role: matthew.role,
        organization_id: matthew.organization_id,
        directReports: matthewReports.length,
        reportIds: matthewReports
      } : null,
      managersWithReportCounts: Array.from(managerToReports.entries()).map(([managerId, reports]) => {
        const manager = people?.find(p => p.id === managerId)
        return {
          managerId,
          managerName: manager?.name || 'Unknown',
          reportCount: reports.length
        }
      })
    })
  } catch (error) {
    console.error('Debug relationships error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
