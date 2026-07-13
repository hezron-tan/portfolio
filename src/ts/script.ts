import { initBannerLightfall } from "./lightfall.js";
import { initSiteLoader } from "./loader.js";

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
  start: string;
  end: string;
  summary: string;
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

function formatExperienceMonth(dateValue: string): string {
  const [year, month] = dateValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

function formatExperienceRange(start: string, end: string): string {
  const startLabel = formatExperienceMonth(start);
  if (end === "present") {
    return `${startLabel} – Present`;
  }
  return `${startLabel} – ${formatExperienceMonth(end)}`;
}

function renderTimelineMilestone(exp: Experience, index: number): string {
  const dateRange = formatExperienceRange(exp.start, exp.end);
  return `
    <article class="timeline-milestone" data-index="${index}">
      <div class="timeline-axis">
        <span class="timeline-dot" aria-hidden="true"></span>
      </div>
      <div class="timeline-body">
        <time class="timeline-date" datetime="${exp.start}/${exp.end}">${dateRange}</time>
        <h5>${exp.role}</h5>
        <p class="timeline-meta">${exp.company}</p>
        <p class="timeline-summary">${exp.summary}</p>
      </div>
    </article>
  `;
}

function renderExperienceRoleDetail(exp: Experience): string {
  return `
    <article class="experience-modal-role">
      <h5>${exp.role}</h5>
      <div class="experience-meta">${exp.company} · ${exp.period}</div>
      <ul class="experience-highlights">
        ${exp.highlights.map(item => `<li>${item}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderExperienceTimeline(): void {
  const container = document.getElementById("experience-timeline");
  if (!container) return;

  container.querySelectorAll(".timeline-milestone").forEach(el => el.remove());
  container.insertAdjacentHTML("beforeend", experiences.map(renderTimelineMilestone).join(""));
}

let timelineRailResizeObserver: ResizeObserver | null = null;

function alignTimelineRail(): void {
  const container = document.getElementById("experience-timeline");
  const rail = container?.querySelector<HTMLElement>(".timeline-rail");
  const milestones = container?.querySelectorAll(".timeline-milestone");
  if (!container || !rail || !milestones?.length) return;

  const firstDot = milestones[0].querySelector(".timeline-dot");
  const lastDot = milestones[milestones.length - 1].querySelector(".timeline-dot");
  if (!firstDot || !lastDot) return;

  const containerRect = container.getBoundingClientRect();
  const firstDotRect = firstDot.getBoundingClientRect();
  const lastDotRect = lastDot.getBoundingClientRect();

  const top = firstDotRect.top + firstDotRect.height / 2 - containerRect.top;
  const bottom = containerRect.bottom - lastDotRect.bottom;

  rail.style.top = `${top}px`;
  rail.style.bottom = `${bottom}px`;
}

function initExperienceTimelineObserver(): void {
  const container = document.getElementById("experience-timeline");
  if (!container) return;

  const milestones = container.querySelectorAll<HTMLElement>(".timeline-milestone");
  if (milestones.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    milestones.forEach(milestone => milestone.classList.add("is-active"));
    alignTimelineRail();
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
          requestAnimationFrame(() => alignTimelineRail());
        }
      });
    },
    { threshold: 0.4, rootMargin: "-10% 0px" }
  );

  milestones.forEach(milestone => observer.observe(milestone));
}

function openExperienceModal(): void {
  const dialog = document.getElementById("experience-modal") as HTMLDialogElement | null;
  const body = document.getElementById("experience-modal-body");
  if (!dialog || !body) return;

  body.innerHTML = experiences.map(renderExperienceRoleDetail).join("");
  if (!dialog.open) dialog.showModal();
}

function attachExperienceModalHandlers(): void {
  const dialog = document.getElementById("experience-modal") as HTMLDialogElement | null;
  const closeButton = document.getElementById("experience-modal-close");
  const viewFullButton = document.getElementById("experience-view-full");
  if (!dialog || !closeButton) return;

  viewFullButton?.addEventListener("click", () => openExperienceModal());
  closeButton.addEventListener("click", () => dialog.close());
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

function renderExperience(): void {
  renderExperienceTimeline();
  alignTimelineRail();
  initExperienceTimelineObserver();
}

function attachExperienceTimelineHandlers(): void {
  window.addEventListener("resize", alignTimelineRail, { passive: true });

  const container = document.getElementById("experience-timeline");
  if (!container) return;

  timelineRailResizeObserver?.disconnect();
  timelineRailResizeObserver = new ResizeObserver(() => alignTimelineRail());
  timelineRailResizeObserver.observe(container);

  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => alignTimelineRail());
  }
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

function prefersSmoothScroll(): boolean {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const PROJECTS_DESKTOP_PAGE_SIZE = 3;
const PROJECTS_MOBILE_MQ = "(max-width: 735px)";

let projectsDesktopPage = 1;
let projectsCarouselTeardown: (() => void) | null = null;

function isProjectsCarouselMode(): boolean {
  return window.matchMedia(PROJECTS_MOBILE_MQ).matches;
}

function updateProjectsCarouselStatus(index: number, total: number): void {
  const status = document.getElementById("projects-carousel-status");
  if (status) status.textContent = `${index + 1} / ${total}`;
}

/**
 * Wires scroll-snap carousel controls and active-slide tracking for mobile.
 * @returns Cleanup that removes listeners and observers.
 */
function initProjectsCarousel(container: HTMLElement, total: number): () => void {
  const cards = Array.from(container.querySelectorAll<HTMLElement>(".project-card"));
  const prevBtn = document.getElementById("projects-prev") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("projects-next") as HTMLButtonElement | null;
  const controls = document.getElementById("projects-carousel-controls");
  if (controls) controls.hidden = false;

  let activeIndex = 0;

  const setActive = (index: number) => {
    activeIndex = Math.max(0, Math.min(total - 1, index));
    updateProjectsCarouselStatus(activeIndex, total);
    if (prevBtn) prevBtn.disabled = activeIndex <= 0;
    if (nextBtn) nextBtn.disabled = activeIndex >= total - 1;
  };

  const scrollToIndex = (index: number) => {
    const card = cards[index];
    if (!card) return;
    const left = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    container.scrollTo({
      left: Math.max(0, left),
      behavior: prefersSmoothScroll() ? "smooth" : "auto",
    });
    setActive(index);
  };

  const observer = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = cards.indexOf(visible.target as HTMLElement);
      if (index >= 0) setActive(index);
    },
    { root: container, threshold: [0.55, 0.75] }
  );
  cards.forEach(card => observer.observe(card));

  const onPrev = () => scrollToIndex(activeIndex - 1);
  const onNext = () => scrollToIndex(activeIndex + 1);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onNext();
    }
  };

  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);
  container.tabIndex = 0;
  container.setAttribute("role", "region");
  container.setAttribute("aria-roledescription", "carousel");
  container.setAttribute("aria-label", "Projects");
  container.addEventListener("keydown", onKeyDown);
  setActive(0);

  return () => {
    observer.disconnect();
    prevBtn?.removeEventListener("click", onPrev);
    nextBtn?.removeEventListener("click", onNext);
    container.removeEventListener("keydown", onKeyDown);
    container.removeAttribute("tabindex");
    container.removeAttribute("role");
    container.removeAttribute("aria-roledescription");
    container.removeAttribute("aria-label");
    if (controls) controls.hidden = true;
  };
}

function renderProjects(allProjects: ProjectItem[], currentPage = projectsDesktopPage): void {
  const container = document.getElementById("projects-list");
  const pagination = document.getElementById("project-pagination");
  if (!container || !pagination) return;

  projectsCarouselTeardown?.();
  projectsCarouselTeardown = null;

  if (isProjectsCarouselMode()) {
    container.classList.add("projects-carousel-track");
    container.innerHTML = allProjects.map(renderProjectCard).join("");
    pagination.hidden = true;
    pagination.innerHTML = "";
    projectsCarouselTeardown = initProjectsCarousel(container, allProjects.length);
  } else {
    container.classList.remove("projects-carousel-track");
    pagination.hidden = false;
    projectsDesktopPage = currentPage;

    const start = (currentPage - 1) * PROJECTS_DESKTOP_PAGE_SIZE;
    const pageItems = allProjects.slice(start, start + PROJECTS_DESKTOP_PAGE_SIZE);
    container.innerHTML = pageItems.map(renderProjectCard).join("");
    pagination.innerHTML = "";

    const pageCount = Math.ceil(allProjects.length / PROJECTS_DESKTOP_PAGE_SIZE);
    for (let page = 1; page <= pageCount; page++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = page.toString();
      button.className = page === currentPage ? "active" : "";
      button.setAttribute("aria-label", `Projects page ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => {
        renderProjects(allProjects, page);
        document.getElementById("projects")?.scrollIntoView({
          behavior: prefersSmoothScroll() ? "smooth" : "auto",
          block: "start",
        });
      });
      pagination.appendChild(button);
    }
  }

  attachProjectReadMoreHandlers();
}

function attachProjectsLayoutWatcher(): void {
  const mq = window.matchMedia(PROJECTS_MOBILE_MQ);
  mq.addEventListener("change", () => {
    if (projects.length) renderProjects(projects, projectsDesktopPage);
  });
}

function renderPostBody(markdown: string): string {
  const html = marked.parse(markdown) as string;
  const template = document.createElement("template");
  template.innerHTML = html;
  template.content.querySelectorAll("a[href]").forEach(anchor => {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  });
  return template.innerHTML;
}

function openProjectModal(post: BlogPost): void {
  const dialog = document.getElementById("project-modal") as HTMLDialogElement | null;
  const title = document.getElementById("project-modal-title");
  const meta = document.getElementById("project-modal-meta");
  const body = document.getElementById("project-modal-body");
  if (!dialog || !title || !meta || !body) return;

  title.textContent = post.title;
  meta.textContent = formatDate(post.date);
  body.innerHTML = renderPostBody(post.body);
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

/**
 * Smooth-scrolls only for in-page section links (nav / CTAs).
 * Leaves native wheel scrolling alone by not setting CSS scroll-behavior.
 */
function attachInPageAnchorHandlers(): void {
  document.addEventListener("click", (event: MouseEvent) => {
    const link = (event.target as HTMLElement | null)?.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#") || href.length < 2 || href.startsWith("#projects/")) {
      return;
    }

    const section = document.querySelector(href) as HTMLElement | null;
    if (!section) return;

    event.preventDefault();
    document.body.classList.remove("navPanel-visible");
    closeProjectModal();
    section.scrollIntoView({ behavior: prefersSmoothScroll() ? "smooth" : "auto" });
    history.pushState(null, "", href);
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
  overlay.addEventListener("click", closePanel);

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") closePanel();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const loaderDone = initSiteLoader();

  const portfolioData = await loadPortfolioData();
  skills = portfolioData.skills;
  experiences = portfolioData.experiences;
  renderSkills();
  renderExperience();
  attachExperienceModalHandlers();
  attachExperienceTimelineHandlers();
  requestAnimationFrame(() => alignTimelineRail());
  projects = await loadProjectData();
  renderProjects(projects, 1);
  attachProjectsLayoutWatcher();
  attachProjectModalHandlers();
  attachFormHandler();
  attachNavPanelHandlers();
  attachInPageAnchorHandlers();
  initBannerLightfall();
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

  await loaderDone;
});
