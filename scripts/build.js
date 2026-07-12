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
  { src: path.resolve(__dirname, "..", "CNAME"), dest: path.join(distDir, "CNAME") },
  { src: path.resolve(__dirname, "..", "assets", "css", "styles.css"), dest: path.join(cssDir, "styles.css") },
  { src: path.resolve(__dirname, "..", "assets", "data", "portfolio-data.json"), dest: path.join(dataDir, "portfolio-data.json") },
  { src: path.resolve(__dirname, "..", "assets", "data", "projects.json"), dest: path.join(dataDir, "projects.json") },
];

const sourceJsDir = path.resolve(__dirname, "..", "assets", "js");
fs.mkdirSync(distDir, { recursive: true });
filesToCopy.forEach(({ src, dest }) => copyFile(src, dest));

fs.readdirSync(sourceJsDir)
  .filter((name) => name.endsWith(".js"))
  .forEach((name) => {
    copyFile(path.join(sourceJsDir, name), path.join(jsDir, name));
  });

const faviconDir = path.resolve(__dirname, "..", "assets", "favicon");
const distFaviconDir = path.join(assetDir, "favicon");
fs.mkdirSync(distFaviconDir, { recursive: true });
fs.readdirSync(faviconDir).forEach((name) => {
  copyFile(path.join(faviconDir, name), path.join(distFaviconDir, name));
});

console.log("Build complete. Dist folder is ready.");
