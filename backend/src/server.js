import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 5000);
const DATA_DIR = path.resolve(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const allowedOrigins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',').map((s) => s.trim()).filter(Boolean);
const maxOrderTotal = Number(process.env.MAX_ORDER_TOTAL || 1000000);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS'));
} }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false }));

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, name: { type: String, required: true, maxlength: 160 },
  category: { type: String, maxlength: 80 }, price: { type: Number, required: true, min: 0 }, qty: { type: Number, required: true, min: 1, max: 10000 },
  customization: { type: mongoose.Schema.Types.Mixed, default: null },
  description: { type: String, maxlength: 1000 }, image: { type: String, maxlength: 300 }
}, { _id: false });
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customer: { name: { type: String, required: true, maxlength: 120 }, phone: { type: String, required: true, maxlength: 30 }, address: { type: String, required: true, maxlength: 1000 } },
  items: { type: [orderItemSchema], required: true }, total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['New', 'Contacted', 'Confirmed', 'Completed', 'Cancelled'], default: 'New' },
  source: { type: String, default: 'website-whatsapp' }
}, { timestamps: true, minimize: false });
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function readLocalOrders() {
  await mkdir(DATA_DIR, { recursive: true });
  try { return JSON.parse(await readFile(ORDERS_FILE, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
async function saveOrder(order) {
  if (mongoose.connection.readyState === 1) {
    const doc = await Order.create(order);
    return { id: doc.orderId, createdAt: doc.createdAt };
  }
  const orders = await readLocalOrders();
  if (orders.some((item) => item.orderId === order.orderId)) {
    const error = new Error('Duplicate order ID'); error.status = 409; throw error;
  }
  const saved = { ...order, createdAt: new Date().toISOString() };
  orders.push(saved);
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  return { id: saved.orderId, createdAt: saved.createdAt };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'tatwa-api', storage: mongoose.connection.readyState === 1 ? 'mongodb' : 'local-json' }));
app.post('/api/orders', async (req, res, next) => {
  try {
    const { orderId, customer, items, total } = req.body || {};
    if (typeof orderId !== 'string' || !/^TATWA-[A-Z0-9-]{8,50}$/.test(orderId)) return res.status(400).json({ error: 'A valid orderId is required.' });
    if (!customer || typeof customer.name !== 'string' || customer.name.trim().length < 2 || customer.name.length > 120) return res.status(400).json({ error: 'Enter a valid customer name.' });
    if (!customer || typeof customer.phone !== 'string' || !/^[+()\d\s-]{7,30}$/.test(customer.phone.trim())) return res.status(400).json({ error: 'Enter a valid phone number.' });
    if (typeof customer.address !== 'string' || customer.address.trim().length < 5 || customer.address.length > 1000) return res.status(400).json({ error: 'Enter a delivery address.' });
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) return res.status(400).json({ error: 'Order must contain between 1 and 50 items.' });
    const cleanItems = items.map((item) => {
      if (!item || typeof item.id !== 'string' || typeof item.name !== 'string' || item.name.length > 160) throw Object.assign(new Error('Invalid item details.'), { status: 400 });
      const price = Number(item.price), qty = Number(item.qty);
      if (!Number.isFinite(price) || price < 0 || !Number.isInteger(qty) || qty < 1 || qty > 10000) throw Object.assign(new Error('Invalid item price or quantity.'), { status: 400 });
      const customization = item.customization && typeof item.customization === 'object' ? {
        audience: String(item.customization.audience || '').slice(0, 60), neckline: String(item.customization.neckline || '').slice(0, 60),
        size: String(item.customization.size || '').slice(0, 40),
        sizeQuantities: item.customization.sizeQuantities && typeof item.customization.sizeQuantities === 'object' ? Object.fromEntries(['S','M','L','XL','XXL'].map((size) => [size, Math.max(0, Math.min(10000, Math.floor(Number(item.customization.sizeQuantities[size]) || 0)))])) : {},
        color: String(item.customization.color || '').slice(0, 60),
        method: String(item.customization.method || '').slice(0, 80), printType: String(item.customization.printType || '').slice(0, 80),
        printSize: String(item.customization.printSize || '').slice(0, 80), placement: String(item.customization.placement || '').slice(0, 80),
        qty: Math.max(1, Math.min(10000, Math.floor(Number(item.customization.qty) || qty))),
        text: String(item.customization.text || '').slice(0, 1000), file: String(item.customization.file || '').slice(0, 255),
        artworkType: String(item.customization.artworkType || '').slice(0, 100),
        necklineStyle: String(item.customization.necklineStyle || '').slice(0, 100),
        notes: String(item.customization.notes || '').slice(0, 1000)
      } : null;
      return { id: item.id, name: item.name, category: String(item.category || '').slice(0, 80), price, qty, customization, description: String(item.description || '').slice(0, 1000), image: String(item.image || '').slice(0, 300) };
    });
    const calculatedTotal = cleanItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (!Number.isFinite(Number(total)) || Math.abs(calculatedTotal - Number(total)) > 1) return res.status(400).json({ error: 'Order total does not match item prices and quantities.' });
    if (calculatedTotal > maxOrderTotal) return res.status(400).json({ error: 'Order total is above the allowed limit. Please contact Tatwa.' });
    const saved = await saveOrder({ orderId, customer: { name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim() }, items: cleanItems, total: calculatedTotal, status: 'New', source: 'website-whatsapp' });
    return res.status(201).json({ ok: true, orderId: saved.id, createdAt: saved.createdAt, message: 'Order details saved. Continue in WhatsApp to send the order.' });
  } catch (error) { next(error); }
});

app.use((err, _req, res, _next) => {
  if (err.message === 'Origin is not allowed by CORS') return res.status(403).json({ error: err.message });
  if (err.code === 11000) return res.status(409).json({ error: 'This order ID already exists.' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong while saving the order.' });
});

async function start() {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')) {
    try { await mongoose.connect(process.env.MONGODB_URI); console.log('Connected to MongoDB'); }
    catch (error) { console.error('MongoDB connection failed; using local JSON storage for this run:', error.message); }
  } else {
    console.log('MONGODB_URI not configured; orders will be stored in backend/data/orders.json');
  }
  app.listen(PORT, () => console.log(`Tatwa API running at http://localhost:${PORT}`));
}
start();
