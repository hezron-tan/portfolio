import { ViewportSize } from '@playwright/test';

export const MOBILE_VIEWPORT: ViewportSize = { width: 390, height: 844 };
export const TABLET_VIEWPORT: ViewportSize = { width: 768, height: 1024 };
export const DESKTOP_VIEWPORT: ViewportSize = { width: 1280, height: 720 };

/** CSS breakpoint below which the mobile nav bar appears */
export const MOBILE_BREAKPOINT_PX = 736;
