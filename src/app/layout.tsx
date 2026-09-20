import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, Crimson_Pro } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/styles/theme-provider";
import "./globals.css";

const displayFont = Cinzel_Decorative({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-display" });
const headingFont = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-heading" });
const bodyFont = Crimson_Pro({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Rope Trick",
  description: "D&D companion platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${displayFont.variable} ${headingFont.variable} ${bodyFont.variable} dark-dungeon`} suppressHydrationWarning>
        <body className="min-h-screen bg-zinc-950 text-zinc-100 font-[var(--font-body)]">
          <ThemeProvider>
            <Navbar />
            <div className="min-h-[calc(100vh-4rem)]">{children}</div>
            <Toaster position="bottom-right" theme="dark" richColors closeButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
