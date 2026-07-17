import { test, expect } from '../../fixtures/base-test';
import { MOBILE_VIEWPORT, DESKTOP_VIEWPORT } from '../../utils/viewport';

test.describe('Burger menu', () => {
  test.describe('mobile viewport', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('title bar and burger button are visible', async ({ portfolioPage }) => {
      await expect(portfolioPage.titleBar).toBeVisible();
      await expect(portfolioPage.navToggle).toBeVisible();
    });

    test('desktop nav is hidden', async ({ portfolioPage }) => {
      await expect(portfolioPage.desktopNav).toBeHidden();
    });

    test('clicking burger opens the nav panel', async ({ portfolioPage }) => {
      await portfolioPage.openMobileMenu();

      expect(await portfolioPage.isMobileMenuOpen()).toBe(true);
      await expect(portfolioPage.navPanel).toBeVisible();
    });

    test('all nav links are present in the panel', async ({ portfolioPage }) => {
      await portfolioPage.openMobileMenu();

      const links = ['#banner', '#skills', '#experience', '#projects', '#contact'];
      for (const href of links) {
        await expect(
          portfolioPage.navPanel.locator(`a[href="${href}"]`)
        ).toBeVisible();
      }
    });

    test('pressing Escape closes the nav panel', async ({ portfolioPage }) => {
      await portfolioPage.openMobileMenu();
      await portfolioPage.closeMobileMenuViaEscape();

      expect(await portfolioPage.isMobileMenuOpen()).toBe(false);
    });

    test('clicking the burger again toggles the panel closed', async ({ portfolioPage }) => {
      await portfolioPage.openMobileMenu();
      await portfolioPage.openMobileMenu();

      expect(await portfolioPage.isMobileMenuOpen()).toBe(false);
    });

    test('clicking a nav link closes the panel and scrolls to section', async ({ portfolioPage }) => {
      await portfolioPage.openMobileMenu();
      await portfolioPage.closeMobileMenuViaNavLink('#skills');

      expect(await portfolioPage.isMobileMenuOpen()).toBe(false);
    });
  });

  test.describe('desktop viewport', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('title bar and burger button are hidden', async ({ portfolioPage }) => {
      await expect(portfolioPage.titleBar).toBeHidden();
      await expect(portfolioPage.navToggle).toBeHidden();
    });

    test('desktop nav is visible', async ({ portfolioPage }) => {
      await expect(portfolioPage.desktopNav).toBeVisible();
    });
  });
});
