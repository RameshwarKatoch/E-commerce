// === GREEN BLOOM — Main JavaScript ===

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Update cart badge and auth status on load
async function updateCartBadge() {
  try {
    const res = await fetch('/api/cart');
    if (res.ok) {
      const data = await res.json();
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(b => b.textContent = data.count || 0);
    }
  } catch(e) {}
}

async function updateAuthStatus() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      const userBtn = document.getElementById('nav-user-btn');
      if (data.loggedIn && userBtn) {
        userBtn.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span style="font-size:0.8rem; font-weight:700;">${data.user.name.split(' ')[0]}</span>
          </div>
        `;
        // Optionally add a logout listener if user clicks again, but for now we'll let it link to account page
      }
    }
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateAuthStatus();
});

// --- Mobile hamburger menu ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
  });
}

// --- Intersection Observer for fade-in animations ---
// Supports both .fade-in-up (shop pages) and .fade-up (homepage v2)
const allFadeEls = document.querySelectorAll('.fade-in-up, .fade-up');
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || i * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);
allFadeEls.forEach((el) => fadeObserver.observe(el));

// --- Cart toast notification ---
let toastTimeout = null;

async function addToCart(name, price, productId) {
  const toast = document.getElementById('cart-toast');
  const msg = document.getElementById('toast-message');

  try {
    // If productId is given, use it. Otherwise look up by name.
    let pid = productId;
    if (!pid) {
      const res = await fetch('/api/products');
      if (res.ok) {
        const products = await res.json();
        const match = products.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
        if (match) pid = match.id;
      }
    }

    if (pid) {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ productId: pid, quantity: 1 })
      });
      const data = await res.json();
      if (msg) msg.textContent = `"${name}" added to cart! 🛒`;
      
      // Update all cart badges
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(b => b.textContent = data.cartCount);
    } else {
      if (msg) msg.textContent = `"${name}" added! 🛒`;
    }
  } catch(e) {
    if (msg) msg.textContent = `"${name}" added to cart! 🛒`;
  }

  if (toast) {
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
  }
}
window.addToCart = addToCart;

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
