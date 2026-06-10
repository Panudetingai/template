import appConfig from "@/configs/app.config";
import NewPasswordForm from "@/module/auth/components/form/new-password";
import { Metadata } from "next";

export const generateMetadata = (): Metadata => {
  return {
    title: `New Password | ${appConfig.name}`,
    description: "Set a new password for your account",
  };
};

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <NewPasswordForm />
    </div>
  );
}
