import appConfig from "@/configs/app.config";
import ResetPasswordForm from "@/module/auth/components/form/forgot-password";
import { Metadata } from "next";

export const generateMetadata = (): Metadata => {
  return {
    title: `Reset Password | ${appConfig.name}`,
    description: "Reset your account password",
  };
};

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ResetPasswordForm />
    </div>
  );
}
