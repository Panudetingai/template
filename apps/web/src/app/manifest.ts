import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "App",
    short_name: process.env.NEXT_PUBLIC_PRODUCT_NAME ?? "App",
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "Application",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    theme_color: "#8936FF",
    background_color: "#2EC6FE",
    dir: "auto",
    lang: "en-US",
    icons: [
      {
        src: "/manifest/icon-(512x512)-dark-rounded.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/manifest/icon-(512x512)-ligth.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
