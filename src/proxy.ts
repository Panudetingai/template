import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|api/ws/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}