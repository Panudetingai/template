import { createBrowserClient } from '@supabase/ssr'

import { publicEnv } from "@/env/public";
import { serverEnv } from '@/env/server';


export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: {
        name: `${serverEnv.COOKIE_PREFIX}-supabase-auth-token`,
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