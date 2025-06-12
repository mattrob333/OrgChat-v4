import { NextResponse } from 'next/server'
import { clearCache } from '@/lib/org-service'

export async function POST() {
  try {
    clearCache()
    return NextResponse.json({ success: true, message: 'Cache cleared successfully' })
  } catch (error) {
    console.error('Clear cache error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
