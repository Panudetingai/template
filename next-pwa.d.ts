declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
  }

  type WithPWA = (config: PWAConfig) => (nextConfig: NextConfig) => NextConfig;
  const withPWA: WithPWA;
  export default withPWA;
}
