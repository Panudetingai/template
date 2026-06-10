import routerConfig from "@/configs/route.config";
import { publicEnv } from "@/env/public";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

interface Credentials {
    email: string;
    password: string;
}

class AuthService {
    private supabase: SupabaseServerClient;

    constructor(supabase: SupabaseServerClient) {
        this.supabase = supabase;
    }

    async signIn(credentials: Credentials) {
        const { email, password } = credentials;
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) return error;

        return data;
    }

    async signup(credentials: Credentials) {
        const { email, password } = credentials;
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
            }
        });

        if (error) return error;

        return data;
    }

    /**
     * @param email - The email of the user to reset the password for.
     */
    async resetPassword(email: string) {
        const redirectTo = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=${encodeURIComponent(routerConfig.auth.NewPassword)}`;
        const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) return error;

        return data;
    }

    async updatePassword(password: string) {
        const { data, error } = await this.supabase.auth.updateUser({ password });

        if (error) return error;

        return data;
    }
}

export { AuthService };
