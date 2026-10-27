# Bay Area Side Hustle

A personal playbook with action checklists, weekly progress and Markdown export.
Progress stays in this browser; it does not sync to an account.

Use Node.js 22.18+ and Python 3 for the browser test server:

```sh
npm ci
npm run build
npm run preview
```

Deploy `dist/`. The production build bundles React and Inter fonts, compiles
Tailwind and JSX ahead of time, and makes no runtime CDN requests. Browser zoom
remains available. Edit the canonical `index.html` and rebuild to update the app.

Run `npx playwright install chromium` once, then `npm test` for desktop/mobile
checks covering offline rendering, saved progress, export, corrupt data and
blocked storage. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select an installed
Chromium executable. GitHub Actions builds and runs this suite on each push/PR.

This playbook provides planning guidance. It does not perform outreach, collect
payments, validate revenue claims or guarantee business outcomes.
