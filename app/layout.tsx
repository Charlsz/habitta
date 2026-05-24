import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Habitta - Gestión Estructurada",
  description: "Convierte tu operación dispersa en gestión estructurada. Plataforma administrativa de ingresos, tickets y activos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
    >
      {/* background y color se aplican desde globals.css — no clases Tailwind */}
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
