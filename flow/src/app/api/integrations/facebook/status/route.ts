import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Chamar o backend para obter o status da integração
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/facebook/status`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Failed to get Facebook integration status')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Facebook status API:', error)
    return NextResponse.json({ connected: false, error: 'Failed to get status' }, { status: 500 })
  }
}
