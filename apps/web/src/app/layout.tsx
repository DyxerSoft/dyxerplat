import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dyxersoft | Software a medida, SaaS, datos e IA en Bolivia",
  description:
    "Dyxersoft desarrolla software a medida, plataformas SaaS, dashboards, automatizacion e inteligencia artificial para empresas que necesitan operar con control y datos confiables."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={dmSans.className}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
