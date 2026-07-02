---
title: "Building a Dental Clinic Test Site with Cursor AI — Web App First, Playwright MCP Tests After"
date: 2026-06-28
tags: [AI, Cursor, Playwright, Supabase, MCP, Allure]
excerpt: "How I used Cursor's AI to build a Supabase-backed clinic practice site step by step, then automate it with Playwright MCP — with daily Allure reports."
---
I wanted a realistic target for UI, API, and load testing practice — not a toy demo, but something that felt like a small product. That became the [Dental Clinic Test Site](https://hezron-tan.github.io/dental-clinic-test-site/): a public clinic homepage, staff login, and separate admin and staff portals with role-based access. I built it with **Cursor IDE and its AI assistant**, and later used the same workflow to grow the **Playwright** test suite — including automation through **Playwright MCP**.

### Building the site first

Before writing a single test, I focused on getting the application in place.

The frontend is a static site based on the **HTML5 UP Arcana** template, hosted on **GitHub Pages**. The backend runs on **Supabase** (PostgreSQL, Auth, and the auto-generated REST API). That split was deliberate: GitHub Pages serves HTML, CSS, and JavaScript only, while all data and authentication flow through Supabase's client SDK.

The app includes:

- A **public site** with clinic name, address, contact info, and hours
- **Staff login** with role-based routing (`admin` vs `staff`)
- An **admin** area to edit clinic info, manage patients, and see a storage usage warning
- A **staff** area to view and edit patients and visit history

Under the hood that's **HTML**, **CSS/SCSS**, **TypeScript**, and **JavaScript** on the frontend, with **SQL** for the Supabase schema and seed data. **GitHub Actions** handles deployment to Pages and runs the test pipeline on push and PR.

### Learning step by step — not in one shot

The most important choice I made was *how* I used AI.

Instead of asking Cursor to "build the whole clinic site," I asked it to **guide me through the process one step at a time** — set up Supabase, run the schema, wire config, add the login flow, then the admin dashboard, and so on. I'd implement or review each piece, run it locally, and only then move to the next step.

That kept me in the loop. I wasn't just accepting a large diff I didn't understand; I was learning Supabase Auth, row-level security, and how a static frontend talks to a REST API — with AI as a patient tutor rather than a black-box code generator.

Honestly, **the learning curve doesn't feel as steep anymore**. Technologies I would have put off because of setup overhead — Supabase, GitHub Actions, multi-page role routing — became approachable when I could ask "what's the next step?" and get context-aware answers inside the repo.

### Tests with Playwright MCP

Once the app was usable, I shifted to test automation — again with Cursor, this time leaning on **Playwright MCP** so the agent could interact with the browser, inspect the DOM, and help scaffold tests from real page structure rather than guesses.

The suite covers:

- **UI tests** — public homepage, login and role redirects, staff patient workflows, admin clinic and patient management
- **API tests** — Supabase REST auth, public clinic endpoints, and patient RLS behaviour
- **K6** — a starter load script against the Supabase API *(still a work in progress — I'm actively learning K6 and haven't treated performance testing as "done" yet)*

Key flows use `data-testid` attributes so tests stay stable. CI runs Playwright automatically; credentials come from environment secrets so auth-dependent tests skip cleanly until configured.

### Allure reports — daily

Test results are published as **Allure** reports in a separate repo: [dental-clinic-test-reports](https://hezron-tan.github.io/dental-clinic-test-reports/). A **daily** run posts the latest report there, so I can track trends over time instead of only looking at the last CI pass/fail in GitHub Actions.

### Still ongoing

This is very much a **work in progress** — both the **web app** and the **test automation**.

On the app side, there's room to harden edge cases, expand staff/admin flows, and keep the Supabase setup documented for anyone cloning the repo. On the testing side, Playwright UI and API coverage is the main focus today; **K6 is the area I'm still learning** — there's a basic script in the repo, but I haven't finished shaping realistic scenarios, thresholds, or how I want load results to inform the rest of the suite. That's intentional: it's a practice lab, not a finished product.

If you're a QA engineer looking for a sandbox that spans static hosting, a real backend, UI + API automation, and AI-assisted development, this project is built for that. And if you're new to a stack, I'd recommend the same approach I used — **small steps with AI as a guide**, not a one-shot builder.
