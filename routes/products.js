const router = require('express').Router();

// GET /api/products — list all (optional ?category=indoor|outdoor)
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { category } = req.query;
  let rows;
  if (category) {
    rows = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY id').all(category);
  } else {
    rows = db.prepare('SELECT * FROM products ORDER BY id').all();
  }
  res.json(rows);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(row);
});

module.exports = router;
