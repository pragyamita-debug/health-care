# CV → Dashboard (Healthcare)

Candidates upload a CV (PDF, DOCX or TXT) and get an animated portfolio dashboard in a
healthcare style: deep navy and bright cyan, heavy white headlines, glass panels, a doctor
working on a tablet beside a floating "Profile Overview" screen, and a sunrise sign-off
“for a healthier tomorrow”.

Comes in a **light** and a **dark** theme. It follows the visitor's device setting until they press
the sun / moon button in the top bar; their pick is then remembered.

Everything runs in the browser. The CV is read client-side and never sent to a server.

**Live site:** https://pragyamita-debug.github.io/health-care/ (after Pages is switched on — see below)

## How it works

0. **Example first** — the page opens on the full design filled with neutral placeholder text
   (`src/data/placeholder.ts`: “Your Name”, “Your Role”, “Project One”…) and an **Upload CV** button.
1. **Upload** — drag a CV onto the drop zone, or try the bundled sample (`src/data/sample-cv.txt`, a fictional candidate).
2. **Read** — PDF text comes from pdf.js, Word files from mammoth; both load only when needed.
3. **Parse** — `src/lib/parseResume.ts` splits the text into sections (Profile, Experience, Education,
   Skills, Projects, Achievements, Certifications, Goals, Motto…) and works out years of experience
   from the date ranges, counting overlapping jobs once. Healthcare degrees (MHA, MPH, MSN, MBBS, MD,
   PharmD, DNP, BSN…) are recognised.
4. **Review** — the candidate checks what was found and fixes anything before the dashboard is built.
5. **Dashboard** — saved to `localStorage`; the gear menu can upload another CV, edit, download or go back to the example.

## What the dashboard shows

| Section | Built from |
| --- | --- |
| Top bar | rising-bars mark, name, top three skills, section links, light/dark switch, **Upload CV** / **Get in touch** |
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
npm test             # parser tests (vitest)
npm run build        # static build in dist/
npm run build:single # one self-contained index.html in dist-single/
```

## Publish on GitHub Pages

1. **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. **Actions → Deploy to GitHub Pages → Run workflow** (it also runs on every push to `main`).

## Writing a CV that parses well

- Clear headings: **Experience**, **Education**, **Skills**, **Projects**, **Achievements**, **Certifications**.
- Dates on the role line or the line after it: `Jan 2023 – Present`, `03/2021 - 06/2023`, `2019 - 2022`.
- Optional extras: **Goals** (`Goal: …`, `Next Step: …`), **Motto** (shown on the window), **Interests**.
- Text-based PDFs only — scanned images have no text to read.

## Project structure

```
src/
  App.tsx                 example → upload → reading → review → dashboard
  data/placeholder.ts     the general example profile shown before any upload
  data/sample-cv.txt      fictional sample CV
  lib/
    extractText.ts        PDF / DOCX / TXT → text
    parseResume.ts        text → Resume (+ parseResume.test.ts)
    dates.ts              date ranges and overlap-aware experience totals
    storage.ts            safe localStorage wrapper
    theme.ts              read / apply / remember the theme
  hooks/                  useCountUp, useScramble, useInView, usePointerGlow, useScrollSpy
  components/
    UploadScreen.tsx      drop zone + reading progress
    ReviewDialog.tsx      check and fix the parsed fields
    NavBar.tsx, Hero.tsx, Sections.tsx, Dashboard.tsx
    GlowCard.tsx          the moving-border card
    ThemeToggle.tsx       sun / moon light-dark switch
  assets/photos/          doctor photo and blurred clinic backdrop
  styles/global.css       colour tokens, type, buttons
```

The photos in `src/assets/photos/` were cut from the design mock-up (with its printed text removed),
so they are fairly small. Swap in higher-resolution versions with the same file names for a sharper page.
