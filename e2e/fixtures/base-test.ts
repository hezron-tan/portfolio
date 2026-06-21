import { test as base } from '@playwright/test';
import { PortfolioPage } from '../pages/portfolio-page';

type PortfolioFixtures = {
  portfolioPage: PortfolioPage;
};

export const test = base.extend<PortfolioFixtures>({
  portfolioPage: async ({ page }, use) => {
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await use(portfolioPage);
  },
});

export { expect } from '@playwright/test';
