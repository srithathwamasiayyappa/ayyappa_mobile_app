import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saranam Ayyappa — Admin Console',
  description: 'Master Control & Content Management System for Saranam Ayyappa Devotional Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#121212] text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

