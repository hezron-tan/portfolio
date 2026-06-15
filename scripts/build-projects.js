const fs = require("fs");
const path = require("path");

const postsDir = path.resolve(__dirname, "..", "_posts");
const outputDir = path.resolve(__dirname, "..", "assets", "data");
const outputFile = path.join(outputDir, "projects.json");

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { frontmatter: null, body: content };

  const raw = match[1];
  const body = content.slice(match[0].length);
  const frontmatter = {};

  raw.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const colon = trimmed.indexOf(":");
    if (colon === -1) return;

    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      value = value.slice(1, -1).split(",").map(item => item.trim().replace(/^['\"]|['\"]$/g, "")).filter(Boolean);
    } else {
      value = value.replace(/^['\"]|['\"]$/g, "");
    }

    frontmatter[key] = value;
  });

  return { frontmatter, body: body.trim() };
}

function buildProjects() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(name => name.endsWith(".md"));
  const projects = files.map(filename => {
    const content = fs.readFileSync(path.join(postsDir, filename), "utf8");
    const { frontmatter, body } = parseFrontmatter(content);
    const slug = filename.replace(/\.md$/, "");

    if (!frontmatter || !frontmatter.title || !frontmatter.date || !frontmatter.excerpt) {
      throw new Error(`Missing required frontmatter in ${filename}`);
    }

    return {
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      excerpt: frontmatter.excerpt,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      body,
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2), "utf8");
  console.log(`Generated ${projects.length} project posts to ${outputFile}`);
}

buildProjects();
