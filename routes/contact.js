const router = require('express').Router();

// POST /api/contact
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  db.prepare('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name, email, subject || '', message);

  res.json({ message: 'Thank you for reaching out! We\'ll get back to you within 24 hours.' });
});

module.exports = router;
