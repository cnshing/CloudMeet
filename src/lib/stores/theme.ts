/**
 * Theme store — tracks and controls the user's theme preference.
 *
 * Preference values:
 *   'system' — follow the OS prefers-color-scheme setting (default)
 *   'light'  — always use light mode
 *   'dark'   — always use dark mode
 *
 * The actual `dark` class on <html> is managed by:
 *   1. The inline script in app.html  (first paint, no flash)
 *   2. The layout component           (live OS-change listener)
 *
 * Any UI toggle should call `setTheme()` from this module.
 */

import { writable } from 'svelte/store';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

function getInitialPreference(): ThemePreference {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return;

  const isDark =
    preference === 'dark' ||
    (preference === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
}

function createThemeStore() {
  const { subscribe, set } = writable<ThemePreference>(getInitialPreference());

  return {
    subscribe,

    /** Persist a new preference, update the store, and apply immediately. */
    setTheme(preference: ThemePreference) {
      localStorage.setItem(STORAGE_KEY, preference);
      set(preference);
      applyTheme(preference);
    },

    /** Re-apply the current preference (e.g. after an OS change fires). */
    refresh() {
      const current = getInitialPreference();
      set(current);
      applyTheme(current);
    },
  };
}

export const theme = createThemeStore();
