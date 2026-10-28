# Bakery Fullstack (MySQL + Payment)

This folder contains your same bakery frontend with a new backend for:
- MySQL database connection
- Order storage
- Cash on Delivery and Razorpay online payment

## Folder
- Frontend: `D:\codex\bakery_mysql_payment`
- Backend: `D:\codex\bakery_mysql_payment\backend`
- SQL schema: `D:\codex\bakery_mysql_payment\database\schema.sql`

## 1) Setup MySQL
1. Open MySQL and run `database/schema.sql`
2. This creates:
   - `products`
   - `orders`
   - `order_items`

## 2) Setup Backend
1. Go to backend folder
2. Create `.env` from `.env.example`
3. Fill your real values for:
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
4. Install dependencies and run server:
   - `npm install`
   - `npm run dev`

Backend runs at `http://localhost:5000`

## 3) Setup Frontend
1. In project root, create `.env` from `.env.example`
2. Confirm `VITE_API_BASE_URL=http://localhost:5000`
3. Install dependencies and run:
   - `npm install`
   - `npm run dev`

Frontend runs at `http://localhost:5173`

## API Endpoints Added
- `GET /api/health`
- `POST /api/orders/cod`
- `POST /api/orders/qr`
- `POST /api/orders/razorpay/order`
- `POST /api/orders/razorpay/verify`

## Checkout Behavior
- `PLACE ORDER (COD)` stores order in MySQL with `PENDING` payment status.
- `PAY VIA QR CODE` shows your QR and creates an order with `PENDING` payment status.
- `PAY ONLINE` opens Razorpay checkout and updates order to `PAID` after signature verification.

## QR Payment Setup
1. Put your QR image inside `public` (example: `public/payment-qr.png`).
2. In root `.env`, set:
   - `VITE_QR_CODE_IMAGE_URL=/payment-qr.png`
   - `VITE_UPI_ID=your-upi-id`
   - `VITE_UPI_NAME=your-name-or-shop`
