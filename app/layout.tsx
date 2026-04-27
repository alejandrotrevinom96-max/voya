import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voya · Planea el viaje de tus sueños",
  description:
    "Descubre las mejores actividades de cada destino, agrégalas a tu calendario y obtén un presupuesto realista.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
