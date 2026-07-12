/**
 * Vanilla port of React Bits Magic Rings (ogl + fragment shader).
 * @see https://www.reactbits.dev/animations/magic-rings
 */
import { Renderer, Program, Mesh, Triangle } from "ogl";
const hexToRGB = (hex) => {
    const c = hex.replace("#", "").padEnd(6, "0");
    const r = parseInt(c.slice(0, 2), 16) / 255;
    const g = parseInt(c.slice(2, 4), 16) / 255;
    const b = parseInt(c.slice(4, 6), 16) / 255;
    return [r, g, b];
};
const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragment = `
precision highp float;

uniform float uTime, uAttenuation, uLineThickness;
uniform float uBaseRadius, uRadiusStep, uScaleRate;
uniform float uOpacity, uNoiseAmount, uRotation, uRingGap;
uniform float uFadeIn, uFadeOut;
uniform float uMouseInfluence, uHoverAmount, uHoverScale, uParallax, uBurst;
uniform vec2 uResolution, uMouse;
uniform vec3 uColor, uColorTwo;
uniform float uRingCount;

const float HP = 1.5707963;
const float CYCLE = 3.45;

float fade(float t) {
  return t < uFadeIn ? smoothstep(0.0, uFadeIn, t) : 1.0 - smoothstep(uFadeOut, CYCLE - 0.2, t);
}

float ring(vec2 p, float ri, float cut, float t0, float px) {
  float t = mod(uTime + t0, CYCLE);
  float r = ri + t / CYCLE * uScaleRate;
  float d = abs(length(p) - r);
  float a = atan(abs(p.y), abs(p.x)) / HP;
  float th = max(1.0 - a, 0.5) * px * uLineThickness;
  float h = (1.0 - smoothstep(th, th * 1.5, d)) + 1.0;
  d += pow(cut * a, 3.0) * r;
  return h * exp(-uAttenuation * d) * fade(t);
}

void main() {
  float px = 1.0 / min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) * px;
  float cr = cos(uRotation), sr = sin(uRotation);
  p = mat2(cr, -sr, sr, cr) * p;
  p -= uMouse * uMouseInfluence;
  float sc = mix(1.0, uHoverScale, uHoverAmount) + uBurst * 0.3;
  p /= sc;
  vec3 c = vec3(0.0);
  float rcf = max(uRingCount - 1.0, 1.0);
  for (int i = 0; i < 10; i++) {
    if (float(i) >= uRingCount) break;
    float fi = float(i);
    vec2 pr = p - fi * uParallax * uMouse;
    vec3 rc = mix(uColor, uColorTwo, fi / rcf);
    c = mix(c, rc, vec3(ring(pr, uBaseRadius + fi * uRadiusStep, pow(uRingGap, fi), i == 0 ? 0.0 : 2.95 * fi, px)));
  }
  c *= 1.0 + uBurst * 2.0;
  float n = fract(sin(dot(gl_FragCoord.xy + uTime * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uNoiseAmount;
  float alpha = max(c.r, max(c.g, c.b)) * uOpacity;
  gl_FragColor = vec4(c, alpha);
}
`;
export function createMagicRings(container, options = {}) {
    const { color = "#5fb0b7", colorTwo = "#9fd9de", speed = 1, ringCount = 6, attenuation = 10, lineThickness = 2, baseRadius = 0.35, radiusStep = 0.1, scaleRate = 0.1, opacity = 1, noiseAmount = 0.08, rotation = 0, ringGap = 1.5, fadeIn = 0.7, fadeOut = 0.5, followMouse = true, mouseInfluence = 0.15, hoverScale = 1.15, parallax = 0.04, clickBurst = false, dpr = Math.min(window.devicePixelRatio || 1, 2), } = options;
    const renderer = new Renderer({
        dpr,
        alpha: true,
        antialias: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);
    const uniforms = {
        uTime: { value: 0 },
        uAttenuation: { value: attenuation },
        uResolution: { value: [1, 1] },
        uColor: { value: hexToRGB(color) },
        uColorTwo: { value: hexToRGB(colorTwo) },
        uLineThickness: { value: lineThickness },
        uBaseRadius: { value: baseRadius },
        uRadiusStep: { value: radiusStep },
        uScaleRate: { value: scaleRate },
        uRingCount: { value: ringCount },
        uOpacity: { value: opacity },
        uNoiseAmount: { value: noiseAmount },
        uRotation: { value: (rotation * Math.PI) / 180 },
        uRingGap: { value: ringGap },
        uFadeIn: { value: fadeIn },
        uFadeOut: { value: fadeOut },
        uMouse: { value: [0, 0] },
        uMouseInfluence: { value: followMouse ? mouseInfluence : 0 },
        uHoverAmount: { value: 0 },
        uHoverScale: { value: hoverScale },
        uParallax: { value: parallax },
        uBurst: { value: 0 },
    };
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
        vertex,
        fragment,
        uniforms,
        transparent: true,
    });
    const mesh = new Mesh(gl, { geometry, program });
    const mouseTarget = [0, 0];
    const smoothMouse = [0, 0];
    let hoverAmount = 0;
    let isHovered = false;
    let burst = 0;
    let rafId = 0;
    let paused = document.hidden;
    const canvas = gl.canvas;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h);
        uniforms.uResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseTarget[0] = (e.clientX - rect.left) / rect.width - 0.5;
        mouseTarget[1] = -((e.clientY - rect.top) / rect.height - 0.5);
    };
    const onMouseEnter = () => {
        isHovered = true;
    };
    const onMouseLeave = () => {
        isHovered = false;
        mouseTarget[0] = 0;
        mouseTarget[1] = 0;
    };
    const onClick = () => {
        if (clickBurst)
            burst = 1;
    };
    if (followMouse) {
        container.addEventListener("mousemove", onMouseMove);
        container.addEventListener("mouseenter", onMouseEnter);
        container.addEventListener("mouseleave", onMouseLeave);
    }
    if (clickBurst) {
        container.addEventListener("click", onClick);
    }
    const visibilityHandler = () => {
        paused = document.hidden;
    };
    document.addEventListener("visibilitychange", visibilityHandler);
    const loop = (t) => {
        rafId = requestAnimationFrame(loop);
        smoothMouse[0] += (mouseTarget[0] - smoothMouse[0]) * 0.08;
        smoothMouse[1] += (mouseTarget[1] - smoothMouse[1]) * 0.08;
        hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * 0.08;
        burst *= 0.95;
        if (burst < 0.001)
            burst = 0;
        uniforms.uTime.value = t * 0.001 * speed;
        uniforms.uMouse.value = [smoothMouse[0], smoothMouse[1]];
        uniforms.uHoverAmount.value = hoverAmount;
        uniforms.uBurst.value = clickBurst ? burst : 0;
        if (!paused) {
            try {
                renderer.render({ scene: mesh, frustumCull: false });
            }
            catch (error) {
                console.error("Magic Rings render error:", error);
            }
        }
    };
    rafId = requestAnimationFrame(loop);
    return () => {
        cancelAnimationFrame(rafId);
        document.removeEventListener("visibilitychange", visibilityHandler);
        ro.disconnect();
        if (followMouse) {
            container.removeEventListener("mousemove", onMouseMove);
            container.removeEventListener("mouseenter", onMouseEnter);
            container.removeEventListener("mouseleave", onMouseLeave);
        }
        if (clickBurst) {
            container.removeEventListener("click", onClick);
        }
        if (canvas.parentElement === container) {
            container.removeChild(canvas);
        }
        program.remove?.();
        geometry.remove?.();
        mesh.remove?.();
    };
}
