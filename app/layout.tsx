import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Dev Cockpit',
    description: 'Mon cockpit de développement personnel',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className="dark">
            <body className={`${inter.className} bg-slate-950 font-sans antialiased overflow-hidden`}>
                <AppLayout>
                    {children}
                </AppLayout>
            </body>
        </html>
    );
}

