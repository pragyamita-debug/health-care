import { useEffect, useState } from 'react';
import clinic from '../assets/photos/clinic-blur.jpg';
import { useCountUp } from '../hooks/useCountUp';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScramble } from '../hooks/useScramble';
import type { Resume } from '../lib/types';
import { GlowCard, type Accent } from './GlowCard';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';

/* ================= stat cards ================= */

interface StatProps {
  icon: IconName;
  value: number | string;
  suffix?: string;
  label: string;
  index: number;
  run: boolean;
  accent: Accent;
}

function Stat({ icon, value, suffix = '', label, index, run, accent }: StatProps) {
  const numeric = typeof value === 'number';
  const count = useCountUp(numeric ? value : 0, run, { duration: 1900 + index * 200, delay: index * 150 });
  const text = useScramble(numeric ? '' : value, run && !numeric, { delay: index * 150 });
  const done = numeric ? count >= value * 0.98 : text === value;
  return (
    <GlowCard className="stat" accent={accent} phase={index * 0.25} speed={7 + index * 0.5}>
      <span className="icon-tile icon-tile--sm">
        <Icon name={icon} size={20} />
      </span>
      <b className="stat__value" aria-label={`${value}${suffix}`}>
        <span aria-hidden>
          {numeric ? Math.round(count) : text || ' '}
          {suffix && <i className={done ? 'is-on' : ''}>{suffix}</i>}
        </span>
      </b>
      <span className="stat__label">{label}</span>
    </GlowCard>
  );
}

export function StatStrip({ resume }: { resume: Resume }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const { stats } = resume;
  const edu = resume.education[0];
  return (
    <section className="section section--stats" aria-label="At a glance">
      <div className="wrap stats" ref={ref}>
        <Stat index={0} run={inView} accent="green" icon="briefcase" value={stats.years} suffix={stats.yearsPlus ? '+' : ''} label="Years of experience" />
        <Stat index={1} run={inView} accent="blue" icon="chart" value={stats.projects} suffix={stats.projectsPlus ? '+' : ''} label="Projects delivered" />
        <Stat index={2} run={inView} accent="teal" icon="puzzle" value={stats.skills} label="Core skills" />
        <Stat index={3} run={inView} accent="purple" icon="graduation" value={edu?.short || '—'} label={edu?.field ? `Education · ${edu.field}` : 'Education'} />
      </div>
    </section>
  );
}

/* ================= about + skills ================= */

export function ProfileSection({ resume, onDownloadCv }: { resume: Resume; onDownloadCv: () => void }) {
  return (
    <section id="profile" className="section" aria-labelledby="profile-title">
      <div className="wrap about">
        <Reveal className="about__copy">
          <span className="label">About</span>
          <h2 id="profile-title" className="title">
            Better care,
            <br />
            <span className="accent">stronger</span> teams.
          </h2>
          <span className="hero__bar" aria-hidden />
          <p className="about__summary">{resume.summary || resume.tagline}</p>
          <button className="pill pill--ghost" onClick={onDownloadCv}>
            <Icon name="download" size={15} /> Download CV
          </button>
        </Reveal>

        <GlowCard className="skills" accent="blue" speed={10} tilt={false}>
          <span className="label">Skills</span>
          <ul>
            {resume.skills.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 50} className="skill">
                {s}
              </Reveal>
            ))}
          </ul>
          {resume.interests.length > 0 && (
            <>
              <span className="label skills__sub">Interests</span>
              <p className="skills__interests">{resume.interests.join(' · ')}</p>
            </>
          )}
        </GlowCard>
      </div>
    </section>
  );
}

/* ================= experience + credentials ================= */

export function ExperienceSection({ resume }: { resume: Resume }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const roles = resume.experience;

  // the highlight walks down the roles, like the step strip in the reference video
  useEffect(() => {
    if (reduced || paused || roles.length < 2) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, [reduced, paused, roles.length]);

  // three "books" on the desk: degrees, certifications, achievements
  const books = [
    ...resume.education.map((e) => ({ kind: 'Education', text: e.degree, sub: [e.institution, e.year].filter(Boolean).join(' · ') })),
    ...resume.certifications.map((c) => ({ kind: 'Certification', text: c, sub: '' })),
    ...resume.achievements.map((a) => ({ kind: 'Achievement', text: a, sub: '' })),
  ];

  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="wrap">
        <Reveal>
          <span className="label">Experience</span>
          <h2 id="experience-title" className="title">
            Where I’ve <span className="accent">made a difference</span>
          </h2>
        </Reveal>

        <div className="career">
          <ol className="timeline" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
            {roles.length ? (
              roles.map((e, i) => (
                <Reveal as="li" key={e.role + i} delay={i * 110} onPointerEnter={() => setActive(i)}>
                  <GlowCard className={`role ${i === active ? 'is-current' : ''}`} accent={i === active ? 'green' : 'blue'} active={i === active} phase={i * 0.3} speed={8} tilt={false}>
                    <span className="role__dot" aria-hidden />
                    <header>
                      <div>
                        <h3>{e.role}</h3>
                        <p>{[e.company, e.location].filter(Boolean).join(' · ')}</p>
                      </div>
                      {e.period && <span className={`role__period ${e.current ? 'is-now' : ''}`}>{e.period}</span>}
                    </header>
                    {e.bullets.length > 0 && (
                      <ul>
                        {e.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </GlowCard>
                </Reveal>
              ))
            ) : (
              <li className="empty">No experience section was found in the CV.</li>
            )}
          </ol>

          <div className="books">
            <span className="label">Credentials</span>
            <ul>
              {books.slice(0, 6).map((b, i) => (
                <Reveal as="li" key={b.text + i} delay={i * 90} className="book" style={{ ['--i' as string]: i }}>
                  <span className="book__kind">{b.kind}</span>
                  <b>{b.text}</b>
                  {b.sub && <small>{b.sub}</small>}
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= sunrise sign-off ("for a Healthier Tomorrow") ================= */

export function SunriseSection({ resume }: { resume: Resume }) {
  const goal = resume.goals[0];
  return (
    <section id="contact" className="sunrise" aria-labelledby="contact-title">
      <img className="sunrise__bg" src={clinic} alt="" aria-hidden />
      <div className="sunrise__sky" aria-hidden>
        <span className="sunrise__clip">
          <span className="sunrise__sun" />
        </span>
        <span className="sunrise__rays" />
        <span className="sunrise__horizon" />
      </div>

      <div className="wrap sunrise__content">
        <span className="label">Next</span>
        <h2 id="contact-title" className="display sunrise__title">
          {goal ? goal.value : 'Ready for what’s next'}
          <span className="light"> for a healthier tomorrow.</span>
        </h2>
        {goal?.note && <p className="sunrise__note">{goal.note}</p>}
        <div className="sunrise__actions">
          <a className="pill" href={resume.email ? `mailto:${resume.email}` : '#home'}>
            Get in touch <Icon name="arrowRight" size={15} />
          </a>
          {resume.links.linkedin && (
            <a className="pill pill--ghost" href={resume.links.linkedin} target="_blank" rel="noreferrer">
              <Icon name="linkedin" size={15} /> LinkedIn
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= footer ================= */

export function Footer({ resume }: { resume: Resume }) {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span className="brand-mark" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span>
          © {new Date().getFullYear()} {resume.name}. Generated from a CV.
        </span>
        <nav className="footer__links" aria-label="Profiles">
          {resume.links.linkedin && (
            <a href={resume.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {resume.links.github && (
            <a href={resume.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {resume.email && <a href={`mailto:${resume.email}`}>Email</a>}
        </nav>
      </div>
    </footer>
  );
}
