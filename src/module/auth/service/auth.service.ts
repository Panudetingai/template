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

        if (error) throw new Error(error.message);

        return data;
    }

    async signup(credentials: Credentials) {
        const { email, password } = credentials;
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw new Error(error.message);

        return data;
    }
}