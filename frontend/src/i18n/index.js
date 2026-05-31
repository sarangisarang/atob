import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ka from './ka';
import en from './en';
import ru from './ru';
import de from './de';
import tr from './tr';
import fr from './fr';
import es from './es';
import ar from './ar';
import zh from './zh';
import it from './it';
import pt from './pt';
import uk from './uk';
import pl from './pl';
import nl from './nl';
import ro from './ro';
import ja from './ja';
import ko from './ko';

export const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ka', label: '🇬🇪 ქართული' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'ar', label: '🇸🇦 العربية' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'it', label: '🇮🇹 Italiano' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'uk', label: '🇺🇦 Українська' },
  { code: 'pl', label: '🇵🇱 Polski' },
  { code: 'nl', label: '🇳🇱 Nederlands' },
  { code: 'ro', label: '🇷🇴 Română' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'ko', label: '🇰🇷 한국어' },
];

const TRANSLATIONS = { ka, en, ru, de, tr, fr, es, ar, zh, it, pt, uk, pl, nl, ro, ja, ko };

const LanguageContext = createContext({ t: (k) => k, lang: 'en', changeLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('appLang').then((saved) => {
      if (saved && TRANSLATIONS[saved]) setLang(saved);
    });
  }, []);

  const t = (key) => {
    const parts = key.split('.');
    let val = TRANSLATIONS[lang];
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined) return key;
    }
    return val ?? key;
  };

  const changeLanguage = async (newLang) => {
    setLang(newLang);
    await AsyncStorage.setItem('appLang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ t, lang, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
