import { useEffect, useState } from 'react';
import { applyTheme, storedTheme, systemTheme, type Theme } from '../lib/theme';
import { Icon } from './Icon';

/** Sun / moon switch. Follows the device until the visitor picks, then remembers the pick. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => storedTheme() ?? systemTheme());

  // keep following the device while nothing has been picked
  useEffect(() => {
    if (storedTheme() || typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setTheme(mq.matches ? 'light' : 'dark');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className="icon-btn theme-toggle"
      data-theme-state={theme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      <span className="theme-toggle__icon theme-toggle__sun">
        <Icon name="sun" size={17} />
      </span>
      <span className="theme-toggle__icon theme-toggle__moon">
        <Icon name="moon" size={16} />
      </span>
    </button>
  );
}
