import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Support Chat — Administration",
  description: "Interface technicien du support informatique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}