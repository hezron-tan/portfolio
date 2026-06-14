"use strict";
const skills = [
    { name: "Test automation", category: "Automation", detail: "Selenium, Playwright, Cypress, API validation" },
    { name: "CI/CD quality gates", category: "DevOps", detail: "GitHub Actions, Azure Pipelines, automated checks" },
    { name: "Test design", category: "Strategy", detail: "Exploratory testing, boundary analysis, risk-based planning" },
    { name: "Performance validation", category: "Performance", detail: "Load profiling, benchmark stability, responsive coverage" },
    { name: "Bug analysis", category: "Investigation", detail: "Root cause analysis, regression triage, issue prevention" },
];
const experiences = [
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
document.addEventListener("DOMContentLoaded", () => {
    renderSkills();
    renderExperience();
    attachFormHandler();
    attachNavPanelHandlers();
    highlightNav();
    window.addEventListener("scroll", highlightNav, { passive: true });
});
