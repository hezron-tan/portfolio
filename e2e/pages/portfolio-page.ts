import { Page, Locator } from '@playwright/test';

export class PortfolioPage {
  readonly page: Page;

  // Navigation
  readonly titleBar: Locator;
  readonly navToggle: Locator;
  readonly desktopNav: Locator;

  // Mobile panel
  readonly navPanel: Locator;
  readonly navPanelOverlay: Locator;

  // Sections
  readonly banner: Locator;
  readonly skillsSection: Locator;
  readonly experienceSection: Locator;
  readonly experienceTimeline: Locator;
  readonly timelineMilestones: Locator;
  readonly timelineRail: Locator;
  readonly timelineDots: Locator;
  readonly viewFullHistoryBtn: Locator;
  readonly experienceModal: Locator;
  readonly experienceModalBody: Locator;
  readonly experienceModalCloseBtn: Locator;
  readonly projectsSection: Locator;
  readonly projectsList: Locator;
  readonly projectCards: Locator;
  readonly projectPagination: Locator;
  readonly projectsCarouselControls: Locator;
  readonly projectsCarouselStatus: Locator;
  readonly projectsCarouselPrev: Locator;
  readonly projectsCarouselNext: Locator;
  readonly contactSection: Locator;

  // Blog post modal
  readonly projectModal: Locator;
  readonly projectModalTitle: Locator;
  readonly projectModalMeta: Locator;
  readonly projectModalBody: Locator;
  readonly projectModalClose: Locator;

  constructor(page: Page) {
    this.page = page;

    this.titleBar = page.locator('#titleBar');
    this.navToggle = page.locator('#nav-toggle');
    this.desktopNav = page.locator('#nav');
    this.navPanel = page.locator('#navPanel');
    this.navPanelOverlay = page.locator('#navPanelOverlay');

    this.banner = page.locator('#banner');
    this.skillsSection = page.locator('#skills');
    this.experienceSection = page.locator('#experience');
    this.experienceTimeline = page.locator('#experience-timeline');
    this.timelineMilestones = page.locator('#experience-timeline .timeline-milestone');
    this.timelineRail = page.locator('#experience-timeline .timeline-rail');
    this.timelineDots = page.locator('#experience-timeline .timeline-dot');
    this.viewFullHistoryBtn = page.locator('#experience-view-full');
    this.experienceModal = page.locator('#experience-modal');
    this.experienceModalBody = page.locator('#experience-modal-body');
    this.experienceModalCloseBtn = page.locator('#experience-modal-close');
    this.projectsSection = page.locator('#projects');
    this.projectsList = page.locator('#projects-list');
    this.projectCards = page.locator('#projects-list .project-card');
    this.projectPagination = page.locator('#project-pagination');
    this.projectsCarouselControls = page.locator('#projects-carousel-controls');
    this.projectsCarouselStatus = page.locator('#projects-carousel-status');
    this.projectsCarouselPrev = page.locator('#projects-prev');
    this.projectsCarouselNext = page.locator('#projects-next');
    this.contactSection = page.locator('#contact');

    this.projectModal = page.locator('#project-modal');
    this.projectModalTitle = page.locator('#project-modal-title');
    this.projectModalMeta = page.locator('#project-modal-meta');
    this.projectModalBody = page.locator('#project-modal-body');
    this.projectModalClose = page.locator('#project-modal-close');
  }

  /**
   * Navigates to the portfolio home and waits until the intro loader
   * (if present) has been dismissed so the page is interactive.
   */
  async goto() {
    await this.page.goto('/');
    const portfolioMarker = this.page.locator('#experience-timeline, #nav-toggle').first();
    try {
      await portfolioMarker.waitFor({ state: 'attached', timeout: 10_000 });
    } catch {
      throw new Error(
        `Portfolio page did not load at ${this.page.url()}. ` +
          'Another app may be bound to the Playwright test port — stop it or set PLAYWRIGHT_TEST_PORT.'
      );
    }
    const loader = this.page.locator('#site-loader');
    if (await loader.count()) {
      await loader.waitFor({ state: 'detached', timeout: 15_000 });
    }
    await this.page.locator('body').evaluate((body) => {
      body.classList.remove('is-loading', 'loader-exiting');
    });
  }

  async openMobileMenu() {
    await this.navToggle.click();
  }

  async closeMobileMenuViaEscape() {
    await this.page.keyboard.press('Escape');
  }

  async closeMobileMenuViaNavLink(href: string) {
    await this.navPanel.locator(`a[href="${href}"]`).click();
  }

  async isMobileMenuOpen(): Promise<boolean> {
    return this.page.evaluate(() =>
      document.body.classList.contains('navPanel-visible')
    );
  }

  async gotoProjectDetail(slug: string): Promise<void> {
    await this.page.goto('/');
    await this.page.goto(`/#projects/${slug}`);
  }

  async openFirstBlogPost(): Promise<void> {
    await this.projectsSection.scrollIntoViewIfNeeded();
    await this.projectsSection.getByRole('button', { name: 'Read more' }).first().click();
  }

  /**
   * Scrolls the Projects section into view for layout assertions.
   */
  async scrollToProjects(): Promise<void> {
    await this.projectsSection.scrollIntoViewIfNeeded();
  }

  /**
   * Clicks a numbered desktop pagination button for the Projects section.
   * @param pageNumber - 1-based page index shown on the button label
   */
  async goToProjectsPage(pageNumber: number): Promise<void> {
    await this.projectPagination
      .getByRole('button', { name: `Projects page ${pageNumber}` })
      .click();
  }

  /**
   * Advances the mobile projects carousel to the next card.
   */
  async goToNextProjectCard(): Promise<void> {
    await this.projectsCarouselNext.click();
  }

  /**
   * Moves the mobile projects carousel to the previous card.
   */
  async goToPreviousProjectCard(): Promise<void> {
    await this.projectsCarouselPrev.click();
  }

  async closeProjectModal(): Promise<void> {
    await this.projectModalClose.click();
  }

  async scrollToExperienceViaDesktopNav(): Promise<void> {
    await this.desktopNav.locator('a[href="#experience"]').click();
  }

  async scrollToExperienceViaMobileNav(): Promise<void> {
    await this.openMobileMenu();
    await this.closeMobileMenuViaNavLink('#experience');
  }

  async isProjectModalOpen(): Promise<boolean> {
    return this.page.evaluate(() => {
      const dialog = document.getElementById('project-modal') as HTMLDialogElement | null;
      return dialog?.open ?? false;
    });
  }

  async getTimelineRailAlignment(): Promise<{
    firstDotXOffset: number;
    lastDotXOffset: number;
    railReachesLastDot: boolean;
    railStartsAtFirstDot: boolean;
  }> {
    return this.page.evaluate(() => {
      const rail = document.querySelector('.timeline-rail');
      const dots = Array.from(document.querySelectorAll('.timeline-dot'));
      if (!rail || dots.length === 0) {
        throw new Error('Timeline rail or dots not found');
      }

      const railRect = rail.getBoundingClientRect();
      const firstDotRect = dots[0].getBoundingClientRect();
      const lastDotRect = dots[dots.length - 1].getBoundingClientRect();
      const railCenterX = railRect.left + railRect.width / 2;

      return {
        firstDotXOffset: Math.abs(firstDotRect.left + firstDotRect.width / 2 - railCenterX),
        lastDotXOffset: Math.abs(lastDotRect.left + lastDotRect.width / 2 - railCenterX),
        railReachesLastDot: railRect.bottom >= lastDotRect.bottom - 2,
        railStartsAtFirstDot: railRect.top <= firstDotRect.top + firstDotRect.height / 2 + 2,
      };
    });
  }
}
