import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://voya.vercel.app"
  ),
  title: {
    default: "Voya · Planea el viaje de tus sueños",
    template: "%s · Voya",
  },
  description:
    "Descubre las mejores actividades de cada destino con AI, agrégalas a tu calendario y obtén un presupuesto realista. Sin caos, sin 47 tabs abiertos.",
  keywords: [
    "planear viajes",
    "itinerario",
    "viajes con AI",
    "presupuesto de viaje",
    "calendario de viaje",
    "actividades turísticas",
  ],
  authors: [{ name: "Voya" }],
  openGraph: {
    title: "Voya · Planea el viaje de tus sueños",
    description:
      "Descubre actividades curadas con AI, organiza tu calendario y calcula tu presupuesto. Todo en un solo lugar.",
    type: "website",
    locale: "es_MX",
    siteName: "Voya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voya · Planea el viaje de tus sueños",
    description:
      "Descubre actividades curadas con AI, organiza tu calendario y calcula tu presupuesto.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
