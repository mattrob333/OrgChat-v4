import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 })
    }
    
    // First, find the person
    const { data: person, error: findError } = await supabase
      .from('people')
      .select('id')
      .eq('name', name)
      .single()
    
    if (findError || !person) {
      return NextResponse.json({ error: `Person "${name}" not found` }, { status: 404 })
    }
    
    // Delete any reporting relationships where this person is a manager
    const { error: managerRelError } = await supabase
      .from('reporting_relationships')
      .delete()
      .eq('manager_id', person.id)
    
    if (managerRelError) {
      console.error('Error deleting manager relationships:', managerRelError)
    }
    
    // Delete any reporting relationships where this person is a report
    const { error: reportRelError } = await supabase
      .from('reporting_relationships')
      .delete()
      .eq('person_id', person.id)
    
    if (reportRelError) {
      console.error('Error deleting report relationships:', reportRelError)
    }
    
    // Delete the person
    const { error: deleteError } = await supabase
      .from('people')
      .delete()
      .eq('id', person.id)
    
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${name}`,
      deletedPersonId: person.id 
    })
  } catch (error) {
    console.error('Delete person error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
