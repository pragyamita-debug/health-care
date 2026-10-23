import { useScrollSpy } from '../hooks/useScrollSpy';
import type { Resume } from '../lib/types';
import { Hero } from './Hero';
import { NAV, NavBar } from './NavBar';
import { ExperienceSection, Footer, ProfileSection, StatStrip, SunriseSection } from './Sections';
import './Dashboard.css';

const IDS = NAV.map((n) => n.id);

export function Dashboard({ resume }: { resume: Resume }) {
  const active = useScrollSpy(IDS, 160);

  return (
    <>
      <NavBar name={resume.name} headline={resume.headline} skills={resume.skills} email={resume.email} active={active} />
      <main>
        <Hero resume={resume} />
        <StatStrip resume={resume} />
        <ProfileSection resume={resume} />
        <ExperienceSection resume={resume} />
        <SunriseSection resume={resume} />
      </main>
      <Footer resume={resume} />
    </>
  );
}
