import { NextRequest, NextResponse } from 'next/server'

const PASSWORD = 'waerme2026'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname === '/api/auth') {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('wp_auth')
  if (authCookie?.value === PASSWORD) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
