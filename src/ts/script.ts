interface Skill {
  name: string;
  category: string;
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

const skills: Skill[] = [
  { name: "Test automation", category: "Automation", detail: "Selenium, Playwright, Cypress, API validation" },
  { name: "CI/CD quality gates", category: "DevOps", detail: "GitHub Actions, Azure Pipelines, automated checks" },
  { name: "Test design", category: "Strategy", detail: "Exploratory testing, boundary analysis, risk-based planning" },
  { name: "Performance validation", category: "Performance", detail: "Load profiling, benchmark stability, responsive coverage" },
  { name: "Bug analysis", category: "Investigation", detail: "Root cause analysis, regression triage, issue prevention" },
];

const experiences: Experience[] = [
  {
    role: "Senior QA Engineer",
    company: "Engineering Platform Team",
    period: "2024 – Present",
    highlights: [
      "Built regression pipelines that reduced release defects by 25%.",
      "Integrated automated checks into CI/CD for faster delivery feedback.",
      "Collaborated with developers on resilient end-to-end and API tests."
    ]
  },
  {
    role: "QA Automation Specialist",
    company: "Fintech Delivery",
    period: "2022 – 2024",
    highlights: [
      "Deployed cross-browser automation frameworks for web and service validation.",
      "Improved test coverage through targeted risk-based scenarios.",
      "Reduced manual regression execution time by 40% with smart test suites."
    ]
  },
  {
    role: "Quality Assurance Engineer",
    company: "Product Development Group",
    period: "2020 – 2022",
    highlights: [
      "Defined acceptance criteria and traceable QA workflows for releases.",
      "Led exploratory sessions to uncover edge-case failures before launch.",
      "Mentored teams in quality-first practices and defect prevention."
    ]
  }
];

let projects: ProjectPost[] = [];

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
    const categories = Array.isArray(skill.category) ? skill.category : [skill.category];
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
        <a href="#" data-slug="${project.slug}" class="project-readmore">Read more</a>
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
  renderSkills();
  renderExperience();
  projects = await loadProjectData();
  renderProjects(projects, 1, 3);
  attachFormHandler();
  attachNavPanelHandlers();
  highlightNav();
  window.addEventListener("scroll", highlightNav, { passive: true });
  window.requestAnimationFrame(() => {
    document.body.classList.remove("is-preload");
  });
});
