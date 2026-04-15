/* ============================================================
   GREEN BLOOM — Express Server
   ============================================================ */
const express = require('express');
const session = require('express-session');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 8080;

/* ── Database ─────────────────────────────────────────── */
const dbPath = path.join(__dirname, 'db', 'greenbloom.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Make db available to routes
app.locals.db = db;

/* ── Middleware ────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'greenbloom-secret-2025',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days
}));

// Initialize cart in session
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = [];
  next();
});

/* ── Static Files ─────────────────────────────────────── */
app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ───────────────────────────────────────── */
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/checkout', require('./routes/checkout'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/auth', require('./routes/auth'));

/* ── SPA fallback for HTML pages ──────────────────────── */
app.get('/:page.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', `${req.params.page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Final catch-all for Vercel
app.get('*', (req, res) => {
  if (req.url.startsWith('/api')) return res.status(404).json({ error: 'API not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Start ────────────────────────────────────────────── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  🌿 Green Bloom server running at http://localhost:${PORT}\n`);
  });
}

module.exports = app;
