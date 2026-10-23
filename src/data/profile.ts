import type { Resume } from '../lib/types';

/**
 * Everything the dashboard shows comes from this object.
 * Replace the placeholder values with real ones and the page updates —
 * no other file needs to change.
 */
export const profile: Resume = {
  name: 'Your Name',
  headline: 'Your Role | Your Specialty',
  tagline: 'One sentence about the work you do and the impact you want it to have.',
  email: 'you@example.com',
  location: 'Your City, Country',
  links: {
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
  },
  summary:
    'Two or three sentences about who you are, the problems you like to work on and what you are looking for next.',
  motto: 'Better care. Stronger practices.',

  experience: [
    {
      role: 'Your Current Role',
      company: 'Company Name',
      period: '2023 – Present',
      current: true,
      bullets: ['What you are responsible for.', 'A result you are proud of.'],
    },
    {
      role: 'Previous Role',
      company: 'Company Name',
      period: '2020 – 2023',
      current: false,
      bullets: ['What you delivered there.'],
    },
  ],

  education: [{ degree: 'Your Degree in Your Subject', short: 'M.Sc.', field: 'Your Subject', institution: 'Your University', year: '2020' }],

  skills: ['Skill One', 'Skill Two', 'Skill Three', 'Skill Four', 'Skill Five', 'Skill Six', 'Skill Seven', 'Skill Eight'],

  projects: [
    { title: 'Project One', meta: 'Category · Tools', description: 'What it automated or improved.', tags: [] },
    { title: 'Project Two', meta: 'Category · Tools', description: 'Who it helped and how.', tags: [] },
    { title: 'Project Three', meta: 'Category · Tools', description: 'The workflow it made simpler.', tags: [] },
    { title: 'Project Four', meta: 'Category · Tools', description: 'The result, in one line.', tags: [] },
    { title: 'Project Five', meta: 'Category · Tools', description: 'Anything else worth showing.', tags: [] },
  ],

  achievements: ['An award or recognition', 'A milestone you reached'],
  certifications: ['A certification you hold'],

  goals: [
    { label: 'Goal', value: 'Your next milestone', note: 'a measurable target' },
    { label: 'Next Step', value: 'What you are working on now' },
  ],

  interests: ['Interest One', 'Interest Two'],

  stats: { years: 5, yearsPlus: true, projects: 12, projectsPlus: true, skills: 8 },
};
