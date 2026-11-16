import { publicEnv } from "@/env/public";

const production = process.env.NODE_ENV === "production";

const appConfig = {
  name: publicEnv.NEXT_PUBLIC_PRODUCT_NAME,
  title: publicEnv.NEXT_PUBLIC_APP_TITLE,
  description: publicEnv.NEXT_PUBLIC_APP_DESCRIPTION,
  url: publicEnv.NEXT_PUBLIC_APP_URL,
  production,
};

export default appConfig;
