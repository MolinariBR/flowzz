import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function DELETE() {
  try {
    // Chamar o backend para desconectar
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/facebook/disconnect`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to disconnect Facebook integration')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in Facebook disconnect API:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Facebook integration' },
      { status: 500 }
    )
  }
}
