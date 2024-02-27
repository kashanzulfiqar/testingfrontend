import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationAR from './locales/ar.json';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
      translation: translationEN
    },
    ar: {
      translation: translationAR
    }
  };

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("lang") || document.querySelector('html').lang || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
