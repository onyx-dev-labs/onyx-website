import type { Metadata } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils/cn";

// Fallback for offline/restricted build environments
const inter = { variable: "" };
const jetbrainsMono = { variable: "" };

/*
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-jetbrains",
  display: 'swap',
});
*/

export const metadata: Metadata = {
  title: "Onyx Dev Labs | Forge Insight, Architect The Future",
  description: "High-fidelity digital agency specializing in Web Architecture, Data Science, and Security. Founded by Edusei Mikel.",
  icons: {
    icon: "/icon.png",
  },
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={cn(
        "min-h-screen bg-navy-950 font-sans antialiased",
        inter.variable,
        jetbrainsMono.variable
      )}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}