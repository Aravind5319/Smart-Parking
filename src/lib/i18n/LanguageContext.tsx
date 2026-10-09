'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, dictionaries } from './dictionary';

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof dictionaries.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('parkpuduvai_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ta')) {
      // eslint-disable-next-line
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('parkpuduvai_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t: dictionaries[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
