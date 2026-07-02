import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vak - AI Chat",
  description: "Chat with the custom GPT-2 model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
