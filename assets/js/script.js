"use strict";
let skills = [];
let experiences = [];
let projects = [];
async function loadPortfolioData() {
    try {
        const response = await fetch("assets/data/portfolio-data.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch portfolio JSON: ${response.status}`);
        }
        const data = await response.json();
        return {
            skills: Array.isArray(data.skills) ? data.skills : [],
            experiences: Array.isArray(data.experiences) ? data.experiences : []
        };
    }
    catch (error) {
        console.error("Failed to load portfolio data:", error);
        return { skills: [], experiences: [] };
    }
}

async function loadProjectData() {
    try {
        const response = await fetch("assets/data/projects.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch project JSON: ${response.status}`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        console.error("Failed to load project data:", error);
        return [];
    }
}
function renderSkills() {
    const container = document.getElementById("skills-list");
    if (!container)
        return;
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
function renderExperience() {
    const container = document.getElementById("experience-list");
    if (!container)
        return;
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function renderProjectCard(project) {
    return `
      <article class="project-card">
        <h5>${project.title}</h5>
        <p class="project-meta">${formatDate(project.date)}</p>
        <p>${project.excerpt}</p>
        <div class="project-tags">
          ${Array.isArray(project.tags) ? project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join("") : ""}
        </div>
        <a href="#" data-slug="${project.slug}" class="project-readmore">Read more</a>
      </article>
    `;
}

function renderProjects(projects, currentPage, pageSize) {
    const container = document.getElementById("projects-list");
    const pagination = document.getElementById("project-pagination");
    if (!container || !pagination)
        return;

    const start = (currentPage - 1) * pageSize;
    const pageItems = projects.slice(start, start + pageSize);

    container.innerHTML = pageItems.map(renderProjectCard).join("");
    pagination.innerHTML = "";

    const pageCount = Math.max(1, Math.ceil(projects.length / pageSize));
    for (let page = 1; page <= pageCount; page++) {
        const button = document.createElement("button");
        button.textContent = page.toString();
        if (page === currentPage)
            button.className = "active";
        button.addEventListener("click", () => renderProjects(projects, page, pageSize));
        pagination.appendChild(button);
    }
}
function attachNavPanelHandlers() {
    const toggle = document.getElementById("nav-toggle");
    const navPanel = document.getElementById("navPanel");
    const overlay = document.getElementById("navPanelOverlay");
    const body = document.body;
    if (!toggle || !navPanel || !overlay)
        return;
    const closePanel = () => body.classList.remove("navPanel-visible");
    const toggleHandler = () => {
        body.classList.toggle("navPanel-visible");
    };
    toggle.addEventListener("click", toggleHandler);
    navPanel.addEventListener("click", event => {
        const link = event.target.closest("a");
        if (!link)
            return;
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
            event.preventDefault();
            closePanel();
            const section = document.querySelector(href);
            if (section)
                section.scrollIntoView({ behavior: "smooth" });
        }
    });
    overlay.addEventListener("click", closePanel);
    overlay.addEventListener("touchstart", (e) => { e.preventDefault(); closePanel(); }, { passive: false });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape")
            closePanel();
    });
}
function highlightNav() {
    const sections = Array.from(document.querySelectorAll("main section, #main section"));
    const links = Array.from(document.querySelectorAll("#nav .menu a"));
    const currentSection = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.3 && rect.bottom > window.innerHeight * 0.3;
    });
    links.forEach(link => {
        const target = document.querySelector(link.hash);
        if (target === currentSection) {
            link.classList.add("active");
        }
        else {
            link.classList.remove("active");
        }
    });
}
function attachFormHandler() {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    if (!form || !status)
        return;
    form.addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = formData.get("name")?.toString().trim();
        const email = formData.get("email")?.toString().trim();
        if (name && email) {
            status.textContent = `Thanks, ${name}! Your message is ready to review.`;
            status.classList.remove("hidden");
            form.reset();
        }
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    const data = await loadPortfolioData();
    skills = data.skills;
    experiences = data.experiences;
    projects = await loadProjectData();
    renderSkills();
    renderExperience();
    renderProjects(projects, 1, 3);
    attachFormHandler();
    attachNavPanelHandlers();
    highlightNav();
    window.addEventListener("scroll", highlightNav, { passive: true });
});
