const BRAND = ["#2fe4ab", "#b6ea5c", "#e8b339", "#9cc2c9", "#ffffff"];

export type ConfettiOptions = {
  x?: number;
  y?: number;
  count?: number;
  colors?: string[];
  power?: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
};

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let raf: number | null = null;
let dpr = 1;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function ensureCanvas() {
  if (canvas || typeof document === "undefined") return;
  canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
}

function teardown() {
  if (raf != null) cancelAnimationFrame(raf);
  raf = null;
  window.removeEventListener("resize", resize);
  if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = null;
  ctx = null;
  particles = [];
}

function tick() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let alive = 0;
  for (const p of particles) {
    if (p.life <= 0) continue;
    alive++;
    p.vy += 0.12 * dpr;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 0.0125;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (alive > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    teardown();
  }
}

export function vbConfetti(opts: ConfettiOptions = {}) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  try {
    const { x = 0.5, y = 0.4, count = 70, colors = BRAND, power = 1 } = opts;
    ensureCanvas();
    if (!canvas || !ctx) return;
    const ox = x * canvas.width;
    const oy = y * canvas.height;
    for (let i = 0; i < count; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = (6 + Math.random() * 7) * power * dpr;
      particles.push({
        x: ox,
        y: oy,
        vx: Math.cos(ang) * speed + (Math.random() - 0.5) * 2 * dpr,
        vy: Math.sin(ang) * speed,
        w: (5 + Math.random() * 5) * dpr,
        h: (7 + Math.random() * 6) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.9 + Math.random() * 0.4,
      });
    }
    if (raf == null) raf = requestAnimationFrame(tick);
  } catch {
    /* no-op */
  }
}
