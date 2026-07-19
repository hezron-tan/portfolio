/**
 * Full-screen intro loader: Magic Rings background + Circular Text,
 * then a curtain pull-up reveal into the portfolio.
 */
import { createCircularText } from "./circular-text.js";
import { createMagicRings } from "./magic-rings.js";

const MIN_DISPLAY_MS = 2800;
const CURTAIN_MS = 1100;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Boots the site loader overlay. Resolves when the curtain has finished
 * and the overlay has been removed from the DOM.
 */
export async function initSiteLoader(): Promise<void> {
  const loader = document.getElementById("site-loader");
  if (!loader) return;

  const params = new URLSearchParams(window.location.search);
  const forceLoader = params.get("loader") === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const automated = Boolean(navigator.webdriver);

  if ((reducedMotion || automated) && !forceLoader) {
    loader.remove();
    document.body.classList.remove("is-loading");
    return;
  }

  const ringsMount = document.getElementById("loader-rings");
  const textMount = document.getElementById("loader-circular-text");
  const cleanups: Array<() => void> = [];

  if (ringsMount) {
    try {
      cleanups.push(
        createMagicRings(ringsMount, {
          // Theme teal accents (not React Bits pink/cyan defaults)
          color: "#33a1ea",
          colorTwo: "#a9d6f7",
          speed: 0.85,
          ringCount: 6,
          attenuation: 11,
          lineThickness: 2.2,
          baseRadius: 0.32,
          radiusStep: 0.08,
          scaleRate: 0.1,
          opacity: 0.9,
          noiseAmount: 0.06,
          rotation: 0,
          ringGap: 1.45,
          followMouse: false,
          mouseInfluence: 0.12,
          hoverScale: 1.12,
          parallax: 0.035,
        })
      );
    } catch (error) {
      console.warn("Magic Rings could not start (WebGL may be unavailable):", error);
    }
  }

  if (textMount) {
    cleanups.push(
      createCircularText(textMount, {
        text: "Hezron * Tan * Test * Engineer * ",
        spinDuration: 18,
        onHover: "speedUp",
      })
    );
  }

  await wait(MIN_DISPLAY_MS);

  loader.classList.add("is-exiting");
  document.body.classList.add("loader-exiting");

  await wait(CURTAIN_MS);

  cleanups.forEach((fn) => fn());
  loader.remove();
  document.body.classList.remove("is-loading", "loader-exiting");
}
