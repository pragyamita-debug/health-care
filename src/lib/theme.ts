export type Theme = 'light' | 'dark';

const KEY = 'cv-dashboard:theme';

/** The theme the visitor picked, or null to follow the device setting. */
export function storedTheme(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

export function systemTheme(): Theme {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Pins the page to a theme (sets data-theme on <html>) and remembers it. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f2f7fd' : '#061631');
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode — the choice just won't persist */
  }
}
