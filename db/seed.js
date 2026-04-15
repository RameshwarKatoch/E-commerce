/* ============================================================
   DATABASE SEED — Creates tables & inserts product data
   ============================================================ */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'greenbloom.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ── Schema ───────────────────────────────────────────── */
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT DEFAULT '',
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    description TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    stock INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'cod',
    payment_id TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT '',
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/* ── Seed Products ────────────────────────────────────── */
const existing = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (existing.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, subcategory, price, image, description, badge)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    // Indoor Plants
    ['Monstera Deliciosa', 'indoor', 'Tropical', 899, 'images/monstera.png',
     'The iconic Swiss Cheese Plant with dramatic split leaves. Air-purifying and perfect for bright, indirect light.', 'BESTSELLER'],
    ['Snake Plant', 'indoor', 'Succulent', 449, 'images/snake_plant.png',
     'NASA-approved air purifier. Thrives on neglect — perfect for beginners. Releases oxygen at night.', 'AIR PURIFIER'],
    ['Aglaonema Pink', 'indoor', 'Foliage', 549, 'images/aglaonema_new.png',
     'Stunning pink and green variegated foliage. Low-light tolerant exotic statement plant.', 'EXOTIC'],
    ['Lucky Bamboo — 3 Layer', 'indoor', 'Feng Shui', 349, 'images/snake_plant.png',
     'Symbol of prosperity and good fortune. Easy to grow in water or soil. Perfect gift plant.', 'FENG SHUI'],
    ['Dracaena Marginata', 'indoor', 'Dracaena', 799, 'images/monstera.png',
     'Elegant dragon tree with slender, arching leaves edged in red. Great for adding height to corners.', 'PREMIUM'],
    ['Thuja Plant', 'indoor', 'Conifer', 699, 'images/snake_plant.png',
     'Compact evergreen conifer perfect for patios and balconies. Natural air freshener.', 'AIR PURIFIER'],

    // Outdoor Plants
    ['Bougainvillea', 'outdoor', 'Flowering', 499, 'images/bougainvillea.png',
     'Vibrant cascading blooms in magenta, purple, and orange. Thrives in full sun. Drought-tolerant.', 'MOST POPULAR'],
    ['Marigold', 'outdoor', 'Annual', 199, 'images/marigold.png',
     'Bright golden blooms that repel pests naturally. Easy to grow annual perfect for borders and pots.', 'PEST REPELLENT'],
    ['Hibiscus', 'outdoor', 'Tropical', 399, 'images/hibiscus.png',
     'Tropical beauty with large, showy blooms. Attracts butterflies and hummingbirds.', 'SUN LOVER'],
    ['Yellow Hibiscus', 'outdoor', 'Tropical', 449, 'images/Yellow hibiscus.png',
     'Radiant yellow tropical blooms. Perfect for creating sunny garden accents.', 'RARE'],
    ['Hydrangea', 'outdoor', 'Perennial', 649, 'images/bougainvillea.png',
     'Stunning clusters of pink, blue, or purple blooms. Color changes with soil pH.', 'ALL SEASON'],
    ['Japanese Maple', 'outdoor', 'Ornamental', 1299, 'images/marigold.png',
     'Spectacular ornamental tree with fiery autumn foliage. A true garden masterpiece.', 'PREMIUM'],
  ];

  const insertMany = db.transaction((items) => {
    for (const p of items) insert.run(...p);
  });

  insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
} else {
  console.log(`ℹ️  Database already has ${existing.count} products, skipping seed.`);
}

console.log('✅ Database ready at', path.join(dbDir, 'greenbloom.db'));
