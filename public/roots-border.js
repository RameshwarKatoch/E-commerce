/* ============================================================
   ROOTS BORDER JS — Organic vine-like animated border (Brown)
   ============================================================ */

class RootsBorder {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.color = options.color || '#78593F';
    this.speed = options.speed || 0.35;
    this.chaos = options.chaos || 0.1;
    this.borderRadius = options.borderRadius || 24;
    this.branchCount = options.branchCount || 4;
    this.thickness = options.thickness || 2.5;

    this.time = 0;
    this.lastFrameTime = 0;
    this.animationId = null;

    this.setup();
  }

  setup() {
    this.container.classList.add('roots-border');
    this.container.style.setProperty('--rb-color', this.color);

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'rb-canvas-container';
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'rb-canvas';
    canvasWrap.appendChild(this.canvas);

    const layers = document.createElement('div');
    layers.className = 'rb-layers';
    layers.innerHTML = '<div class="rb-glow-1"></div><div class="rb-glow-2"></div><div class="rb-background-glow"></div>';

    const content = document.createElement('div');
    content.className = 'rb-content';
    while (this.container.firstChild) {
      content.appendChild(this.container.firstChild);
    }

    this.container.appendChild(canvasWrap);
    this.container.appendChild(layers);
    this.container.appendChild(content);

    this.ctx = this.canvas.getContext('2d');
    this.updateSize();

    this.resizeObserver = new ResizeObserver(() => this.updateSize());
    this.resizeObserver.observe(this.container);

    this.animationId = requestAnimationFrame(this.draw.bind(this));
  }

  updateSize() {
    const rect = this.container.getBoundingClientRect();
    const offset = 80; // Bigger canvas area for larger roots
    this.canvasWidth = rect.width + offset * 2;
    this.canvasHeight = rect.height + offset * 2;
    this.borderOffset = offset;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.canvasWidth * dpr;
    this.canvas.height = this.canvasHeight * dpr;
    this.canvas.style.width = this.canvasWidth + 'px';
    this.canvas.style.height = this.canvasHeight + 'px';
    this.dpr = dpr;
  }

  random(x) {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1;
  }

  noise2D(x, y) {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const a = this.random(i + j * 57);
    const b = this.random(i + 1 + j * 57);
    const c = this.random(i + (j + 1) * 57);
    const d = this.random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3.0 - 2.0 * fx);
    const uy = fy * fy * (3.0 - 2.0 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }

  octavedNoise(x, octaves, lacunarity, gain, amp, freq, time, seed, flatness) {
    let y = 0;
    let amplitude = amp;
    let frequency = freq;
    for (let i = 0; i < octaves; i++) {
      let oa = amplitude;
      if (i === 0) oa *= flatness;
      y += oa * this.noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= lacunarity;
      amplitude *= gain;
    }
    return y;
  }

  getCornerPoint(cx, cy, r, startAngle, arcLen, progress) {
    const angle = startAngle + progress * arcLen;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  getRoundedRectPoint(t, left, top, w, h, r) {
    const sw = w - 2 * r;
    const sh = h - 2 * r;
    const ca = (Math.PI * r) / 2;
    const total = 2 * sw + 2 * sh + 4 * ca;
    const d = t * total;
    let acc = 0;

    if (d <= acc + sw) { const p = (d - acc) / sw; return { x: left + r + p * sw, y: top }; }
    acc += sw;
    if (d <= acc + ca) { const p = (d - acc) / ca; return this.getCornerPoint(left + w - r, top + r, r, -Math.PI / 2, Math.PI / 2, p); }
    acc += ca;
    if (d <= acc + sh) { const p = (d - acc) / sh; return { x: left + w, y: top + r + p * sh }; }
    acc += sh;
    if (d <= acc + ca) { const p = (d - acc) / ca; return this.getCornerPoint(left + w - r, top + h - r, r, 0, Math.PI / 2, p); }
    acc += ca;
    if (d <= acc + sw) { const p = (d - acc) / sw; return { x: left + w - r - p * sw, y: top + h }; }
    acc += sw;
    if (d <= acc + ca) { const p = (d - acc) / ca; return this.getCornerPoint(left + r, top + h - r, r, Math.PI / 2, Math.PI / 2, p); }
    acc += ca;
    if (d <= acc + sh) { const p = (d - acc) / sh; return { x: left, y: top + h - r - p * sh }; }
    acc += sh;
    const p = (d - acc) / ca;
    return this.getCornerPoint(left + r, top + r, r, Math.PI, Math.PI / 2, p);
  }

  draw(currentTime) {
    const dt = (currentTime - this.lastFrameTime) / 1000;
    this.time += dt * this.speed;
    this.lastFrameTime = currentTime;

    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.scale(this.dpr, this.dpr);

    const offset = this.borderOffset;
    const bw = this.canvasWidth - 2 * offset;
    const bh = this.canvasHeight - 2 * offset;
    const maxR = Math.min(bw, bh) / 2;
    const radius = Math.min(this.borderRadius, maxR);

    const perimeter = 2 * (bw + bh) + 2 * Math.PI * radius;
    const sampleCount = Math.floor(perimeter / 1.5); // more samples = smoother vines

    // Draw multiple root tendrils
    for (let vine = 0; vine < this.branchCount; vine++) {
      const seed = vine * 11.7;
      const displacement = 35 + vine * 18; // LARGER displacement
      const alpha = 0.65 - vine * 0.1;

      // Main root stroke — brown
      ctx.strokeStyle = this.color;
      ctx.globalAlpha = Math.max(0.2, alpha);
      ctx.lineWidth = this.thickness - vine * 0.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      const points = [];

      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount;
        const pt = this.getRoundedRectPoint(progress, offset, offset, bw, bh, radius);

        const xN = this.octavedNoise(progress * 5, 7, 1.7, 0.6, this.chaos, 7, this.time, seed, 0);
        const yN = this.octavedNoise(progress * 5, 7, 1.7, 0.6, this.chaos, 7, this.time, seed + 1, 0);

        const dx = pt.x + xN * displacement;
        const dy = pt.y + yN * displacement;

        points.push({ x: dx, y: dy });

        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }

      ctx.closePath();
      ctx.stroke();

      // Draw small branching rootlets shooting outward
      ctx.globalAlpha = Math.max(0.12, alpha * 0.45);
      ctx.lineWidth = Math.max(0.6, this.thickness * 0.35);
      const branchInterval = Math.floor(sampleCount / (6 + vine * 2));

      for (let i = 0; i < points.length; i += branchInterval) {
        const p = points[i];
        // Random outward direction
        const angle = this.noise2D(i * 0.3 + seed, this.time * 0.5) * Math.PI * 2;
        const len = 12 + this.noise2D(i * 0.7 + seed, this.time * 0.2) * 22;

        const ex = p.x + Math.cos(angle) * len;
        const ey = p.y + Math.sin(angle) * len;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        // Slightly curved root branch via a midpoint offset
        const mx = (p.x + ex) / 2 + (Math.random() - 0.5) * 8;
        const my = (p.y + ey) / 2 + (Math.random() - 0.5) * 8;
        ctx.quadraticCurveTo(mx, my, ex, ey);
        ctx.stroke();

        // Tiny root tip dot
        ctx.beginPath();
        ctx.arc(ex, ey, 1.5 + vine * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0.1, alpha * 0.3);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(this.draw.bind(this));
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}

// Auto-init on all .co-card elements
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.co-card').forEach((card, i) => {
    new RootsBorder(card, {
      color: '#78593F',             // warm earthy brown
      speed: 0.3 + (i % 3) * 0.08,
      chaos: 0.1,
      borderRadius: 24,
      branchCount: 4,
      thickness: 2.8
    });
  });
});
