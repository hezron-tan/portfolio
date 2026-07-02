---
title: "Using Cursor for Quality Engineering Workflows"
date: 2026-06-20
tags: [AI, Cursor, Playwright, Automation]
excerpt: "How I use Cursor's agent mode to speed up test automation, portfolio work, and everyday QA tasks."
---
Cursor has become a regular part of my quality engineering workflow. I use it for scaffolding Playwright tests, refactoring and updating app behaviours, and understanding how code was implemented.

The biggest win is treating AI as a pair for repetitive setup — page objects, fixture wiring, build scripts — while I stay focused on how the system should behave and the edge cases that matter. On the mini projects and exercises in my GitHub repo, I'm practicing in a loop that feels close to test-driven development: explore the application under test manually, spot gaps, fix them, and grow the Playwright suite in parallel so the next pass catches what I just learned.

Agent mode works best when I give clear constraints: file paths, conventions already in the project, and what "done" looks like.

Compared to inline completions alone, Cursor helps when changes span multiple files (for example, adding a blog post, updating the build step, and adjusting the card renderer). I still review every diff, run Playwright locally, and keep commits small. For QA work, that review step is non-negotiable — the tool accelerates delivery, but judgment stays human.
