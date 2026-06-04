import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventBooking",
  description: "Discover and RSVP to events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen`} style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
