import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = 'waerme2026'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body

  if (password === PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('wp_auth', PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    return response
  }

  return NextResponse.json({ success: false, error: 'Falsches Passwort' }, { status: 401 })
}
