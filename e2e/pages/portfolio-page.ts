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
  readonly projectsSection: Locator;
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
    this.skillsSection = page.locator('#one');
    this.experienceSection = page.locator('#two');
    this.projectsSection = page.locator('#projects');
    this.contactSection = page.locator('#contact');

    this.projectModal = page.locator('#project-modal');
    this.projectModalTitle = page.locator('#project-modal-title');
    this.projectModalMeta = page.locator('#project-modal-meta');
    this.projectModalBody = page.locator('#project-modal-body');
    this.projectModalClose = page.locator('#project-modal-close');
  }

  async goto() {
    await this.page.goto('/');
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

  async closeProjectModal(): Promise<void> {
    await this.projectModalClose.click();
  }

  async isProjectModalOpen(): Promise<boolean> {
    return this.page.evaluate(() => {
      const dialog = document.getElementById('project-modal') as HTMLDialogElement | null;
      return dialog?.open ?? false;
    });
  }
}
