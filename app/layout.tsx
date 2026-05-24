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
  icons: {
    icon: [
      { url: "/habitta_icon.png", sizes: "32x32",  type: "image/png" },
      { url: "/habitta_icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/habitta_icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/habitta_icon.png",
  },
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
