import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import * as CashfreePkg from "cashfree-pg";

const { Cashfree } = CashfreePkg as any;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting server initialization...");

// Initialize Cashfree
if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) {
  try {
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" 
      ? Cashfree.Environment.PRODUCTION 
      : Cashfree.Environment.SANDBOX;
    console.log("✅ Cashfree initialized successfully");
  } catch (err) {
    console.error("❌ Cashfree initialization failed:", err);
  }
} else {
  console.warn("⚠️ Cashfree credentials missing in .env");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/payments/create-order", async (req, res) => {
    try {
      const { orderAmount, orderCurrency, customerId, customerPhone, customerEmail, orderNote } = req.body;

      const request = {
        order_amount: orderAmount,
        order_currency: orderCurrency || "INR",
        customer_details: {
          customer_id: customerId,
          customer_phone: customerPhone,
          customer_email: customerEmail,
        },
        order_meta: {
          return_url: `${process.env.APP_URL}/payment-status?order_id={order_id}`,
          notify_url: `${process.env.APP_URL}/api/payments/webhook`,
        },
        order_note: orderNote,
      };

      const response = await (Cashfree as any).PGCreateOrder("2023-08-01", request);
      res.json(response.data);
    } catch (error: any) {
      console.error("Cashfree Order Creation Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  app.get("/api/payments/verify/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const response = await (Cashfree as any).PGFetchOrder("2023-08-01", orderId);
      res.json(response.data);
    } catch (error: any) {
      console.error("Cashfree Order Verification Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
