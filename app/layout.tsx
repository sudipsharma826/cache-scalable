import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdsenseHorizontal } from '@/components/AdsenseHorizontal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cache Scalable Performance Analysis',
  description: 'Analyze the performance of cache scalability in a web application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo7.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 dark:bg-[#0a0a0a] dark:text-gray-100">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            {/* AdSense Horizontal - fixed, non-intrusive */}
            <div className="fixed bottom-4 right-4 z-50 max-w-xs w-full pointer-events-auto bg-transparent">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex items-center justify-center">
                <AdsenseHorizontal />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}