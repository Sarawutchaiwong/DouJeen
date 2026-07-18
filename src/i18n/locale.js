'use server';

import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './config';

// Server action: persist the chosen locale in a cookie. The client refreshes
// afterwards so server components re-read the cookie and re-render translated.
export async function setLocaleCookie(locale) {
  const active = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const store = await cookies();
  store.set(LOCALE_COOKIE, active, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
