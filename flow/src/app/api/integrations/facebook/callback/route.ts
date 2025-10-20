import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.json(
        { success: false, message: 'Missing authorization code or state' },
        { status: 400 }
      )
    }

    // Chamar o backend para processar o callback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(
      `${backendUrl}/api/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
      {
        method: 'GET',
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to process callback')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Facebook callback API:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process Facebook callback' },
      { status: 500 }
    )
  }
}
