# Apartment Hunt

Personal apartment comparison tool. React + Vite + Tailwind, data lives in your browser's localStorage (no backend).

```
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

## Deploy to GitHub Pages
1. Push this folder to a GitHub repo (branch `main`).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and publishes on every push.

Data is stored per browser/device — use **Export Data** / **Import Data** to back up or move it.
