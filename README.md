# Healthcare Portfolio Dashboard

An animated portfolio dashboard in a healthcare style: deep navy and bright cyan, heavy white headlines, glass panels, a doctor
working on a tablet beside a floating "Profile Overview" screen, and a sunrise sign-off
“for a healthier tomorrow”.

Comes in a **light** and a **dark** theme. It follows the visitor's device setting until they press
the sun / moon button in the top bar; their pick is then remembered.

All the content lives in one file, `src/data/profile.ts`. It ships with neutral placeholder
text (“Your Name”, “Your Role”, “Project One”…) — replace the values and the whole page updates.

**Live site:** https://pragyamita-debug.github.io/health-care/ (after Pages is switched on — see below)

## Making it yours

Open `src/data/profile.ts` and edit the fields:

| Field | Shown in |
| --- | --- |
| `name`, `headline` (`Role | Specialty`), `location`, `email`, `links` | top bar, hero, contact, footer |
| `summary`, `tagline`, `motto` | hero intro, About, the window text |
| `experience`, `education`, `certifications`, `achievements` | timeline and credentials |
| `skills`, `interests`, `projects` | hero list, Profile Overview, About |
| `goals` | “Next step” on the glass screen and the sunrise sign-off |
| `stats` | the counting numbers |
| `cvUrl` (optional) | adds a **Download CV** button — put the file in `public/` |

## What the dashboard shows

| Section | Built from |
| --- | --- |
| Top bar | rising-bars mark, name, top three skills, section links, light/dark switch, **Get in touch** |
| Hero | first name (white) / last name (cyan) / role, a highlighted summary line, up to five projects with icon tiles |
| Photo | doctor with a tablet; the motto is written on the window glass; a glass **Profile Overview** screen floats where the hologram is — experience counting up, projects, skills, degree, top skills, a heartbeat line and the next step |
| Stat cards | years of experience, projects, skills, highest degree — all counting / decoding |
| About | summary, all skills, interests |
| Experience | timeline of roles (the highlight walks from role to role) and credentials stacked like books on a desk |
| Sign-off | the next goal “for a healthier tomorrow” over a rising sun |

## Light and dark themes

- All colours are CSS variables at the top of `src/styles/global.css`. The first `:root` block is the
  dark palette; the light palette is written twice below it (once for `prefers-color-scheme: light`,
  once for `[data-theme='light']`) — keep those two blocks identical when you change a colour.
- `src/components/ThemeToggle.tsx` switches the theme by setting `data-theme` on `<html>`;
  `src/lib/theme.ts` remembers the choice in `localStorage`.
- A tiny script in `index.html` applies the saved theme before the page draws, so it never flashes
  the wrong colours.
- The glass “Profile Overview” screen and the window text sit on the photo, so they keep the same
  colours in both themes.

## Animations

| Effect | Where | How |
| --- | --- | --- |
| Counting numbers | Profile Overview, stat cards | `useCountUp` — rAF + ease-out-expo, starts when in view; the “+” lands when the count finishes |
| Decoding text | Degree | `useScramble` — characters settle left to right |
| Moving, lit borders | Every card and icon tile | conic gradient on `@property --angle`, masked to a thin ring, plus a blurred halo (`GlowCard`) |
| Hover | Cards, icon tiles, skills, books | pointer spotlight + slight 3D tilt, lift, glow |
| Floating glass screen | Hero | tilted panel that bobs, a sheen sweeps across it, a scan line runs over the figure, the heartbeat line draws |
| Rising sun | Hero window, sign-off | the sun climbs out from behind the horizon (clipped), the horizon line and rays light up |
| Role highlight | Experience | the active role lights up and hands over to the next (pauses on hover) |

All motion respects `prefers-reduced-motion`.

## Getting started

```bash
npm install
npm run dev          # local dev server
npm run typecheck    # TypeScript check
npm run build        # static build in dist/
npm run build:single # one self-contained index.html in dist-single/
```

## Publish on GitHub Pages

1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. **Actions → Deploy to GitHub Pages → Run workflow** (it also runs on every push to `main`).

## Project structure

```
src/
  App.tsx                 renders the dashboard from the profile
  data/profile.ts         all the content (edit this)
  lib/
    types.ts              the profile shape
    theme.ts              read / apply / remember the theme
  hooks/                  useCountUp, useScramble, useInView, usePointerGlow, useScrollSpy
  components/
    NavBar.tsx, Hero.tsx, Sections.tsx, Dashboard.tsx
    GlowCard.tsx          the moving-border card
    ThemeToggle.tsx       sun / moon light-dark switch
  assets/photos/          doctor photo and blurred clinic backdrop
  styles/global.css       colour tokens, type, buttons
```

The photos in `src/assets/photos/` were cut from the design mock-up (with its printed text removed),
so they are fairly small. Swap in higher-resolution versions with the same file names for a sharper page.
