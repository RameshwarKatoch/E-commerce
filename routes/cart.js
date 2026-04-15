const router = require('express').Router();

// GET /api/cart — get cart contents
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const cart = req.session.cart || [];

  // Enrich cart items with product details
  const enriched = cart.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    return { ...item, product };
  }).filter(item => item.product); // Remove any with deleted products

  const total = enriched.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  res.json({ items: enriched, total, count: enriched.length });
});

// POST /api/cart/add — add item
router.post('/add', (req, res) => {
  const db = req.app.locals.db;
  const { productId, quantity = 1 } = req.body;

  if (!productId) return res.status(400).json({ error: 'productId required' });

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const cart = req.session.cart;
  const existing = cart.find(i => i.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  req.session.cart = cart;
  res.json({ message: `${product.name} added to cart`, cartCount: cart.reduce((s, i) => s + i.quantity, 0) });
});

// PUT /api/cart/:productId — update quantity
router.put('/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  const cart = req.session.cart;
  const item = cart.find(i => i.productId === productId);

  if (!item) return res.status(404).json({ error: 'Item not in cart' });

  if (quantity <= 0) {
    req.session.cart = cart.filter(i => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  res.json({ message: 'Cart updated', cartCount: req.session.cart.reduce((s, i) => s + i.quantity, 0) });
});

// DELETE /api/cart/:productId — remove item
router.delete('/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  req.session.cart = (req.session.cart || []).filter(i => i.productId !== productId);
  res.json({ message: 'Item removed', cartCount: req.session.cart.reduce((s, i) => s + i.quantity, 0) });
});

// DELETE /api/cart — clear cart
router.delete('/', (req, res) => {
  req.session.cart = [];
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
