import type { Metadata } from "next";
import { Host_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/app/providers";
import { ResponsiveToaster } from "@/components/ResponsiveToaster";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Pages set their own `title`; it is shown as "Orders | Cpro".
  title: { template: "%s | Cpro", default: "Cpro" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", hostGrotesk.variable, "font-sans", jetbrainsMono.variable)}
    >
      <body className="flex flex-col h-full overflow-hidden select-none outline-none focus:outline-none">
        <Providers>
          {children}
        </Providers>
        <ResponsiveToaster />
      </body>
    </html>
  );
}
