import { createBrowserClient } from '@supabase/ssr'

const AUTH_COOKIE_NAME = `${process.env.NEXT_PUBLIC_COOKIE_PREFIX! ?? 'dayily'}-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF!}-auth-token`

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: AUTH_COOKIE_NAME,
      },
    }
  )
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return user
}

export async function getUserMetadata() {
  const user = await getUser()
  return user?.user_metadata
}