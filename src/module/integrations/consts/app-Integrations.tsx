import { Github } from "@lobehub/icons";

type AppIntegration = {
    name: string;
    provider: string;
    icon: React.ReactNode;
    description: string;
}

export const appIntegrations: AppIntegration[] = [
    {
        name: "GitHub",
        provider: "github",
        icon: <Github size={24} />,
        description: "Connect your GitHub repositories to your database.",
    },
]