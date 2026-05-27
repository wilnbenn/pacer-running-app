import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pacer — Personalized Running Coach',
  description: 'Training plans and daily nutrition for runners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
