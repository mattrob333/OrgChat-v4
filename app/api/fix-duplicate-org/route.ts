import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Get both organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', 'TechCorp Industries')
      .order('created_at', { ascending: true })
    
    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 })
    }
    
    if (!organizations || organizations.length !== 2) {
      return NextResponse.json({ 
        error: 'Expected exactly 2 TechCorp Industries organizations',
        found: organizations?.length || 0 
      }, { status: 400 })
    }
    
    // Keep the first (older) organization
    const keepOrgId = organizations[0].id
    const deleteOrgId = organizations[1].id
    
    console.log('Keeping organization:', keepOrgId)
    console.log('Deleting organization:', deleteOrgId)
    
    // First, update any people associated with the duplicate org to use the main org
    const { data: peopleToUpdate, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .eq('organization_id', deleteOrgId)
    
    if (peopleError) {
      return NextResponse.json({ error: `Error finding people: ${peopleError.message}` }, { status: 500 })
    }
    
    if (peopleToUpdate && peopleToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('people')
        .update({ organization_id: keepOrgId })
        .eq('organization_id', deleteOrgId)
      
      if (updateError) {
        return NextResponse.json({ error: `Error updating people: ${updateError.message}` }, { status: 500 })
      }
    }
    
    // Update any reporting relationships
    const { error: relUpdateError } = await supabase
      .from('reporting_relationships')
      .update({ organization_id: keepOrgId })
      .eq('organization_id', deleteOrgId)
    
    if (relUpdateError) {
      console.log('Error updating relationships:', relUpdateError)
    }
    
    // Delete the duplicate organization
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', deleteOrgId)
    
    if (deleteError) {
      return NextResponse.json({ error: `Error deleting organization: ${deleteError.message}` }, { status: 500 })
    }
    
    // Clear the cache to force refresh
    const clearCacheResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/clear-cache`, {
      method: 'POST'
    })
    
    return NextResponse.json({ 
      success: true,
      message: 'Successfully merged duplicate organizations',
      keptOrgId: keepOrgId,
      deletedOrgId: deleteOrgId,
      peopleUpdated: peopleToUpdate?.length || 0
    })
  } catch (error) {
    console.error('Fix duplicate org error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
