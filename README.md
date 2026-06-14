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

3. Build the site:

```bash
npm run build
```

4. Open `dist/index.html` in your browser or deploy the `dist/` folder to static hosting.

## Notes

- Use `npm run watch` to continuously compile TypeScript while editing.
- The page is ready for GitHub Pages or any static hosting.
