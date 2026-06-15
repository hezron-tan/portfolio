const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const assetDir = path.join(distDir, "assets");
const cssDir = path.join(assetDir, "css");
const jsDir = path.join(assetDir, "js");
const dataDir = path.join(assetDir, "data");

const copyFile = (source, destination) => {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const filesToCopy = [
  { src: path.resolve(__dirname, "..", "index.html"), dest: path.join(distDir, "index.html") },
  { src: path.resolve(__dirname, "..", "assets", "css", "styles.css"), dest: path.join(cssDir, "styles.css") },
  { src: path.resolve(__dirname, "..", "assets", "data", "portfolio-data.json"), dest: path.join(dataDir, "portfolio-data.json") },
  { src: path.resolve(__dirname, "..", "assets", "data", "projects.json"), dest: path.join(dataDir, "projects.json") },
  { src: path.resolve(__dirname, "..", "assets", "js", "script.js"), dest: path.join(jsDir, "script.js") },
];

fs.mkdirSync(distDir, { recursive: true });
filesToCopy.forEach(({ src, dest }) => copyFile(src, dest));

console.log("Build complete. Dist folder is ready.");
