import type { Metadata } from 'next';
import './globals.css';
import AmbientGlow from '@/components/common/AmbientGlow';

export const metadata: Metadata = {
  title: 'Chill Guy — Design basics with principles and laws.',
  description:
    'Studio-grade showcase of foundational Transformer architectures, 124M GPT language modeling, and instruction-tuned neural intelligence.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%2338bdf8'/></svg>",
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
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmbientGlow />
        {children}
      </body>
    </html>
  );
}
