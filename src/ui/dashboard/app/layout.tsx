import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Only-One Workflow Dashboard',
    description: 'Modern Visual Kanban & Agent Orchestration Dashboard for Only-One CLI',
};

type RootLayoutProps = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" className="dark h-full">
            <body className="h-full bg-background text-slate-200 antialiased">{children}</body>
        </html>
    );
}
