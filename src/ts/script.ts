declare const marked: { parse: (md: string) => string | Promise<string> };

interface Skill {
  name: string;
  category: string[];
  detail: string;
}

interface Experience {
  role: string;
  company: string;
  period: string;
  highlights: string[];
}

interface ProjectPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  body: string;
}

interface PortfolioData {
  skills: Skill[];
  experiences: Experience[];
}

let skills: Skill[] = [];
let experiences: Experience[] = [];
let projects: ProjectPost[] = [];

async function loadPortfolioData(): Promise<PortfolioData> {
  try {
    const response = await fetch("assets/data/portfolio-data.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio data: ${response.status}`);
    }
    const data = await response.json();
    return {
      skills: Array.isArray(data.skills) ? data.skills : [],
      experiences: Array.isArray(data.experiences) ? data.experiences : [],
    };
  } catch (error) {
    console.error("Failed to load portfolio data:", error);
    return { skills: [], experiences: [] };
  }
}

async function loadProjectData(): Promise<ProjectPost[]> {
  try {
    const response = await fetch("assets/data/projects.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch project JSON: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to load project data:", error);
    return [];
  }
}

function renderSkills(): void {
  const container = document.getElementById("skills-list");
  if (!container) return;

  container.innerHTML = skills.map(skill => {
    const categories = skill.category;
    return `
      <article class="skill-card">
        <h5>${skill.name}</h5>
        <p>${skill.detail}</p>
        <div class="skill-badges">
          ${categories.map(cat => `<span class="skill-badge">${cat}</span>`).join("")}
        </div>
      </article>
    `;
  }).join("");
}

function renderExperience(): void {
  const container = document.getElementById("experience-list");
  if (!container) return;

  container.innerHTML = experiences.map(exp => {
    return `
      <article class="experience-card">
        <h5>${exp.role}</h5>
        <div class="experience-meta">${exp.company} · ${exp.period}</div>
        <ul class="experience-highlights">
          ${exp.highlights.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `;
  }).join("");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function renderProjectCard(project: ProjectPost): string {
  return `
      <article class="project-card">
        <h5>${project.title}</h5>
        <p class="project-meta">${formatDate(project.date)}</p>
        <p>${project.excerpt}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join("")}
        </div>
        <a href="#projects/${project.slug}" data-slug="${project.slug}" class="project-readmore">Read more</a>
      </article>
    `;
}

function renderProjects(projects: ProjectPost[], currentPage: number, pageSize: number): void {
  const container = document.getElementById("projects-list");
  const pagination = document.getElementById("project-pagination");
  if (!container || !pagination) return;

  const start = (currentPage - 1) * pageSize;
  const pageItems = projects.slice(start, start + pageSize);

  container.innerHTML = pageItems.map(renderProjectCard).join("");
  pagination.innerHTML = "";

  const pageCount = Math.ceil(projects.length / pageSize);
  for (let page = 1; page <= pageCount; page++) {
    const button = document.createElement("button");
    button.textContent = page.toString();
    button.className = page === currentPage ? "active" : "";
    button.addEventListener("click", () => renderProjects(projects, page, pageSize));
    pagination.appendChild(button);
  }
}

function showProjectDetail(project: ProjectPost): void {
  const detailEl = document.getElementById("project-detail");
  const detailTitle = document.getElementById("detail-title");
  const detailDate = document.getElementById("detail-date");
  const detailTags = document.getElementById("detail-tags");
  const detailBody = document.getElementById("detail-body");

  if (!detailEl || !detailTitle || !detailDate || !detailTags || !detailBody) return;

  detailTitle.textContent = project.title;
  detailDate.textContent = formatDate(project.date);
  detailTags.innerHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join("");
  detailBody.innerHTML = marked.parse(project.body) as string;

  detailEl.classList.add("is-visible");
  detailEl.scrollTop = 0;
}

function hideProjectDetail(): void {
  const detailEl = document.getElementById("project-detail");
  if (!detailEl) return;
  detailEl.classList.remove("is-visible");
}

function handleHashChange(): void {
  const hash = window.location.hash;
  const prefix = "#projects/";
  if (hash.startsWith(prefix)) {
    const slug = hash.slice(prefix.length);
    const project = projects.find(p => p.slug === slug);
    if (project) {
      showProjectDetail(project);
      return;
    }
  }
  hideProjectDetail();
}

function highlightNav(): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".navbar-nav .nav-link"));

  const currentSection = sections.find(section => {
    const rect = section.getBoundingClientRect();
    return rect.top <= window.innerHeight * 0.3 && rect.bottom > window.innerHeight * 0.3;
  });

  links.forEach(link => {
    const target = document.querySelector(link.hash) as HTMLElement | null;
    if (target === currentSection) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function attachFormHandler(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const status = document.getElementById("contact-status");
  if (!form || !status) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();

    if (name && email) {
      status.textContent = `Thanks, ${name}! Your message is ready to review.`;
      status.classList.remove("d-none");
      form.reset();
    }
  });
}

function attachNavPanelHandlers(): void {
  const toggle = document.getElementById("nav-toggle") as HTMLButtonElement | null;
  const navPanel = document.getElementById("navPanel");
  const overlay = document.getElementById("navPanelOverlay");
  const body = document.body;
  if (!toggle || !navPanel || !overlay) return;

  const closePanel = () => body.classList.remove("navPanel-visible");
  const toggleHandler = () => {
    body.classList.toggle("navPanel-visible");
  };

  toggle.addEventListener("click", toggleHandler);

  navPanel.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a") as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute("href");
    if (href && href.startsWith("#")) {
      event.preventDefault();
      closePanel();
      hideProjectDetail();
      const section = document.querySelector(href) as HTMLElement | null;
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
  });

  overlay.addEventListener("click", closePanel);

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") closePanel();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const portfolioData = await loadPortfolioData();
  skills = portfolioData.skills;
  experiences = portfolioData.experiences;
  renderSkills();
  renderExperience();
  projects = await loadProjectData();
  renderProjects(projects, 1, 3);
  attachFormHandler();
  attachNavPanelHandlers();
  highlightNav();
  window.addEventListener("scroll", highlightNav, { passive: true });
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
  window.requestAnimationFrame(() => {
    document.body.classList.remove("is-preload");
  });
});
