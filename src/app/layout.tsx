import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusBoard - Team Collaboration Platform",
  description: "A complete team collaboration platform with workspaces, task boards, and real-time collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
