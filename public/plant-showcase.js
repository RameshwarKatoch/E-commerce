/* ============================================================
   PLANT SHOWCASE JS — Fruity-inspired slide experience
   ============================================================ */

(function () {
  'use strict';

  const track = document.querySelector('.showcase-track');
  const slides = document.querySelectorAll('.showcase-slide');
  const bgText = document.querySelector('.showcase-bg-text');
  const badgeIcon = document.querySelector('.badge-icon');
  const logoEl = document.querySelector('.showcase-logo');
  const priceTag = document.querySelector('.price-amount');
  const pricePlantTag = document.querySelector('.price-plant-tag');
  const priceCta = document.querySelector('.price-cta');
  const prevBtn = document.querySelector('.showcase-prev');
  const nextBtn = document.querySelector('.showcase-next');
  const counterEl = document.querySelector('.showcase-counter');
  const badgeTextEl = document.querySelector('.badge-ring-text textPath');

  if (!track || slides.length === 0) return;

  let current = 0;
  const total = slides.length;

  /* ── Per-slide data ──────────────────────────────────── */
  const slideData = JSON.parse(
    document.getElementById('showcase-data').textContent
  );

  /* ── Apply theme for slide index ──────────────────────── */
  function applyTheme(idx) {
    const data = slideData[idx];
    document.documentElement.style.setProperty('--current-dark', data.dark);
    document.documentElement.style.setProperty('--current-bg', data.bg);

    // Background color on the slide itself
    slides[idx].style.backgroundColor = data.bg;

    if (bgText) bgText.textContent = data.name;
    if (badgeIcon) badgeIcon.textContent = data.icon;
    if (priceTag) priceTag.textContent = data.price;
    if (pricePlantTag) pricePlantTag.textContent = data.category;
    if (priceCta) {
      priceCta.style.background = data.dark;
      priceCta.textContent = 'Add to Cart — ' + data.price;
      priceCta.onclick = () => {
        if (window.addToCart) window.addToCart(data.name, parseInt(data.price.replace(/[₹,]/g, '')));
      };
    }
    if (badgeTextEl) badgeTextEl.textContent = data.badge;
    if (counterEl) counterEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');

    // Update logo color
    if (logoEl) logoEl.style.color = data.dark;

    // Update nav buttons
    if (prevBtn) prevBtn.style.color = data.dark;
    if (nextBtn) nextBtn.style.color = data.dark;

    // Show/hide nav buttons
    if (prevBtn) prevBtn.classList.toggle('hidden', idx === 0);
    if (nextBtn) nextBtn.classList.toggle('hidden', idx === total - 1);
  }

  /* ── Animate plants flying in ─────────────────────────── */
  function animatePlantsIn(direction) {
    const activePlants = slides[current].querySelectorAll('.plant-image');
    const fromY = direction > 0 ? '-80vh' : '80vh';

    activePlants.forEach((el, i) => {
      el.style.transition = 'none';
      el.style.transform = `translateY(${fromY}) rotate(${(Math.random() - 0.5) * 15}deg)`;
      el.style.opacity = '0';

      requestAnimationFrame(() => {
        setTimeout(() => {
          el.style.transition = `transform 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s, opacity 0.5s ease ${i * 0.08}s`;
          el.style.transform = 'translateY(0) rotate(0deg)';
          el.style.opacity = '1';
        }, 20);
      });
    });
  }

  /* ── Floating idle animation ──────────────────────────── */
  function startFloating() {
    const activePlants = slides[current].querySelectorAll('.plant-image img');
    activePlants.forEach((img, i) => {
      img.style.animation = 'none';
      img.offsetHeight; // reflow
      img.style.animation = `plantFloat ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite alternate`;
    });
  }

  /* ── Slide to index ─────────────────────────────────────── */
  function goTo(idx, direction) {
    // Stop previous floats
    const prevPlants = slides[current].querySelectorAll('.plant-image img');
    prevPlants.forEach(img => img.style.animation = 'none');

    current = idx;
    track.style.transform = `translateX(-${current * 100}vw)`;

    applyTheme(current);

    // Wait for slide transition, then animate plants in
    setTimeout(() => {
      animatePlantsIn(direction);
      setTimeout(startFloating, 800);
    }, 100);
  }

  /* ── Button listeners ─────────────────────────────────── */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (current < total - 1) goTo(current + 1, 1);
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (current > 0) goTo(current - 1, -1);
    });
  }

  /* ── Keyboard navigation ─────────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && current < total - 1) goTo(current + 1, 1);
    if (e.key === 'ArrowLeft'  && current > 0)         goTo(current - 1, -1);
  });

  /* ── Touch/swipe support ─────────────────────────────── */
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0 && current < total - 1) goTo(current + 1, 1);
      if (dx > 0 && current > 0)         goTo(current - 1, -1);
    }
  }, { passive: true });

  /* ── Floating keyframe (injected once) ──────────────── */
  if (!document.getElementById('showcase-keyframes')) {
    const style = document.createElement('style');
    style.id = 'showcase-keyframes';
    style.textContent = `
      @keyframes plantFloat {
        from { transform: translateY(0px) rotate(-1.5deg); }
        to   { transform: translateY(-18px) rotate(1.5deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Hide/show fixed UI on scroll ─────────────────────── */
  const fixedEls = [
    document.querySelector('.showcase-bg-text'),
    document.querySelector('.showcase-badge'),
    document.querySelector('.showcase-price-tag'),
    document.querySelector('.showcase-counter'),
    document.querySelector('.showcase-prev'),
    document.querySelector('.showcase-next'),
    document.querySelector('.showcase-navbar'),
  ].filter(Boolean);

  const showcaseMain = document.querySelector('.showcase-main');

  function onScroll() {
    if (!showcaseMain) return;
    const mainBottom = showcaseMain.getBoundingClientRect().bottom;
    const inShowcase = mainBottom > 60;
    fixedEls.forEach(el => {
      // Don't hide the navbar but do change its background
      if (el.classList.contains('showcase-navbar')) {
        el.classList.toggle('dark-bg', !inShowcase);
        return;
      }
      el.style.opacity = inShowcase ? '' : '0';
      el.style.pointerEvents = inShowcase ? '' : 'none';
      el.style.transition = 'opacity 0.3s ease';
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Init ──────────────────────────────────────────── */
  // Pre-set all slide background colors
  slideData.forEach((data, i) => {
    slides[i].style.backgroundColor = data.bg;
  });

  applyTheme(0);
  setTimeout(() => {
    animatePlantsIn(1);
    setTimeout(startFloating, 800);
  }, 200);

})();
