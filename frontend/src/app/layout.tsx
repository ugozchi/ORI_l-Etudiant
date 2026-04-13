import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ORI - Hackathon L'Étudiant",
  description: 'Application avec IA Vertex de Google et backend FastAPI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0A0A0A] text-white flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
