'use client';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PatrolsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex h-full items-center justify-center bg-white rounded-lg shadow-sm border border-subtle-border">
      <div className="text-center text-main-text/50">
        <h2 className="text-xl font-bold mb-2">{t.dashboard.patrols}</h2>
        <p>Patrol dispatch integration module coming soon.</p>
      </div>
    </div>
  );
}
