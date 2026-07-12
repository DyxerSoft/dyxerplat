import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dyxerplat | DyxerSoft",
  description: "Landing publica, blog y plataforma CRM interna de DyxerSoft."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={dmSans.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
