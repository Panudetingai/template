import { createClient } from "@supabase/supabase-js";

import { env } from "../env";

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/** Verifies user access tokens (JWT) issued by Supabase Auth. */
export const supabaseAuth = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  options,
);

/** Privileged client — server only. Used for admin operations. */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);
