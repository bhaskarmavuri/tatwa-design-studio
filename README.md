# Tatwa E-commerce Website

**Tatwa (తత్వ) by Amma Tailors** — e-commerce website for custom clothing, printing, embroidery, stitching and design.

## Contact
- Email: tatwadesigningstudio@gmail.com
- Location: Bhimavaram, Andhra Pradesh
- WhatsApp: +91 77319 77738

## Folder structure
```text
tatwa-ecommerce/
├── frontend/                 # React + Vite customer website
│   ├── public/
│   │   └── images/            # Logo + demo product artwork
│   ├── src/
│   │   ├── main.jsx           # Store UI, cart and WhatsApp checkout
│   │   └── styles.css         # Website styling
│   ├── index.html
│   ├── package.json
│   └── vercel.json
│
├── backend/                  # Optional Express + MongoDB API
│   ├── src/
│   │   └── server.js          # Order API
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Customer order flow
1. Customer browses products.
2. Adds products to cart.
3. Enters name, phone and delivery address.
4. Clicks **Send order on WhatsApp**.
5. WhatsApp opens with the order ID, customer details, items and total.
6. Tatwa confirms the order and sends the payment QR code in WhatsApp.
7. Customer pays and shares the payment screenshot in WhatsApp.

There is **no online payment gateway** in this version.

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

For the optional backend, create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

## Run backend
```bash
cd backend
npm install
copy .env.example .env
npm start
```

Set `MONGODB_URI` in `backend/.env` if you want orders stored in MongoDB. The WhatsApp checkout itself does not depend on MongoDB.

## Deployment
### Frontend — Vercel
Deploy the **frontend** folder as the Vercel project root. Vercel will build the React/Vite site. If you deploy the backend separately, add the backend public URL as `VITE_API_URL` in Vercel environment variables.

### Backend
Deploy the **backend** folder separately to a Node.js-compatible host and configure `MONGODB_URI` and `PORT`.

## Replacing demo products
Replace the SVG files in `frontend/public/images/` with your actual product photos, keeping the filenames or updating the product list in `frontend/src/main.jsx`.
