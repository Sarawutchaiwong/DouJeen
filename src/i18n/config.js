// i18n locale config (cookie-based, no URL routing).
export const LOCALES = ['en', 'th'];
export const DEFAULT_LOCALE = 'en';
export const LOCALE_COOKIE = 'doujeen_locale';

export const isLocale = (value) => LOCALES.includes(value);
