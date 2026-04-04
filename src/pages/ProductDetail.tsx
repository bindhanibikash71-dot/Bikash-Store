import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { motion } from "motion/react";
import { Play, Download, Link as LinkIcon, FileText, ArrowLeft, ShieldCheck, Zap, ShoppingBag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import axios from "axios";

declare const loadCashfree: any;

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login, isGuest, subscription } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
          
          // Check if already purchased
          if (user) {
            const purchaseQuery = query(
              collection(db, "purchases"),
              where("userId", "==", user.id),
              where("productId", "==", id),
              where("status", "==", "success")
            );
            const purchaseSnap = await getDocs(purchaseQuery);
            if (!purchaseSnap.empty) {
              setIsPurchased(true);
            }
          }
        } else {
          toast.error("Product not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, user]);

  const hasAccess = isPurchased || !!subscription;

  const handleBuy = async () => {
    if (isGuest) {
      toast("Please login with Google to purchase", { icon: "👤" });
      login();
      return;
    }

    if (!user) {
      toast("Please login to purchase", { icon: "👤" });
      login();
      return;
    }

    if (!product) return;

    setBuying(true);
    try {
      const orderResponse = await axios.post("/api/payments/create-order", {
        orderAmount: product.price,
        orderCurrency: "INR",
        customerId: user.id,
        customerPhone: "9999999999", // Placeholder, should be from user profile
        customerEmail: user.email,
        orderNote: `Purchase of ${product.title}`,
      });

      const { payment_session_id, order_id } = orderResponse.data;

      const cashfree = await loadCashfree({
        mode: "sandbox", // or "production"
      });

      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          toast.error(result.error.message);
        }
        if (result.redirect) {
          console.log("Redirection logic");
        }
        if (result.paymentDetails) {
          // Verify payment on backend
          const verifyRes = await axios.get(`/api/payments/verify/${order_id}`);
          if (verifyRes.data.order_status === "PAID") {
            // Save purchase to Firestore
            await addDoc(collection(db, "purchases"), {
              userId: user.id,
              productId: product.id,
              paymentId: order_id,
              status: "success",
              amount: product.price,
              createdAt: serverTimestamp(),
            });
            toast.success("Purchase successful! 🎉");
            navigate("/library");
          } else {
            toast.error("Payment failed or pending");
          }
        }
      });
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const Icon = {
    video: Play,
    app: Download,
    link: LinkIcon,
    file: FileText,
  }[product.type];

  return (
    <div className="pt-20 pb-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Media */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-blue-500/5">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">What's Included</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-slate-600">
                <Icon className="w-5 h-5 text-blue-500" />
                <span className="capitalize">{product.type} Access</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>Lifetime Updates</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
              <Icon className="w-3 h-3" />
              <span>{product.type}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              {product.title}
            </h1>
          </div>

          <div className="prose max-w-none text-slate-600">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg shadow-blue-500/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-slate-500 text-sm">Price</p>
                <p className="text-4xl font-bold text-slate-900">
                  {hasAccess ? "Unlocked" : formatCurrency(product.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-sm">
                  {hasAccess ? "Premium Access" : "One-time payment"}
                </p>
                <p className="text-green-600 text-sm font-medium">Secure Checkout</p>
              </div>
            </div>

            {hasAccess ? (
              <button
                onClick={() => navigate("/library")}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-green-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20"
              >
                <Zap className="w-6 h-6 fill-current" />
                <span>Access Now</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={buying}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20"
              >
                {buying ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-6 h-6" />
                    <span>Buy Now</span>
                  </>
                )}
              </button>
            )}
            <p className="text-center text-slate-400 text-xs mt-4">
              Secure payment powered by Cashfree
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);
};

export default ProductDetail;
