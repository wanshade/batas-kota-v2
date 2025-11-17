import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import ConditionalNavbar from "@/components/layout/conditional-navbar";
import ConditionalFooter from "@/components/layout/conditional-footer";
import ClientOnly from "@/components/client-only";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Batas Kota - Mini Soccer Field Booking",
  description: "Book professional mini soccer fields online with Batas Kota. Easy reservations, secure payments, and quality facilities.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <ClientOnly fallback={<header className="h-16 bg-white border-b"></header>}>
            <ConditionalNavbar />
          </ClientOnly>
          <main className="flex-1">
            <ClientOnly fallback={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            }>
              {children}
            </ClientOnly>
          </main>
          <ClientOnly fallback={<footer className="h-64 bg-gray-50 border-t"></footer>}>
            <ConditionalFooter />
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
