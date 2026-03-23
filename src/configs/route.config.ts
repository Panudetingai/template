import z from "zod";

const routerConfigSchema = z.object({
    auth: z.object({
        SignIn: z.string().min(1),
        SignUp: z.string().min(1),
        ForgotPassword: z.string().min(1),
        ResetPassword: z.string().min(1),
        VerifyEmail: z.string().min(1),
        VerifyPhone: z.string().min(1),
    }),
    app: z.object({
        Repositorie: z.string().min(1),
        Generator: z.string().min(1),
        Posts: z.string().min(1),
        Notifications: z.string().min(1),
        Integrations: z.string().min(1),
        Settings: z.string().min(1),
    }),
    onboarding: z.string().min(1),
    error: z.string().min(1),
    notFound: z.string().min(1),
});

const routerConfig = routerConfigSchema.parse({
    auth: {
        SignIn: "/sign-in",
        SignUp: "/sign-up",
        ForgotPassword: "/forgot-password",
        ResetPassword: "/reset-password",
        VerifyEmail: "/verify-email",
        VerifyPhone: "/verify-phone",
    },
    app: {
        Repositorie: "/repositorie",
        Generator: "/generator",
        Posts: "/posts",
        Notifications: "/notifications",
        Integrations: "/integrations",
        Settings: "/settings",
    },
    onboarding: "/onboarding",
    error: "/error",
    notFound: "/not-found",
} satisfies z.infer<typeof routerConfigSchema>);

export default routerConfig;