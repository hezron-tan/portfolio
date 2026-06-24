const fs = require("fs");
const path = require("path");

const postsDir = path.resolve(__dirname, "..", "_posts");
const dataDir = path.resolve(__dirname, "..", "assets", "data");
const reposFile = path.join(dataDir, "github-repos.json");
const outputFile = path.join(dataDir, "projects.json");

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

function loadPosts() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter(name => name.endsWith(".md"));

  return files.map(filename => {
    const content = fs.readFileSync(path.join(postsDir, filename), "utf8");
    const { frontmatter, body } = parseFrontmatter(content);
    const slug = filename.replace(/\.md$/, "");

    if (!frontmatter || !frontmatter.title || !frontmatter.date || !frontmatter.excerpt) {
      throw new Error(`Missing required frontmatter in ${filename}`);
    }

    return {
      type: "post",
      slug,
      title: frontmatter.title,
      date: frontmatter.date,
      excerpt: frontmatter.excerpt,
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      body,
    };
  });
}

function loadRepos() {
  if (!fs.existsSync(reposFile)) {
    console.warn(`GitHub repos file not found: ${reposFile}`);
    return [];
  }

  const repos = JSON.parse(fs.readFileSync(reposFile, "utf8"));
  if (!Array.isArray(repos)) {
    throw new Error("github-repos.json must contain an array");
  }

  return repos.map(repo => {
    if (!repo.id || !repo.title || !repo.date || !repo.excerpt || !repo.url) {
      throw new Error(`Missing required fields in github-repos.json entry: ${repo.id || repo.title || "unknown"}`);
    }

    return {
      type: "repo",
      id: repo.id,
      title: repo.title,
      date: repo.date,
      excerpt: repo.excerpt,
      url: repo.url,
      language: repo.language || "",
      tags: Array.isArray(repo.tags) ? repo.tags : [],
    };
  });
}

function buildProjects() {
  const projects = [...loadPosts(), ...loadRepos()].sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2), "utf8");
  console.log(`Generated ${projects.length} project items to ${outputFile}`);
}

buildProjects();
