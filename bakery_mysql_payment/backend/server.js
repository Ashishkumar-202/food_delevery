const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const Razorpay = require("razorpay");
const crypto = require("crypto");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "bakery_app",
  waitForConnections: true,
  connectionLimit: 10,
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

function validateOrderBody(body) {
  const requiredCustomer = [
    "firstName",
    "lastName",
    "email",
    "street",
    "city",
    "state",
    "zipCode",
    "country",
    "phone",
  ];

  if (!body || typeof body !== "object") return "Invalid request body";

  for (const key of requiredCustomer) {
    if (!body.customer || !body.customer[key]) {
      return `Missing customer field: ${key}`;
    }
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "Cart items are required";
  }

  if (typeof body.totalAmount !== "number" || body.totalAmount <= 0) {
    return "Total amount must be a positive number";
  }

  return null;
}

async function insertOrderWithItems(connection, orderPayload) {
  const {
    customer,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus,
    razorpayOrderId = null,
    razorpayPaymentId = null,
  } = orderPayload;

  const [orderResult] = await connection.execute(
    `INSERT INTO orders
      (customer_name, email, phone, street, city, state, zip_code, country, total_amount, payment_method, payment_status, razorpay_order_id, razorpay_payment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      `${customer.firstName} ${customer.lastName}`,
      customer.email,
      customer.phone,
      customer.street,
      customer.city,
      customer.state,
      customer.zipCode,
      customer.country,
      totalAmount,
      paymentMethod,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
    ]
  );

  const orderId = orderResult.insertId;

  for (const item of items) {
    await connection.execute(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
       VALUES (?, ?, ?, ?, ?)`,
      [orderId, String(item.id), item.name, Number(item.quantity), Number(item.price)]
    );
  }

  return orderId;
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "API and MySQL are connected" });
  } catch (error) {
    res.status(500).json({ ok: false, message: "Database connection failed", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Bakery backend is running",
    health: "/api/health",
  });
});

app.post("/api/orders/cod", async (req, res) => {
  const validationError = validateOrderBody(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = await insertOrderWithItems(connection, {
      ...req.body,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
    });

    await connection.commit();

    res.status(201).json({
      message: "Order placed successfully with Cash on Delivery",
      orderId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Unable to place COD order", error: error.message });
  } finally {
    connection.release();
  }
});

app.post("/api/orders/qr", async (req, res) => {
  const validationError = validateOrderBody(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = await insertOrderWithItems(connection, {
      ...req.body,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
    });

    await connection.commit();

    res.status(201).json({
      message: "QR payment order created. Awaiting payment confirmation.",
      orderId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Unable to place QR payment order", error: error.message });
  } finally {
    connection.release();
  }
});

app.post("/api/orders/razorpay/order", async (req, res) => {
  const validationError = validateOrderBody(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(400).json({ message: "Razorpay keys are missing in backend .env" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const orderId = await insertOrderWithItems(connection, {
      ...req.body,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
    });

    const amountPaise = Math.round(req.body.totalAmount * 100);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `order_${orderId}`,
      notes: { localOrderId: String(orderId) },
    });

    await connection.execute(
      "UPDATE orders SET razorpay_order_id = ? WHERE id = ?",
      [razorpayOrder.id, orderId]
    );

    await connection.commit();

    res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      localOrderId: orderId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Unable to create online payment order", error: error.message });
  } finally {
    connection.release();
  }
});

app.post("/api/orders/razorpay/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, localOrderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !localOrderId) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await pool.execute("UPDATE orders SET payment_status = 'FAILED' WHERE id = ?", [localOrderId]);
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await pool.execute(
      "UPDATE orders SET payment_status = 'PAID', razorpay_payment_id = ? WHERE id = ?",
      [razorpay_payment_id, localOrderId]
    );

    res.json({ message: "Payment successful and verified", orderId: localOrderId });
  } catch (error) {
    res.status(500).json({ message: "Unable to verify payment", error: error.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  const orderId = Number(req.params.id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({ message: "Order ID must be a positive number" });
  }

  try {
    const [orders] = await pool.execute(
      `SELECT id, customer_name, email, phone, total_amount, payment_method, payment_status, created_at
       FROM orders WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await pool.execute(
      `SELECT product_id, product_name, quantity, price
       FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    res.json({
      order: orders[0],
      items,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch order", error: error.message });
  }
});

app.get("/api/my-orders", async (req, res) => {
  const email = String(req.query.email || "").trim();
  const phone = String(req.query.phone || "").trim();

  if (!email && !phone) {
    return res.status(400).json({ message: "Provide email or phone to fetch orders" });
  }

  try {
    const conditions = [];
    const params = [];

    if (email) {
      conditions.push("email = ?");
      params.push(email);
    }

    if (phone) {
      conditions.push("phone = ?");
      params.push(phone);
    }

    const [orders] = await pool.execute(
      `SELECT id, customer_name, email, phone, total_amount, payment_method, payment_status, created_at
       FROM orders
       WHERE ${conditions.join(" OR ")}
       ORDER BY id DESC`,
      params
    );

    if (orders.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = orders.map((order) => order.id);
    const placeholders = orderIds.map(() => "?").join(",");
    const [items] = await pool.query(
      `SELECT order_id, product_id, product_name, quantity, price
       FROM order_items
       WHERE order_id IN (${placeholders})
       ORDER BY order_id DESC, id ASC`,
      orderIds
    );

    const itemsByOrderId = items.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});

    const response = orders.map((order) => ({
      ...order,
      items: itemsByOrderId[order.id] || [],
    }));

    res.json({ orders: response });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch order history", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
