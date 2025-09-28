import type { Metadata } from "next";
import "./globals.css";
import NextAuthSessionProvider from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "PennForce CRM",
  description: "Aviation-first CRM built on Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}