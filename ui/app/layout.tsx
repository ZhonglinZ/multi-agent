import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ZZL Agents",
  description: "ZZL Agents workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
