# QA Portfolio Website

A portfolio website designed for a Software Quality Engineer using HTML, Bootstrap, and TypeScript. The design uses a dark theme inspired by Visual Studio Code.

## Files

- `index.html` — main landing page
- `assets/css/styles.css` — custom VS Code-inspired dark theme styling
- `src/ts/script.ts` — TypeScript logic for rendering skills, experience, and contact interactions
- `assets/js/script.js` — compiled JavaScript output for the page
- `package.json` — build scripts and development dependency
- `tsconfig.json` — TypeScript compiler configuration

## Run locally

1. Open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Start development (rebuilds `_posts` and TypeScript on change):

```bash
npm run dev
```

4. In another terminal, serve the site:

```bash
npx serve . -l 3000
```

5. Open `http://localhost:3000` in your browser.

For a production build (includes `dist/`):

```bash
npm run build
```

Open `dist/index.html` or deploy the `dist/` folder to static hosting.

## Project posts

- Add markdown files under `_posts/` using Jekyll-style frontmatter (`title`, `date`, `tags`, `excerpt`).
- During development, `npm run dev` watches `_posts/` and regenerates `assets/data/projects.json` automatically.
- `assets/data/projects.json` is generated locally and in CI; it is not committed to git.
- Pushes to `main`/`master` run the GitHub Pages deploy workflow, which builds from `_posts/` before publishing.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch `_posts/` and TypeScript; rebuild on save |
| `npm run build:posts` | Regenerate `projects.json` from `_posts/` |
| `npm run build:ts` | Compile TypeScript to `assets/js/` |
| `npm run build:dist` | Copy static assets into `dist/` |
| `npm run build` | Run all build steps |
| `npm run test:install` | Download Playwright browsers (run once after clone) |
| `npm run test` | Run Playwright end-to-end tests |

## Notes

- The page is ready for GitHub Pages or any static hosting.
- Enable GitHub Pages with the **GitHub Actions** source in repository settings after the deploy workflow is on your default branch.
