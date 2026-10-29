import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vote Runner — 3D Endless Campaign Meme Game',
  description: 'A satirical meme 3D endless runner game where campaign leader Neta Ji dashes down endless streets collecting votes while outrunning rival Vipaksh Bhai.',
  openGraph: {
    title: 'Vote Runner — 3D Endless Campaign Meme Game',
    description: 'A satirical meme 3D endless runner game where campaign leader Neta Ji dashes down endless streets collecting votes while outrunning rival Vipaksh Bhai.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vote Runner — 3D Endless Campaign Meme Game',
    description: 'A satirical meme 3D endless runner game where campaign leader Neta Ji dashes down endless streets collecting votes while outrunning rival Vipaksh Bhai.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 select-none overflow-hidden touch-none" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
