import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcáNomás Balcarce | Tu oficio de confianza en 2 clics",
  description: "La pizarra virtual de oficios en Balcarce. Plomeros, electricistas, gasistas, podadores y pintores con reputación vecinal, cálculo de puntualidad y seguimiento en vivo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AcáNomás",
  },
  icons: {
    icon: "/logo-icono-transparente.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-16 sm:pb-0 overflow-x-hidden">
        <div className="flex-1 flex flex-col">{children}</div>
        <PwaInstallPrompt />
        <BottomNav />
      </body>
    </html>
  );
}
