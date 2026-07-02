import { test, expect } from '../../fixtures/base-test';
import {
  formatExperienceRange,
  loadExperiences,
  totalHighlightCount,
} from '../../utils/portfolio-data';
import { MOBILE_VIEWPORT } from '../../utils/viewport';

const experiences = loadExperiences();

test.describe('Experience scroll timeline', () => {
  test.beforeEach(async ({ portfolioPage }) => {
    await portfolioPage.experienceSection.scrollIntoViewIfNeeded();
  });

  test('timeline renders one milestone per experience from portfolio data', async ({ portfolioPage }) => {
    await expect(portfolioPage.timelineMilestones).toHaveCount(experiences.length);
    await expect(portfolioPage.timelineDots).toHaveCount(experiences.length);
    await expect(portfolioPage.experienceTimeline.locator('.timeline-summary')).toHaveCount(experiences.length);
  });

  test('each milestone shows role, company, and summary from portfolio data', async ({ portfolioPage }) => {
    for (const [index, experience] of experiences.entries()) {
      const milestone = portfolioPage.timelineMilestones.nth(index);
      await expect(milestone.locator('h5')).toHaveText(experience.role);
      await expect(milestone.locator('.timeline-meta')).toHaveText(experience.company);
      await expect(milestone.locator('.timeline-summary')).toHaveText(experience.summary);
    }
  });

  test('timeline uses scroll structure with axis, body, and a single rail', async ({ portfolioPage }) => {
    await expect(portfolioPage.timelineRail).toHaveCount(1);
    await expect(portfolioPage.experienceTimeline.locator('.timeline-axis')).toHaveCount(experiences.length);
    await expect(portfolioPage.experienceTimeline.locator('.timeline-body')).toHaveCount(experiences.length);
    await expect(portfolioPage.experienceTimeline.locator('.timeline-marker')).toHaveCount(0);
  });

  test('date labels are formatted with month and year from start and end fields', async ({ portfolioPage }) => {
    for (const [index, experience] of experiences.entries()) {
      const expectedDate = formatExperienceRange(experience.start, experience.end);
      await expect(portfolioPage.timelineMilestones.nth(index).locator('.timeline-date')).toHaveText(expectedDate);
    }
  });

  test('View full career history button is visible with correct label', async ({ portfolioPage }) => {
    await expect(portfolioPage.viewFullHistoryBtn).toBeVisible();
    await expect(portfolioPage.viewFullHistoryBtn).toHaveText('View full career history');
  });

  test('summary view does not show full highlight bullets inline', async ({ portfolioPage }) => {
    await expect(portfolioPage.experienceSection.locator('.experience-highlights')).toHaveCount(0);
  });

  test('timeline summary uses the full width of the timeline body', async ({ portfolioPage }) => {
    const widths = await portfolioPage.page.evaluate(() => {
      const summary = document.querySelector('.timeline-summary');
      const body = document.querySelector('.timeline-body');
      if (!summary || !body) return null;
      return {
        summary: Math.round(summary.getBoundingClientRect().width),
        body: Math.round(body.getBoundingClientRect().width),
      };
    });

    expect(widths).not.toBeNull();
    expect(widths?.summary).toBe(widths?.body);
  });

  test('scrolling to a later milestone activates it', async ({ portfolioPage }) => {
    const lastMilestone = portfolioPage.timelineMilestones.last();
    await lastMilestone.scrollIntoViewIfNeeded();

    await expect(lastMilestone).toHaveClass(/is-active/);
  });

  test('timeline rail aligns with dots and reaches the last dot', async ({ portfolioPage }) => {
    await portfolioPage.timelineMilestones.last().scrollIntoViewIfNeeded();

    await expect.poll(async () => {
      const alignment = await portfolioPage.getTimelineRailAlignment();
      return alignment.railReachesLastDot && alignment.railStartsAtFirstDot;
    }).toBe(true);

    const alignment = await portfolioPage.getTimelineRailAlignment();
    expect(alignment.firstDotXOffset).toBeLessThan(2);
    expect(alignment.lastDotXOffset).toBeLessThan(2);
  });

  test('View full career history opens modal with all roles', async ({ portfolioPage }) => {
    await portfolioPage.viewFullHistoryBtn.click();

    await expect(portfolioPage.experienceModal).toBeVisible();
    await expect(portfolioPage.experienceModalBody.locator('.experience-modal-role')).toHaveCount(experiences.length);
    await expect(portfolioPage.experienceModalBody).toContainText(experiences[0].company);
    await expect(portfolioPage.experienceModalBody).toContainText(experiences.at(-1)!.company);
  });

  test('modal shows role headings and full highlight bullets from portfolio data', async ({ portfolioPage }) => {
    await portfolioPage.viewFullHistoryBtn.click();

    await expect(portfolioPage.experienceModalBody.locator('.experience-modal-role h5').first()).toBeVisible();
    await expect(portfolioPage.experienceModalBody.locator('.experience-highlights li')).toHaveCount(
      totalHighlightCount(experiences)
    );
  });

  test('close button dismisses the experience modal', async ({ portfolioPage }) => {
    await portfolioPage.viewFullHistoryBtn.click();
    await expect(portfolioPage.experienceModal).toBeVisible();

    await portfolioPage.experienceModalCloseBtn.click();

    await expect(portfolioPage.experienceModal).toBeHidden();
  });

  test('clicking backdrop dismisses the experience modal', async ({ page, portfolioPage }) => {
    await portfolioPage.viewFullHistoryBtn.click();
    await expect(portfolioPage.experienceModal).toBeVisible();

    const dialogBox = await portfolioPage.experienceModal.boundingBox();
    expect(dialogBox).not.toBeNull();
    if (!dialogBox) return;

    await page.mouse.click(dialogBox.x - 10, dialogBox.y + dialogBox.height / 2);

    await expect(portfolioPage.experienceModal).toBeHidden();
  });
});

test.describe('Experience navigation', () => {
  test('desktop nav scrolls to the timeline', async ({ portfolioPage }) => {
    await portfolioPage.goto();
    await portfolioPage.scrollToExperienceViaDesktopNav();

    await expect(portfolioPage.experienceTimeline).toBeInViewport();
    await expect(portfolioPage.timelineMilestones).toHaveCount(experiences.length);
    await expect(portfolioPage.viewFullHistoryBtn).toBeVisible();
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('burger menu Experience link scrolls to the timeline', async ({ portfolioPage }) => {
      await portfolioPage.goto();
      await portfolioPage.scrollToExperienceViaMobileNav();

      expect(await portfolioPage.isMobileMenuOpen()).toBe(false);
      await expect(portfolioPage.experienceTimeline).toBeInViewport();
      await expect(portfolioPage.timelineMilestones).toHaveCount(experiences.length);
    });

    test('timeline renders on mobile with rail, dots, and summaries', async ({ portfolioPage }) => {
      await portfolioPage.experienceSection.scrollIntoViewIfNeeded();

      await expect(portfolioPage.timelineMilestones).toHaveCount(experiences.length);
      await expect(portfolioPage.timelineRail).toHaveCount(1);
      await expect(portfolioPage.timelineDots).toHaveCount(experiences.length);
      await expect(portfolioPage.experienceTimeline.locator('.timeline-summary').first()).not.toBeEmpty();
    });

    test('timeline rail aligns on mobile', async ({ portfolioPage }) => {
      await portfolioPage.timelineMilestones.last().scrollIntoViewIfNeeded();

      await expect.poll(async () => {
        const alignment = await portfolioPage.getTimelineRailAlignment();
        return alignment.railReachesLastDot && alignment.railStartsAtFirstDot;
      }).toBe(true);

      const alignment = await portfolioPage.getTimelineRailAlignment();
      expect(alignment.firstDotXOffset).toBeLessThan(2);
      expect(alignment.lastDotXOffset).toBeLessThan(2);
    });
  });
});
