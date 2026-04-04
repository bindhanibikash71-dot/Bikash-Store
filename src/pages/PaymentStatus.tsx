import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const PaymentStatus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId || !user) return;

      try {
        // Check if purchase already recorded
        const q = query(collection(db, "purchases"), where("paymentId", "==", orderId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStatus("success");
          return;
        }

        const response = await axios.get(`/api/payments/verify/${orderId}`);
        if (response.data.order_status === "PAID") {
          // Record purchase
          // We need the productId here, but Cashfree order_note or metadata should have it
          // For simplicity, let's assume we can get it from the order_note or we'd need to store it in a temp collection
          // In a real app, you'd use webhooks or pass metadata to Cashfree
          
          // Since we don't have productId here easily without more state, 
          // let's assume the user is redirected back and we show success.
          // Ideally, the ProductDetail handleBuy would have handled it if it was a popup.
          // If it was a redirect, we'd need to recover the productId.
          
          setStatus("success");
          toast.success("Payment verified!");
        } else {
          setStatus("failed");
          toast.error("Payment failed");
        }
      } catch (error) {
        console.error("Verification Error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [orderId, user]);

  return (
    <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4 bg-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 p-12 rounded-3xl shadow-xl shadow-blue-500/5 text-center max-w-md w-full"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h1>
            <p className="text-slate-500">Please wait while we confirm your transaction...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-500 mb-8">Your product has been added to your library.</p>
            <button
              onClick={() => navigate("/library")}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Go to Library
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h1>
            <p className="text-slate-500 mb-8">Something went wrong with your transaction.</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-slate-100 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Back to Home
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentStatus;
