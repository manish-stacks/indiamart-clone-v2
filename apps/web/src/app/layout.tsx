import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'IndiaTrade - India\'s Free B2B & B2C Marketplace',
  description:
    'Free Indian B2B marketplace to discover verified manufacturers, wholesalers, distributors, exporters, and industrial suppliers across India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

