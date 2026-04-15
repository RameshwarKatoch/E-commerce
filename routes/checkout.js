const router = require('express').Router();

// POST /api/checkout — place order
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const cart = req.session.cart || [];

  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const { name, email, phone, address, city, pincode, paymentMethod = 'cod' } = req.body;

  if (!name || !email || !phone || !address) {
    return res.status(400).json({ error: 'Name, email, phone and address are required' });
  }

  // Calculate total
  let total = 0;
  const items = cart.map(item => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    if (!product) return null;
    total += product.price * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price: product.price };
  }).filter(Boolean);

  if (items.length === 0) return res.status(400).json({ error: 'No valid products in cart' });

  // Create order
  const orderResult = db.prepare(`
    INSERT INTO orders (guest_name, guest_email, guest_phone, shipping_address, city, pincode, total, payment_method, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, email, phone, address, city || '', pincode || '', total, paymentMethod, null);

  const orderId = orderResult.lastInsertRowid;

  // Insert order items
  const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  const insertAll = db.transaction((orderItems) => {
    for (const item of orderItems) {
      insertItem.run(orderId, item.productId, item.quantity, item.price);
    }
  });
  insertAll(items);

  // Clear cart
  req.session.cart = [];

  res.json({
    message: 'Order placed successfully!',
    orderId,
    total,
    paymentMethod
  });
});

module.exports = router;
