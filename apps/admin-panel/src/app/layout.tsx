import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saranam Ayyappa — Admin Console',
  description: 'Master Control & Content Management System for Saranam Ayyappa Devotional Platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/images/saranam-ayyappa-official-emblem.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="te" data-lang="te" suppressHydrationWarning>
      <head>
        {/* Preload NTR font directly for instant 0ms rendering */}
        <link rel="preload" href="/fonts/NTR-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {/* Instant Synchronous Language Initializer (Eliminates 2-second font-shift on refresh) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var p = new URLSearchParams(window.location.search);
    var l = p.get('lang') || localStorage.getItem('ayyappa_admin_lang') || 'te';
    if (!['te', 'kn', 'ta', 'hi', 'en'].includes(l)) l = 'te';
    document.documentElement.lang = l;
    document.documentElement.setAttribute('data-lang', l);
  } catch(e) {
    document.documentElement.lang = 'te';
    document.documentElement.setAttribute('data-lang', 'te');
  }
})();
`,
          }}
        />
      </head>
      <body className="bg-[#121212] text-gray-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

