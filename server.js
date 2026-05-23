import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const loadDB = async () => {
  try {
    const content = await readFile(DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return { products: [], orders: [] };
  }
};

const saveDB = async (data) => {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/api/products', async (req, res) => {
  const db = await loadDB();
  res.json(db.products || []);
});

app.get('/api/orders', async (req, res) => {
  const db = await loadDB();
  res.json(db.orders || []);
});

app.post('/api/orders', async (req, res) => {
  const db = await loadDB();
  const order = req.body;
  if (!order || !order.id || !order.items || order.items.length === 0) {
    return res.status(400).json({ error: 'Invalid order payload' });
  }
  db.orders = [order, ...(db.orders || [])];
  await saveDB(db);
  res.status(201).json({ success: true });
});

app.get('/api/admin/products', async (req, res) => {
  const db = await loadDB();
  res.json(db.products || []);
});

app.post('/api/admin/products', async (req, res) => {
  const db = await loadDB();
  const product = req.body;
  if (!product || !product.id) {
    return res.status(400).json({ error: 'Invalid product payload' });
  }
  db.products = [product, ...(db.products || [])];
  await saveDB(db);
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  const productUpdates = req.body;
  db.products = (db.products || []).map((product) => (product.id === id ? { ...product, ...productUpdates } : product));
  await saveDB(db);
  res.json({ success: true });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const db = await loadDB();
  const { id } = req.params;
  db.products = (db.products || []).filter((product) => product.id !== id);
  await saveDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Elara Earth backend running on http://localhost:${PORT}`);
});
