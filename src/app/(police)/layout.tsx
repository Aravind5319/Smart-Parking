import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function PoliceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Body: Left Sidebar + Main Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden w-full relative">
        <Sidebar />
        <main className="flex-1 min-h-0 h-full overflow-hidden flex flex-col p-2 sm:p-2.5 lg:p-2.5 bg-[var(--background)] transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}
