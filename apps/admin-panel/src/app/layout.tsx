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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#121212] text-gray-100 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

