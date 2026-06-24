# Grow Strong

A private, static, mobile-first fitness planner for a 24-week body recomposition plan. Built with React, TypeScript, Vite, Tailwind, Dexie, Recharts, and PWA support.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

1. Create a new GitHub repo.
2. Push this project to the repo's `main` branch.
3. In GitHub, open **Settings > Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. The included workflow will build and publish the app after every push to `main`.

Because the app uses hash routes like `#/plan`, GitHub Pages does not need any custom redirect setup.

The app stores workout completions, notes, pain ratings, measurements, reflections, and settings locally in IndexedDB. Use Settings to export a JSON backup before clearing browser data or switching devices.
