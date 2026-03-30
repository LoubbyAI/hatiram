import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { allStrings, Strings, Lang } from './strings';

const DIL_ANAHTARI = 'ayar_dil';

interface LanguageCtx {
  lang: Lang;
  t: Strings;
  setLang: (l: Lang) => Promise<void>;
}

export const LanguageContext = createContext<LanguageCtx>({
  lang: 'tr',
  t: allStrings.tr,
  setLang: async () => {},
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export { Lang, Strings };

import React from 'react';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    AsyncStorage.getItem(DIL_ANAHTARI).then(saved => {
      if (saved === 'tr' || saved === 'en') {
        setLangState(saved);
      } else {
        // Cihaz diline göre otomatik seç
        const locale = getLocales()[0]?.languageCode ?? 'tr';
        setLangState(locale === 'tr' ? 'tr' : 'en');
      }
    });
  }, []);

  const setLang = async (l: Lang) => {
    await AsyncStorage.setItem(DIL_ANAHTARI, l);
    setLangState(l);
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { lang, t: allStrings[lang], setLang } },
    children,
  );
}
