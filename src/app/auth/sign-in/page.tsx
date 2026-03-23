import appConfig from "@/configs/app.config";
import SignInForm from "@/module/auth/components/form/signin";
import { Metadata } from "next";

export const generateMetadata = (): Metadata => {
    return {
      title: `Sign In | ${appConfig.name}`,
      description: "Sign in to your account",
    }
  }

export default function page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <SignInForm />
        </div>
    )
}