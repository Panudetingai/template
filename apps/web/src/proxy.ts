import { type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';
import onboardingProxy from './module/onboarding/middleware/proxy';

export async function proxy(request: NextRequest) {
  const { response, accessToken } = await updateSession(request);
  return onboardingProxy(request, response, accessToken);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}