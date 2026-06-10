import { publicEnv } from "@/env/public";
import z from "zod";

function apiUrlToWsUrl(apiUrl: string) {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${url.origin}/api/ws-auth`;
}

const wsUrl =
    publicEnv.NEXT_PUBLIC_WS_URL ?? apiUrlToWsUrl(publicEnv.NEXT_PUBLIC_API_URL);

const routerConfigSchema = z.object({
    auth: z.object({
        SignIn: z.string().min(1),
        SignUp: z.string().min(1),
        ForgotPassword: z.string().min(1),
        NewPassword: z.string().min(1),
        VerifyEmail: z.string().min(1),
        VerifyPhone: z.string().min(1),
    }),
    app: z.object({
        Dashboard: z.string().min(1),
        Profile: z.string().min(1),
        Notifications: z.string().min(1),
        Settings: z.string().min(1),
        onboarding: z.string().min(1)
    }),
    api: z.object({
        auth: z.object({
            webhook: z.string().min(1),
            webhookHttp: z.string().min(1),
        }),
    }),
    onboarding: z.string().min(1),
    error: z.string().min(1),
    notFound: z.string().min(1),
});

const routerConfig = routerConfigSchema.parse({
    auth: {
        SignIn: "/auth/sign-in",
        SignUp: "/auth/sign-up",
        ForgotPassword: "/auth/forgot-password",
        NewPassword: "/auth/new-password",
        VerifyEmail: "/auth/verify-email",
        VerifyPhone: "/verify-phone",
    },
    app: {
        Dashboard: "/dashboard",
        Profile: "/profile",
        Notifications: "/notifications",
        Settings: "/settings",
        onboarding: "/onboarding",
    },
    api: {
        auth: {
            webhook: wsUrl,
            webhookHttp: `${publicEnv.NEXT_PUBLIC_API_URL}/api/auth/webhook`,
        },
    },
    onboarding: "/onboarding",
    error: "/error",
    notFound: "/not-found",
} satisfies z.infer<typeof routerConfigSchema>);

export default routerConfig;
