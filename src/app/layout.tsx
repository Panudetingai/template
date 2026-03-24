import { AuthErrorHandler } from "@/components/auth-error-handler";
import { PWARegister } from "@/components/pwa-register";
import { Toaster } from "@/components/ui/sonner";
import { generateRootMetadata } from "@/configs/meta.config";
import QueryProvider from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <PWARegister />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <AuthErrorHandler />
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export const generateMetadata = generateRootMetadata;

export const viewport = {
  themeColor: "#ffffff",
};
