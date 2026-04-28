import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://voya.vercel.app"
  ),
  title: {
    default: "Voya · Planea el viaje de tus sueños",
    template: "%s · Voya",
  },
  description:
    "Voya usa inteligencia artificial para crear itinerarios personalizados, con actividades reales, presupuestos claros y calendarios listos para usar.",
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
      "Itinerarios personalizados con AI, presupuestos claros y calendarios listos para usar. Tu próximo viaje, planeado en minutos.",
    type: "website",
    locale: "es_MX",
    siteName: "Voya",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voya · Planea el viaje de tus sueños",
    description:
      "Itinerarios personalizados con AI, presupuestos claros y calendarios listos para usar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
