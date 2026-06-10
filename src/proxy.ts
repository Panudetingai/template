import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';
import onboardingProxy from './module/onboarding/middleware/proxy';

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  return onboardingProxy(request, response, userId);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|api/ws/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}