/* ============================================================
   SCROLL ANIMATIONS JS — Green Bloom (fixed)
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ────────────────────────────── */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress-bar';
  document.body.prepend(bar);

  function updateProgressBar() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }

  /* ── 2. SECTION DOTS NAVIGATOR ─────────────────────────── */
  const sectionTargets = [
    { id: 'home',           label: 'Hero' },
    { cls: 'editorial-intro', label: 'Story' },
    { id: 'collections',   label: 'Collections' },
    { cls: 'pillars-section', label: 'Why Us' },
    { cls: 'testimonials-v2', label: 'Reviews' },
  ].map(s => ({
    el: s.id ? document.getElementById(s.id) : document.querySelector('.' + s.cls),
    label: s.label,
    dot: null,
  })).filter(s => s.el);

  const counter = document.createElement('nav');
  counter.className = 'section-counter';
  counter.setAttribute('aria-label', 'Page sections');
  sectionTargets.forEach(s => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', 'Go to ' + s.label);
    dot.addEventListener('click', () => s.el.scrollIntoView({ behavior: 'smooth' }));
    counter.appendChild(dot);
    s.dot = dot;
  });
  document.body.appendChild(counter);

  function updateDots() {
    const mid = window.scrollY + window.innerHeight * 0.45;
    let active = 0;
    sectionTargets.forEach((s, i) => {
      if (s.el.offsetTop <= mid) active = i;
    });
    sectionTargets.forEach((s, i) => s.dot.classList.toggle('active', i === active));
    const heroBottom = sectionTargets[0]?.el?.getBoundingClientRect().bottom ?? 0;
    counter.classList.toggle('visible', heroBottom < 50);
  }

  /* ── 3. CARD REVEALS ─────────────────────────── */
  const indoorCard  = document.getElementById('cat-indoor');
  const outdoorCard = document.getElementById('cat-outdoor');

  if (indoorCard) {
    indoorCard.classList.remove('fade-up');
    indoorCard.classList.add('slide-up');
  }
  if (outdoorCard) {
    outdoorCard.classList.remove('fade-up');
    outdoorCard.classList.add('slide-up');
    outdoorCard.style.transitionDelay = '0.2s';
  }

  /* ── 4. SWEEP LINES between sections ───────────────────── */
  ['editorial-intro', 'collections-v2', 'pillars-section', 'testimonials-v2'].forEach(cls => {
    const sec = document.querySelector('.' + cls);
    if (!sec) return;
    const line = document.createElement('span');
    line.className = 'sweep-line';
    sec.insertAdjacentElement('beforebegin', line);
  });

  /* ── 5. WORD REVEAL — safe text-node only splitter ──────── */
  const introStatement = document.querySelector('.intro-statement');
  if (introStatement) {
    introStatement.classList.add('word-reveal');

    // Walk only TEXT nodes, leave element nodes (em, br) alone
    function wrapTextNodeWords(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        words.forEach(part => {
          if (/^\s+$/.test(part) || part === '') {
            frag.appendChild(document.createTextNode(part));
          } else {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName !== 'BR' &&
        node.nodeName !== 'IMG'
      ) {
        // Recurse into element children (like <em>)
        Array.from(node.childNodes).forEach(wrapTextNodeWords);
      }
    }

    Array.from(introStatement.childNodes).forEach(wrapTextNodeWords);

    // Stagger delays
    let idx = 0;
    introStatement.querySelectorAll('.word').forEach(w => {
      w.style.transitionDelay = (idx * 0.045) + 's';
      idx++;
    });
  }

  /* ── 6. SLIDE-UP on pillar cards ───────────────────────── */
  document.querySelectorAll('.pillar-card').forEach((card, i) => {
    card.classList.remove('fade-up');
    card.classList.add('slide-up');
    card.style.transitionDelay = (i * 0.12) + 's';
  });

  /* ── 7. SCALE-IN on testimonial cards ──────────────────── */
  document.querySelectorAll('.testi-card').forEach((card, i) => {
    card.classList.remove('fade-up');
    card.classList.add('scale-in');
    card.style.transitionDelay = (i * 0.15) + 's';
  });

  /* ── 8. MASTER INTERSECTION OBSERVER ───────────────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('reveal-left'))  el.classList.add('revealed');
      if (el.classList.contains('reveal-right')) el.classList.add('revealed');
      if (el.classList.contains('sweep-line'))   el.classList.add('swept');
      if (el.classList.contains('word-reveal'))  el.classList.add('revealed');
      if (el.classList.contains('scale-in'))     el.classList.add('revealed');
      if (el.classList.contains('slide-up'))     el.classList.add('revealed');
      if (el.classList.contains('fade-up'))      el.classList.add('visible');
      if (el.classList.contains('fade-in-up'))   el.classList.add('visible');

      revealObs.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  function observeAll() {
    document.querySelectorAll(
      '.reveal-left, .reveal-right, .sweep-line, ' +
      '.word-reveal, .scale-in, .slide-up, .fade-up, .fade-in-up'
    ).forEach(el => revealObs.observe(el));
  }
  observeAll();

  /* ── 9. PARALLAX on hero title ─────────────────────────── */
  const heroTitle   = document.querySelector('.hero-v2-title');
  const heroEyebrow = document.querySelector('.hero-eyebrow');
  const heroCanvas  = document.getElementById('antigravity-hero');

  function updateParallax() {
    const s = window.scrollY;
    if (heroTitle)   heroTitle.style.transform   = `translateY(${s * 0.22}px)`;
    if (heroEyebrow) heroEyebrow.style.transform = `translateY(${s * 0.14}px)`;
    if (heroCanvas)  heroCanvas.style.transform  = `translateY(${s * 0.35}px)`;
  }

  /* ── 10. HERO STAT COUNTER ANIMATION ───────────────────── */
  let countersAnimated = false;
  function animateHeroCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    document.querySelectorAll('.hero-stat strong').forEach(el => {
      const text = el.textContent.trim();
      const numMatch = text.match(/[\d,]+/);
      if (!numMatch) return;
      const target = parseInt(numMatch[0].replace(',', ''));
      if (isNaN(target)) return;
      const suffix = text.replace(numMatch[0], '').trim();
      const duration = 1400;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(eased * target).toLocaleString('en-IN') + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  const statsEl = document.querySelector('.hero-v2-stats');
  if (statsEl) {
    const statsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateHeroCounters(); statsObs.disconnect(); }
    }, { threshold: 0.5 });
    statsObs.observe(statsEl);
  }

  /* ── 11. SCROLL HANDLER ────────────────────────────────── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgressBar();
        updateDots();
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Init
  updateProgressBar();
  updateDots();

})();
