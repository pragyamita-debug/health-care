import { useRef } from 'react';
import doctor from '../assets/photos/doctor.jpg';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from '../hooks/useInView';
import { useScramble } from '../hooks/useScramble';
import type { Resume } from '../lib/types';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';
import './Hero.css';

/** "Healthcare Operations Analyst | Revenue Cycle" → ["Healthcare Operations Analyst", "Revenue Cycle"] */
const splitHeadline = (h: string) => h.split(/\s*[|•·,–—]\s*/).filter(Boolean);

const LIST_ICONS: IconName[] = ['cog', 'chat', 'puzzle', 'calendar', 'phone'];

/** Wraps the first skill that appears in the sentence in a highlight, like "healthcare providers" in the design. */
function highlight(text: string, skills: string[]) {
  const hit = skills.find((s) => s.length > 3 && text.toLowerCase().includes(s.toLowerCase()));
  if (!hit) return text;
  const i = text.toLowerCase().indexOf(hit.toLowerCase());
  return (
    <>
      {text.slice(0, i)}
      <b className="hero__hl">{text.slice(i, i + hit.length)}</b>
      {text.slice(i + hit.length)}
    </>
  );
}

function PanelRow({ icon, label, value, suffix = '', run, delay }: { icon: IconName; label: string; value: number | string; suffix?: string; run: boolean; delay: number }) {
  const numeric = typeof value === 'number';
  const n = useCountUp(numeric ? value : 0, run, { duration: 2000, delay });
  const text = useScramble(numeric ? '' : value, run && !numeric, { delay });
  const done = numeric ? n >= value * 0.98 : text === value;
  return (
    <li className="panel-row">
      <span className="panel-row__icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="panel-row__label">{label}</span>
      <b className="panel-row__value">
        {numeric ? Math.round(n) : text || ' '}
        {suffix && <i className={done ? 'is-on' : ''}>{suffix}</i>}
      </b>
    </li>
  );
}

interface Props {
  resume: Resume;
  onDownloadCv: () => void;
  isExample?: boolean;
  onUpload?: () => void;
}

export function Hero({ resume, onDownloadCv, isExample = false, onUpload }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [panelRef, panelIn] = useInView<HTMLDivElement>(0.3);
  const { stats } = resume;

  const [first, ...rest] = resume.name.split(/\s+/);
  const [role, focus] = splitHeadline(resume.headline);
  const intro = resume.summary ? resume.summary.split(/(?<=[.!?])\s/)[0] : resume.tagline;
  const list = resume.projects.slice(0, 5);
  const motto = (resume.motto || 'Better care. Stronger practices.').replace(/[.]/g, '').split(/\s+/);
  const edu = resume.education[0];

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  return (
    <section id="home" className="hero" ref={ref} onPointerMove={onPointerMove} aria-label="Introduction">
      <div className="wrap hero__grid">
        <div className="hero__copy">
          {isExample && (
            <button className="hero__example" onClick={onUpload}>
              <span className="hero__example-dot" aria-hidden />
              Example dashboard — upload a CV to make it yours
              <Icon name="arrowUpRight" size={13} />
            </button>
          )}

          <p className="label hero__eyebrow">{focus || resume.location || 'Portfolio'}</p>

          <h1 className="display hero__title">
            <span className="hero__line">{first}</span>
            {rest.length > 0 && <span className="hero__line accent">{rest.join(' ')}</span>}
            {role && <span className="hero__line light">{role}</span>}
          </h1>
          <span className="hero__bar" aria-hidden />

          {intro && <p className="hero__intro">{highlight(intro, resume.skills)}</p>}

          {list.length > 0 && (
            <ul className="hero__list" aria-label="Projects">
              {list.map((p, i) => (
                <Reveal as="li" key={p.title + i} delay={300 + i * 110}>
                  <span className="icon-tile">
                    <Icon name={LIST_ICONS[i % LIST_ICONS.length]} size={22} />
                  </span>
                  <span>
                    <b>{p.title}</b>
                    <small>{p.description || p.meta || p.tags.join(', ')}</small>
                  </span>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="hero__actions">
            <a className="pill" href="#experience">
              View Experience <Icon name="arrowRight" size={15} />
            </a>
            {isExample ? (
              <button className="pill pill--ghost" onClick={onUpload}>
                <Icon name="upload" size={15} /> Upload your CV
              </button>
            ) : (
              <button className="pill pill--ghost" onClick={onDownloadCv}>
                <Icon name="download" size={15} /> Download CV
              </button>
            )}
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__photo" aria-hidden>
            <img src={doctor} alt="" />
            {/* morning sun coming up behind the clinic window */}
            <span className="hero__sun" />
            <span className="hero__sunrays" />
          </div>

          <p className="hero__window" aria-hidden>
            {motto.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
            <i />
          </p>

          {/* glass "overview" screen floating where the hologram is in the photo */}
          <div className="holo" ref={panelRef}>
            <div className="holo__top" aria-hidden>
              <span className="holo__menu" />
              <span className="holo__dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <p className="holo__title">Profile Overview</p>
            <div className="holo__body">
              <div className="holo__figure" aria-hidden>
                <svg viewBox="0 0 60 120">
                  <circle cx="30" cy="12" r="8" />
                  <path d="M18 26h24l5 34-6 2-4-24v80h-7V78h-2v40h-7V38l-4 24-6-2z" />
                </svg>
                <span className="holo__scan" />
              </div>
              <ul className="holo__rows">
                <PanelRow icon="briefcase" label="Experience" value={stats.years} suffix={stats.yearsPlus ? '+ yrs' : ' yrs'} run={panelIn} delay={300} />
                <PanelRow icon="chat" label="Projects" value={stats.projects} suffix={stats.projectsPlus ? '+' : ''} run={panelIn} delay={450} />
                <PanelRow icon="users" label="Skills" value={stats.skills} run={panelIn} delay={600} />
                <PanelRow icon="chart" label="Education" value={edu?.short || '—'} run={panelIn} delay={750} />
                {resume.skills.length > 0 && (
                  <li>
                    <ul className="holo__skills">
                      {resume.skills.slice(0, 4).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </li>
                )}
                <li aria-hidden>
                  <svg className="holo__ecg" viewBox="0 0 120 36" preserveAspectRatio="none">
                    <path d="M0 20 H30 L36 20 L40 8 L45 32 L50 4 L55 26 L59 20 H82 L86 16 L90 20 H120" />
                  </svg>
                </li>
              </ul>
            </div>
            {resume.goals[0] && (
              <p className="holo__next">
                <span>Next step</span>
                <b>{resume.goals[0].value}</b>
              </p>
            )}
            <div className="holo__charts" aria-hidden>
              <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="holo__line">
                <path d="M0 24 L12 20 L22 22 L34 14 L46 17 L58 9 L70 12 L82 5 L100 8" />
              </svg>
              <span className="holo__bars">
                {[40, 65, 50, 80, 60, 90].map((h, i) => (
                  <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              <svg viewBox="0 0 36 36" className="holo__donut">
                <circle cx="18" cy="18" r="14" />
                <circle cx="18" cy="18" r="14" className="holo__donut-fill" style={{ strokeDashoffset: panelIn ? 88 * 0.28 : 88 }} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
