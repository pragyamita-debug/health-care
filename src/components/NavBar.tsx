import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
];

interface Props {
  name: string;
  headline: string;
  skills: string[];
  email?: string;
  active: string;
}

export function NavBar({ name, headline, skills, email, active }: Props) {
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMobile(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return (
    <header ref={ref} className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="wrap nav__inner">
        <a className="nav__brand" href="#home">
          <span className="brand-mark" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="nav__name">
            <span className="wordmark">{name}</span>
            <span className="nav__tag" aria-hidden>
              {skills.slice(0, 3).join('  |  ') || headline}
            </span>
          </span>
        </a>

        <nav className={`nav__links ${mobile ? 'is-open' : ''}`} aria-label="Sections">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'is-active' : ''} aria-current={active === n.id ? 'location' : undefined} onClick={() => setMobile(false)}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="nav__end">
          <ThemeToggle />
          <a className="pill pill--sm nav__cta" href={email ? `mailto:${email}` : '#contact'}>
            Get in touch <Icon name="arrowUpRight" size={14} />
          </a>
          <button className="icon-btn nav__burger" aria-label="Open menu" aria-expanded={mobile} onClick={() => setMobile((m) => !m)}>
            <Icon name={mobile ? 'close' : 'menu'} size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
