import type { Metadata } from "next";
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
      <body className="font-sans bg-zinc-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
