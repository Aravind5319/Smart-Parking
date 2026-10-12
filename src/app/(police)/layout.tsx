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
      {/* Top Header (9-11% of height) */}
      <Header />

      {/* Main Body: Left Sidebar + Main Workspace */}
      <div className="flex flex-1 overflow-hidden w-full h-[calc(100vh-74px)] relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto lg:overflow-hidden p-2 lg:p-3 bg-[var(--background)] transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
}
