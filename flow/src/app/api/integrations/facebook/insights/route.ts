import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adAccountId, datePreset, level } = body

    if (!adAccountId) {
      return NextResponse.json({ error: 'Ad account ID is required' }, { status: 400 })
    }

    // Chamar o backend para obter insights
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/facebook/insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adAccountId,
        datePreset: datePreset || 'last_7d',
        level: level || 'campaign',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch insights')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Facebook insights API:', error)
    return NextResponse.json({ error: 'Failed to fetch Facebook insights' }, { status: 500 })
  }
}
