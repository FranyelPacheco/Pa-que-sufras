import { es } from './es';
import { en } from './en';
import type { Locale, TranslationKeys } from './types';

const translations: Record<Locale, TranslationKeys> = { es, en };

let currentLocale: Locale = 'es';

export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
};

export const getLocale = (): Locale => currentLocale;

export const t = (() => {
  const translate = (key: keyof TranslationKeys): TranslationKeys[keyof TranslationKeys] => {
    return translations[currentLocale][key];
  };

  translate.setLocale = setLocale;
  translate.getLocale = getLocale;

  return translate;
})();
