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

interface ProjectBase {
  type: "post" | "repo";
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

interface BlogPost extends ProjectBase {
  type: "post";
  slug: string;
  body: string;
}

interface GitHubRepo extends ProjectBase {
  type: "repo";
  id: string;
  url: string;
  language: string;
}

type ProjectItem = BlogPost | GitHubRepo;

interface PortfolioData {
  skills: Skill[];
  experiences: Experience[];
}

let skills: Skill[] = [];
let experiences: Experience[] = [];
let projects: ProjectItem[] = [];

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

async function loadProjectData(): Promise<ProjectItem[]> {
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

function renderProjectCard(project: ProjectItem): string {
  const typeLabel = project.type === "post" ? "Blog" : "GitHub";
  const meta = project.type === "post"
    ? formatDate(project.date)
    : project.language
      ? `${project.language} · GitHub`
      : "GitHub";

  const action = project.type === "post"
    ? `<button type="button" data-slug="${project.slug}" class="project-readmore">Read more</button>`
    : `<a href="${project.url}" class="project-readmore" target="_blank" rel="noopener noreferrer">View on GitHub</a>`;

  return `
      <article class="project-card" data-type="${project.type}">
        <div class="project-card-header">
          <span class="project-type">${typeLabel}</span>
          <p class="project-meta">${meta}</p>
        </div>
        <h5>${project.title}</h5>
        <p>${project.excerpt}</p>
        <div class="project-tags">
          ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join("")}
        </div>
        ${action}
      </article>
    `;
}

function renderProjects(projects: ProjectItem[], currentPage: number, pageSize: number): void {
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

  attachProjectReadMoreHandlers();
}

function openProjectModal(post: BlogPost): void {
  const dialog = document.getElementById("project-modal") as HTMLDialogElement | null;
  const title = document.getElementById("project-modal-title");
  const meta = document.getElementById("project-modal-meta");
  const body = document.getElementById("project-modal-body");
  if (!dialog || !title || !meta || !body) return;

  title.textContent = post.title;
  meta.textContent = formatDate(post.date);
  body.innerHTML = marked.parse(post.body) as string;
  if (!dialog.open) dialog.showModal();
}

function closeProjectModal(): void {
  const dialog = document.getElementById("project-modal") as HTMLDialogElement | null;
  if (dialog?.open) dialog.close();
}

function attachProjectReadMoreHandlers(): void {
  const container = document.getElementById("projects-list");
  if (!container) return;

  container.querySelectorAll<HTMLButtonElement>(".project-readmore[data-slug]").forEach(button => {
    button.addEventListener("click", () => {
      const slug = button.dataset.slug;
      const post = projects.find(item => item.type === "post" && item.slug === slug) as BlogPost | undefined;
      if (post) {
        window.location.hash = `#projects/${post.slug}`;
        openProjectModal(post);
      }
    });
  });
}

function attachProjectModalHandlers(): void {
  const dialog = document.getElementById("project-modal") as HTMLDialogElement | null;
  const closeButton = document.getElementById("project-modal-close");
  if (!dialog || !closeButton) return;

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (window.location.hash.startsWith("#projects/")) {
      history.pushState(null, "", "#projects");
    }
  });
  dialog.addEventListener("click", (event: MouseEvent) => {
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) dialog.close();
  });
}

function findBlogPost(slug: string): BlogPost | undefined {
  return projects.find(item => item.type === "post" && item.slug === slug) as BlogPost | undefined;
}

function handleHashChange(): void {
  const hash = window.location.hash;
  const prefix = "#projects/";
  if (!hash.startsWith(prefix)) {
    closeProjectModal();
    return;
  }

  const slug = hash.slice(prefix.length);
  const post = findBlogPost(slug);
  if (post) {
    openProjectModal(post);
    return;
  }

  void loadProjectData().then(items => {
    projects = items;
    const loaded = findBlogPost(slug);
    if (loaded) {
      openProjectModal(loaded);
    } else {
      closeProjectModal();
    }
  });
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
      closeProjectModal();
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
  attachProjectModalHandlers();
  attachFormHandler();
  attachNavPanelHandlers();
  highlightNav();
  window.addEventListener("scroll", highlightNav, { passive: true });
  window.addEventListener("hashchange", handleHashChange);
  window.addEventListener("popstate", handleHashChange);
  window.addEventListener("pageshow", (event: PageTransitionEvent) => {
    if (event.persisted) handleHashChange();
  });
  handleHashChange();
  window.requestAnimationFrame(() => {
    document.body.classList.remove("is-preload");
  });
});
