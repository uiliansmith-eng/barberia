import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Bebas_Neue } from "next/font/google";
import { CapacitorNativeBridge } from "@/components/capacitor-native-bridge";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "BarberOS — El sistema operativo de tu barbería";
const description =
  "Reservas online, gestión de clientes, agenda y cobros para barberías modernas. Encuentra tu barbería o empieza gratis 14 días.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "barbería",
    "reservas online barbería",
    "software para barberías",
    "agenda barbería",
    "citas barbería online",
  ],
  robots: { index: true, follow: true },
  verification: {
    google: "9927iUnCBSEWafpZNzcQI5gPiorI6dk83ODqyy3IaDE",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "BarberOS",
    url: siteUrl,
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CapacitorNativeBridge />
        {children}
      </body>
    </html>
  );
}
