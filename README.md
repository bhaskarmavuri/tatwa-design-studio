# Tatwa by Amma Tailors — Full-Stack Website

Complete React + Vite storefront and Express API for Tatwa. This preserves the existing Tatwa branding and product images, and includes customizable products, a live browser mockup, a PNG preview download, cart, customer checkout, WhatsApp order handoff, and order persistence.

## Included features

- Product catalogue with category filters and search.
- Men, women, kids and unisex customization.
- Neckline, size, colour, print/embroidery/tailoring method, placement, quantity, text/logo instructions and artwork file selection.
- Live shirt mockup and PNG download. The uploaded artwork is overlaid directly; it is not regenerated, so original logos/text are not intentionally redrawn.
- Cart and customer details form.
- WhatsApp message includes order ID, customer details, every item, customization choices, quantity and estimated catalogue total.
- Express backend validates and saves order details to MongoDB when configured, or to a local JSON file for local testing.
- Health endpoint: `GET /api/health`.
- No payment gateway. Tatwa confirms the final quote and sends the payment QR code through WhatsApp.

## Requirements

- Node.js 20 or later
- npm
- Optional for local testing: MongoDB Atlas or a local MongoDB instance

## Run locally (Windows PowerShell)

Open two terminal windows in the extracted `Tatwa_Complete_Website` folder.

### 1. Start the backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

By default, the API runs at `http://localhost:5000`. If `MONGODB_URI` is not set, orders are stored in `backend/data/orders.json` for local development. That local JSON fallback is not suitable as persistent storage on serverless hosts.

### 2. Start the frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## Configure MongoDB

1. Create a MongoDB Atlas cluster and database user.
2. Add your deployment IP/network access in Atlas.
3. Copy the connection string into `backend/.env` as `MONGODB_URI=...`.
4. Never commit `.env` files or share database credentials publicly.
5. Restart the backend and check `http://localhost:5000/api/health`. The response should report `storage: "mongodb"`.

## WhatsApp ordering behaviour

1. Customer selects **Customize** on a product.
2. Customer selects audience, neckline, size, colour, method, placement and quantity; they can add text and select an artwork file.
3. Customer can inspect and download the illustrative PNG preview, then adds the configured item to the cart.
4. Customer enters name, phone and delivery address and clicks **Open WhatsApp & Send Order**.
5. The website attempts to save the order to the backend, then opens WhatsApp with the order details prefilled.
6. If artwork was selected, the customer must attach the original image/PDF manually in WhatsApp before sending. A normal `wa.me` link cannot attach local files automatically. The selected file is not uploaded to the API in this lower-cost version.
7. Tatwa confirms final pricing, delivery, fabric/print availability and sends the payment QR code through WhatsApp.

The order is saved before WhatsApp opens when the API is available. If the API is unavailable, WhatsApp still opens so the customer can continue, but the website may not have a saved server-side order record.

## WhatsApp number

The existing project number is kept as the default: `917386684662`. To change it, edit `frontend/.env`:

```env
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
```

Use the full country code and digits only, without `+`, spaces or dashes. Restart Vite after changing environment variables. Do not assume the shop contact number and WhatsApp ordering number are the same; verify the correct number before launch.

## Deploy frontend to Vercel

1. Push the `frontend` folder to a GitHub repository.
2. Import the repository into Vercel and set **Root Directory** to `frontend`.
3. Framework: Vite; build command `npm run build`; output directory `dist`.
4. Set environment variables in Vercel:
   - `VITE_API_URL` = public URL of your deployed backend, e.g. `https://your-api.onrender.com`
   - `VITE_WHATSAPP_NUMBER` = confirmed business WhatsApp number in international digits-only format
5. Redeploy after setting environment variables.

## Deploy backend

Deploy `backend` as a Node.js web service on a host that supports persistent Node services (for example Render, Railway, or a VPS):

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `CLIENT_ORIGINS` (your exact Vercel frontend origin), `NODE_ENV=production`, and optionally `MAX_ORDER_TOTAL`.
- Use MongoDB Atlas for persistent production order storage. Do not rely on `backend/data/orders.json` for production because local disk may be ephemeral.
- After deployment, verify `https://your-api-domain/api/health`.

## Important limitations / before launch

- The preview is an illustrative browser mockup, not an AI-generated lifestyle photo or print-ready file. Original artwork is kept as-is in the overlay; final sizing and print quality need shop confirmation.
- Browser-selected artwork is not uploaded to the server in this version. Customers must attach the original file manually in WhatsApp. This keeps the first version lower-cost and avoids a separate file-storage service.
- Product prices are sample catalogue prices; update them to actual prices before accepting orders. The total is an estimate until Tatwa confirms customization and delivery charges.
- Confirm the WhatsApp number before launch.
- Configure CORS with the deployed frontend URL in `backend/.env` / hosting environment.
- Orders contain customer contact and delivery details. Restrict database access and never expose MongoDB credentials.

## Updated Printo-style customization UI

The customization modal now includes fabric colour, print method, print type, print location, print size, per-size quantity split (S/M/L/XL/XXL), artwork upload, live mockup, PNG preview download, and a magnified preview/product-image view. The existing storefront layout and Tatwa branding are retained.

### WhatsApp order and payment flow

The customer submits the configured product and delivery details to WhatsApp. Tatwa confirms the final production price and delivery fee in chat, then shares its verified UPI QR code/payment instructions in that chat. The customer completes payment using their UPI app and sends confirmation. This is not an in-WhatsApp payment gateway; it is a WhatsApp-based order and payment-instructions workflow. Never use a QR code or UPI ID until the customer has verified it belongs to Tatwa.

### Artwork notes

Artwork is previewed locally in the browser. A normal WhatsApp click-to-chat link cannot automatically attach the selected local file. Customers must attach the original artwork in WhatsApp themselves; the order message reminds them to preserve the original artwork.
