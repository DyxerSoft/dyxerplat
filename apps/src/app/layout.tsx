import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap"
});

const siteUrl = "https://www.dyxersoft.com/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dyxersoft | Software a medida, SaaS, datos e IA en Bolivia",
    template: "%s | Dyxersoft"
  },
  description:
    "Dyxersoft desarrolla plataformas SaaS, software empresarial, soluciones de datos, automatización e inteligencia artificial para empresas que buscan operar con mayor control y convertir sus datos en decisiones.",
  applicationName: "Dyxersoft",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_BO",
    url: siteUrl,
    siteName: "Dyxersoft",
    title: "Dyxersoft | Software a medida, SaaS, datos e IA en Bolivia",
    description:
      "Plataformas SaaS, software empresarial, datos, automatización e IA para empresas que buscan operar con mayor control.",
    images: [{ url: "/og-dyxersoft.jpg" }]
  }
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
