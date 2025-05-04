import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SignedIn, SignInButton, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Speech Emotion Recognition",
  description: "Analyze emotions from speech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <div className="min-h-screen bg-white">
            <header className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <h1 className="text-[#292d32] text-xl font-mono">
                  <Link href="/">SER</Link>
                </h1>
                <SignedIn>
                  <Link href="/dashboard" className="text-[#292d32] text-lg font-mono">Dashboard</Link>
                </SignedIn>
              </div>
              <div className="flex items-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="bg-[#4695f1] text-white px-4 py-2 rounded-lg hover:bg-[#4695f1]/90">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </header>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
