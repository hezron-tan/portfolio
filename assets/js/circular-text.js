/**
 * Vanilla port of React Bits Circular Text (CSS spin instead of motion).
 * @see https://www.reactbits.dev/text-animations/circular-text
 */
/**
 * Renders characters around a circle and spins the ring.
 * @returns Cleanup function that removes listeners and empties the host.
 */
export function createCircularText(container, options = {}) {
    const { text = "Hezron * Tan * Test * Engineer * ", spinDuration = 20, onHover = "speedUp", className = "", } = options;
    const letters = Array.from(text);
    const root = document.createElement("div");
    root.className = ["circular-text", className].filter(Boolean).join(" ");
    root.style.setProperty("--spin-duration", `${spinDuration}s`);
    root.setAttribute("aria-hidden", "true");
    letters.forEach((letter, i) => {
        const span = document.createElement("span");
        span.textContent = letter;
        const rotationDeg = (360 / letters.length) * i;
        // Rotate only — letters sit on a true circle concentric with the container
        // (React Bits also applies a growing translate that drifts off-center on small screens).
        span.style.transform = `rotateZ(${rotationDeg}deg)`;
        root.appendChild(span);
    });
    container.appendChild(root);
    const applyDuration = (duration, paused = false) => {
        root.style.setProperty("--spin-duration", `${duration}s`);
        root.classList.toggle("is-paused", paused);
        root.classList.toggle("is-bonkers", duration < spinDuration / 10);
    };
    const handleHoverStart = () => {
        if (!onHover)
            return;
        switch (onHover) {
            case "slowDown":
                applyDuration(spinDuration * 2);
                break;
            case "speedUp":
                applyDuration(spinDuration / 4);
                break;
            case "pause":
                applyDuration(spinDuration, true);
                break;
            case "goBonkers":
                applyDuration(spinDuration / 20);
                break;
            default:
                applyDuration(spinDuration);
        }
    };
    const handleHoverEnd = () => {
        applyDuration(spinDuration);
    };
    root.addEventListener("mouseenter", handleHoverStart);
    root.addEventListener("mouseleave", handleHoverEnd);
    return () => {
        root.removeEventListener("mouseenter", handleHoverStart);
        root.removeEventListener("mouseleave", handleHoverEnd);
        root.remove();
    };
}
