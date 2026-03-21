import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = `${process.env.COOKIE_PREFIX}-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF!}-auth-token`

export async function createClient() {
  const cookieStore = await cookies()

  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: AUTH_COOKIE_NAME,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
            {
              cookieStore.set(name, value, options)
            }
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      }
    },
  )
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
}

export async function getUserMetadata() {
  const user = await getUser();
  return user?.user_metadata;
}