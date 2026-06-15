"use strict";
let skills = [];
let experiences = [];
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
function renderSkills() {
    const container = document.getElementById("skills-list");
    if (!container)
        return;
    container.innerHTML = skills.map(skill => {
        return `
      <article class="skill-card">
        <h5>${skill.name}</h5>
        <p>${skill.detail}</p>
        <span class="skill-badge">${skill.category}</span>
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
function attachNavPanelHandlers() {
    const toggle = document.querySelector("#titleBar .toggle");
    const navPanel = document.getElementById("navPanel");
    const overlay = document.getElementById("navPanelOverlay");
    const body = document.body;
    if (!toggle || !navPanel || !overlay)
        return;
    const closePanel = () => body.classList.remove("navPanel-visible");
    toggle.addEventListener("click", event => {
        event.preventDefault();
        body.classList.toggle("navPanel-visible");
    });
    navPanel.addEventListener("click", event => {
        const link = event.target.closest("a");
        if (!link)
            return;
        event.preventDefault();
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
            closePanel();
            const section = document.querySelector(href);
            if (section)
                section.scrollIntoView({ behavior: "smooth" });
        }
    });
    overlay.addEventListener("click", closePanel);
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
    renderSkills();
    renderExperience();
    attachFormHandler();
    attachNavPanelHandlers();
    highlightNav();
    window.addEventListener("scroll", highlightNav, { passive: true });
});
