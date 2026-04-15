class GooeyNav {
  constructor(container, options = {}) {
    this.container = container;
    this.nav = container.querySelector('ul');
    this.filterRef = container.querySelector('.effect.filter');
    this.textRef = container.querySelector('.effect.text');
    this.items = Array.from(this.nav.querySelectorAll('li'));
    
    this.animationTime = options.animationTime || 600;
    this.particleCount = options.particleCount || 15;
    this.particleDistances = options.particleDistances || [90, 10];
    this.particleR = options.particleR || 100;
    this.timeVariance = options.timeVariance || 300;
    this.colors = options.colors || [1, 2, 3, 1, 2, 3, 1, 4];
    
    this.activeIndex = this.items.findIndex(item => item.classList.contains('active'));
    if (this.activeIndex === -1) this.activeIndex = 0;

    this.injectSVGFilter();
    this.init();
  }

  injectSVGFilter() {
    if (document.getElementById('goo-filter-svg')) return;
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.id = "goo-filter-svg";
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    
    const filter = document.createElementNS(svgNS, "filter");
    filter.id = "goo-filter";
    
    const feGaussianBlur = document.createElementNS(svgNS, "feGaussianBlur");
    feGaussianBlur.setAttribute("in", "SourceGraphic");
    feGaussianBlur.setAttribute("stdDeviation", "7");
    feGaussianBlur.setAttribute("result", "blur");
    
    const feColorMatrix = document.createElementNS(svgNS, "feColorMatrix");
    feColorMatrix.setAttribute("in", "blur");
    feColorMatrix.setAttribute("mode", "matrix");
    feColorMatrix.setAttribute("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9");
    feColorMatrix.setAttribute("result", "gooey");
    
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feColorMatrix);
    svg.appendChild(filter);
    document.body.appendChild(svg);
  }

  noise(n = 1) {
    return n / 2 - Math.random() * n;
  }

  getXY(distance, pointIndex, totalPoints) {
    const angle = ((360 + this.noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  createParticle(i, t, d, r) {
    let rotate = this.noise(r / 10);
    return {
      start: this.getXY(d[0], this.particleCount - i, this.particleCount),
      end: this.getXY(d[1] + this.noise(7), this.particleCount - i, this.particleCount),
      time: t,
      scale: 1 + this.noise(0.2),
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }

  makeParticles(element) {
    const d = this.particleDistances;
    const r = this.particleR;
    const bubbleTime = this.animationTime * 2 + this.timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < this.particleCount; i++) {
      const t = this.animationTime * 2 + this.noise(this.timeVariance * 2);
      const p = this.createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            if (element.contains(particle)) {
              element.removeChild(particle);
            }
          } catch {
            // ignore
          }
        }, t);
      }, 30);
    }
  }

  updateEffectPosition(element) {
    if (!this.container || !this.filterRef || !this.textRef) return;
    const containerRect = this.container.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(this.filterRef.style, styles);
    Object.assign(this.textRef.style, styles);
    this.textRef.innerText = element.innerText;
  }

  handleClick(e, index) {
    const liEl = this.items[index];
    if (this.activeIndex === index) return;
    
    // Delay navigation so animation can play.
    const link = liEl.querySelector('a');
    if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
       e.preventDefault();
       setTimeout(() => {
         window.location.href = link.href;
       }, 300); // Wait 300ms before changing page
    }

    this.items[this.activeIndex].classList.remove('active');
    this.activeIndex = index;
    liEl.classList.add('active');
    
    this.updateEffectPosition(liEl);

    if (this.filterRef) {
      const particles = this.filterRef.querySelectorAll('.particle');
      particles.forEach(p => this.filterRef.removeChild(p));
    }

    if (this.textRef) {
      this.textRef.classList.remove('active');
      void this.textRef.offsetWidth; // trigger reflow
      this.textRef.classList.add('active');
    }

    if (this.filterRef) {
      this.makeParticles(this.filterRef);
    }
  }

  init() {
    this.items.forEach((item, index) => {
      const link = item.querySelector('a');
      if (link) {
        link.addEventListener('click', (e) => this.handleClick(e, index));
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleClick(e, index);
            setTimeout(() => {
                window.location.href = link.href;
            }, 300);
          }
        });
      }
    });

    const activeLi = this.items[this.activeIndex];
    if (activeLi) {
      setTimeout(() => {
        this.updateEffectPosition(activeLi);
        this.textRef?.classList.add('active');
      }, 50);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = this.items[this.activeIndex];
      if (currentActiveLi) {
        this.updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(this.container);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.gooey-nav-container');
  if (container) {
    new GooeyNav(container);
  }
});
