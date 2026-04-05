import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as CashfreePkg from "cashfree-pg";

const { Cashfree } = CashfreePkg as any;

dotenv.config();

// Initialize Cashfree
if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) {
  try {
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" 
      ? Cashfree.Environment.PRODUCTION 
      : Cashfree.Environment.SANDBOX;
  } catch (err) {
    console.error("Cashfree initialization failed:", err);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

export default app;
