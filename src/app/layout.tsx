import type { Metadata } from "next";
import IslandNav from "@/components/IslandNav";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexora",
  description: "Watch videos through Nexora's proxy — stream without blocked domains.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 font-sans text-white pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        {children}
        <IslandNav />
        <Analytics />
      </body>
    </html>
  );
}
