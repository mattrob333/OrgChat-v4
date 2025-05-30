import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Enneagram type assignments for existing employees
const enneagramUpdates = [
  { email: "sarah.johnson@techcorp.com", enneagram_type: "8" },
  { email: "michael.chen@techcorp.com", enneagram_type: "5" },
  { email: "emily.rodriguez@techcorp.com", enneagram_type: "3" },
  { email: "david.kim@techcorp.com", enneagram_type: "7" },
  { email: "lisa.thompson@techcorp.com", enneagram_type: "1" },
  { email: "robert.martinez@techcorp.com", enneagram_type: "3" },
  { email: "jennifer.lee@techcorp.com", enneagram_type: "2" },
  { email: "alex.wang@techcorp.com", enneagram_type: "6" },
  { email: "maria.garcia@techcorp.com", enneagram_type: "5" },
  { email: "james.wilson@techcorp.com", enneagram_type: "7" },
  { email: "sophie.anderson@techcorp.com", enneagram_type: "4" },
  { email: "daniel.brown@techcorp.com", enneagram_type: "5" },
  { email: "rachel.green@techcorp.com", enneagram_type: "6" },
  { email: "kevin.zhang@techcorp.com", enneagram_type: "9" },
  { email: "amanda.white@techcorp.com", enneagram_type: "3" },
  { email: "chris.taylor@techcorp.com", enneagram_type: "8" },
  { email: "nicole.davis@techcorp.com", enneagram_type: "2" },
  { email: "brian.miller@techcorp.com", enneagram_type: "6" }
]

async function updateEnneagramTypes() {
  try {
    console.log('🔄 Updating enneagram types for existing employees...')
    
    for (const update of enneagramUpdates) {
      const { data, error } = await supabase
        .from('people')
        .update({ enneagram_type: update.enneagram_type })
        .eq('email', update.email)
        .select()
      
      if (error) {
        console.error(`❌ Error updating ${update.email}:`, error.message)
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${update.email} to Enneagram Type ${update.enneagram_type}`)
      } else {
        console.log(`⚠️  No employee found with email: ${update.email}`)
      }
    }
    
    console.log('✨ Enneagram type update complete!')
  } catch (error) {
    console.error('❌ Error updating enneagram types:', error)
  }
}

// Run the update function
updateEnneagramTypes()
