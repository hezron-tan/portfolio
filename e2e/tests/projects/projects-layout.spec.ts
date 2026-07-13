import { test, expect } from '../../fixtures/base-test';
import { DESKTOP_VIEWPORT, MOBILE_VIEWPORT } from '../../utils/viewport';
import { loadProjects } from '../../utils/portfolio-data';

const projects = loadProjects();
const DESKTOP_PAGE_SIZE = 3;
const desktopPageCount = Math.ceil(projects.length / DESKTOP_PAGE_SIZE);

test.describe('Projects layout', () => {
  test.describe('desktop viewport', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('shows numbered pagination with a page of project cards', async ({ portfolioPage }) => {
      await portfolioPage.scrollToProjects();

      await expect(portfolioPage.projectsList).not.toHaveClass(/projects-carousel-track/);
      await expect(portfolioPage.projectsCarouselControls).toBeHidden();
      await expect(portfolioPage.projectPagination).toBeVisible();
      await expect(portfolioPage.projectPagination.getByRole('button')).toHaveCount(desktopPageCount);
      await expect(portfolioPage.projectCards).toHaveCount(
        Math.min(DESKTOP_PAGE_SIZE, projects.length)
      );
    });

    test('pagination page change updates visible cards and keeps section in view', async ({
      portfolioPage,
    }) => {
      test.skip(desktopPageCount < 2, 'Needs at least two project pages');

      await portfolioPage.scrollToProjects();
      const firstTitle = await portfolioPage.projectCards.first().locator('h5').innerText();

      await portfolioPage.goToProjectsPage(2);

      await expect(portfolioPage.projectsSection).toBeInViewport();
      await expect(
        portfolioPage.projectPagination.getByRole('button', { name: 'Projects page 2' })
      ).toHaveAttribute('aria-current', 'page');
      await expect(portfolioPage.projectCards.first().locator('h5')).not.toHaveText(firstTitle);
    });
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('uses a scroll-snap carousel instead of numbered pagination', async ({ portfolioPage }) => {
      await portfolioPage.scrollToProjects();

      await expect(portfolioPage.projectsList).toHaveClass(/projects-carousel-track/);
      await expect(portfolioPage.projectCards).toHaveCount(projects.length);
      await expect(portfolioPage.projectPagination).toBeHidden();
      await expect(portfolioPage.projectsCarouselControls).toBeVisible();
      await expect(portfolioPage.projectsCarouselStatus).toHaveText(`1 / ${projects.length}`);
      await expect(portfolioPage.projectsCarouselPrev).toBeDisabled();
      await expect(portfolioPage.projectsCarouselNext).toBeEnabled();
    });

    test('next and previous controls move through carousel cards', async ({ portfolioPage }) => {
      test.skip(projects.length < 2, 'Needs at least two projects');

      await portfolioPage.scrollToProjects();
      await portfolioPage.goToNextProjectCard();

      await expect(portfolioPage.projectsCarouselStatus).toHaveText(`2 / ${projects.length}`);
      await expect(portfolioPage.projectsCarouselPrev).toBeEnabled();

      await portfolioPage.goToPreviousProjectCard();

      await expect(portfolioPage.projectsCarouselStatus).toHaveText(`1 / ${projects.length}`);
      await expect(portfolioPage.projectsCarouselPrev).toBeDisabled();
    });
  });
});
