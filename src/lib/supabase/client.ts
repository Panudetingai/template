import { createBrowserClient } from '@supabase/ssr';

import { publicEnv } from "@/env/public";

const AUTH_COOKIE_NAME = `${publicEnv.NEXT_PUBLIC_COOKIE_PREFIX}-${publicEnv.NEXT_PUBLIC_SUPABASE_PROJECT_REF}-auth-token`

export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
  if (error) throw new Error(error.message)
  return user
}

export async function getUserMetadata() {
  const user = await getUser()
  return user?.user_metadata
}