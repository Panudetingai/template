import appConfig from "@/configs/app.config";
import SignupForm from "@/module/auth/components/form/signup";
import { Metadata } from "next";

export const generateMetadata = (): Metadata => {
    return {
      title: `Sign Up | ${appConfig.name}`,
      description: "Sign up to your account",
    }
  }

export default function page() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <SignupForm />
        </div>
    )
}