import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trompete - Fortaleça sua Fé",
  description: "O aplicativo completo para sua jornada espiritual: Bíblia, mensagens diárias, orações guiadas e muito mais. Mais de 500 mil usuários já transformaram suas vidas.",
  keywords: "bíblia, orações, mensagens diárias, fé, espiritualidade, cristianismo, devocionais",
  authors: [{ name: "Trompete" }],
  openGraph: {
    title: "Trompete - Fortaleça sua Fé",
    description: "O aplicativo completo para sua jornada espiritual com mais de 500 mil usuários",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trompete - Fortaleça sua Fé",
    description: "O aplicativo completo para sua jornada espiritual",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
