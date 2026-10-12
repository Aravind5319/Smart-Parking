'use client';

import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { SidebarProvider } from '@/lib/context/SidebarContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </LanguageProvider>
  );
}

