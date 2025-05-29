import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Create a Supabase client for server-side usage (API routes, Server Components)
export const createServerSupabaseClient = () => {
  return createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
      auth: {
        persistSession: false,
      },
    }
  )
}

// Create a Supabase client for client-side usage
export const createBrowserSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

// Singleton instance for client-side usage
export const supabase = createBrowserSupabaseClient()

// Helper function to get organization data
export async function getOrganizationData() {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('id')
  
  if (error) {
    console.error('Error fetching organization data:', error)
    return null
  }
  
  return data
}

// Helper function to get a person's data by ID
export async function getPersonById(id: string) {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error(`Error fetching person with ID ${id}:`, error)
    return null
  }
  
  return data
}

// Helper function to update a person's data
export async function updatePerson(id: string, updates: Partial<Database['public']['Tables']['people']['Update']>) {
  const { data, error } = await supabase
    .from('people')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    console.error(`Error updating person with ID ${id}:`, error)
    return null
  }
  
  return data
}
