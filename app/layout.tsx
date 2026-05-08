import type { Metadata } from "next";
import { Inter, Poppins, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "GoCash — Finanzas personales con enfoque emocional",
  description: "Bootstrap de GoCash con login, registro, JWT y modo seed local.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <body className="antialiased bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
