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

  // Project detail overlay
  readonly detailOverlay: Locator;
  readonly detailTitle: Locator;
  readonly detailDate: Locator;
  readonly detailTags: Locator;
  readonly detailBody: Locator;
  readonly detailBackBtn: Locator;

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

    this.detailOverlay = page.locator('#project-detail');
    this.detailTitle = page.locator('#detail-title');
    this.detailDate = page.locator('#detail-date');
    this.detailTags = page.locator('#detail-tags');
    this.detailBody = page.locator('#detail-body');
    this.detailBackBtn = page.locator('a.detail-back-btn');
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
    await this.page.goto(`/#projects/${slug}`);
  }

  async isDetailVisible(): Promise<boolean> {
    return this.page.evaluate(() =>
      document.getElementById('project-detail')?.classList.contains('is-visible') ?? false
    );
  }
}
