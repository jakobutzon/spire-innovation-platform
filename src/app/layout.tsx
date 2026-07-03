import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spire — Innovationsplatform",
  description:
    "Spire er en dansk platform til innovationsstyring: fra idé til projekt — del din mening, upvote de bedste idéer, og lad ledelsen føre dem videre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          <AppStoreProvider>{children}</AppStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
