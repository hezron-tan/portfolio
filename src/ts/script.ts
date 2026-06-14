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

function renderSkills(): void {
  const container = document.getElementById("skills-list");
  if (!container) return;

  container.innerHTML = skills.map(skill => {
    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <article class="skill-card p-4 h-100">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="mb-2">${skill.name}</h5>
            <span class="skill-badge">${skill.category}</span>
          </div>
          <p class="text-secondary mb-0">${skill.detail}</p>
        </article>
      </div>
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

document.addEventListener("DOMContentLoaded", () => {
  renderSkills();
  renderExperience();
  attachFormHandler();
  highlightNav();
  window.addEventListener("scroll", highlightNav, { passive: true });
});
