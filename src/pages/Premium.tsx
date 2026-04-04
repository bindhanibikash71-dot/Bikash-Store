import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { Zap, ShieldCheck, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../lib/utils";
import axios from "axios";

declare const loadCashfree: any;

const Premium: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const subscriptionPlans = [
    { id: "weekly", title: "Weekly", price: 199, period: "week", desc: "Perfect for quick access to premium content." },
    { id: "monthly", title: "Monthly", price: 599, period: "month", desc: "Our most popular plan for regular learners.", popular: true },
    { id: "yearly", title: "Yearly", price: 4999, period: "year", desc: "Best value for long-term digital growth." }
  ];

  const handleSubscribe = async (plan: any) => {
    if (!user) {
      toast.error("Please login to subscribe");
      login();
      return;
    }

    setSubscribing(plan.id);
    try {
      const orderResponse = await axios.post("/api/payments/create-order", {
        orderAmount: plan.price,
        orderCurrency: "INR",
        customerId: user.id,
        customerPhone: "9999999999",
        customerEmail: user.email,
        orderNote: `Subscription: ${plan.title} Plan`,
      });

      const { payment_session_id, order_id } = orderResponse.data;

      const cashfree = await loadCashfree({
        mode: "sandbox",
      });

      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_self",
      };

      cashfree.checkout(checkoutOptions).then(async (result: any) => {
        if (result.error) {
          toast.error(result.error.message);
        }
        if (result.paymentDetails) {
          const verifyRes = await axios.get(`/api/payments/verify/${order_id}`);
          if (verifyRes.data.order_status === "PAID") {
            await addDoc(collection(db, "subscriptions"), {
              userId: user.id,
              planId: plan.id,
              paymentId: order_id,
              status: "active",
              amount: plan.price,
              createdAt: serverTimestamp(),
              expiresAt: new Date(Date.now() + (plan.period === 'week' ? 7 : plan.period === 'month' ? 30 : 365) * 24 * 60 * 60 * 1000)
            });
            toast.success(`${plan.title} Subscription successful! 🎉`);
            navigate("/library");
          }
        }
      });
    } catch (error) {
      console.error("Subscription Error:", error);
      toast.error("Failed to initiate subscription");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-4"
          >
            <Star className="w-4 h-4 fill-current" />
            <span>Premium Access</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Choose Your Plan</h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Get unlimited access to all premium courses, apps, and digital assets with our flexible subscription plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative p-8 rounded-3xl border ${
                plan.popular 
                ? 'border-blue-500 bg-blue-50/30 shadow-xl shadow-blue-500/10' 
                : 'border-slate-200 bg-white shadow-sm'
              } flex flex-col`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.title}</h3>
              <p className="text-slate-500 text-sm mb-8">{plan.desc}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900">{formatCurrency(plan.price)}</span>
                <span className="text-slate-500 text-lg">/{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {[
                  "Unlimited Downloads",
                  "Premium Support",
                  "Early Access to Items",
                  "Ad-free Experience"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3 text-slate-600">
                    <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handleSubscribe(plan)}
                disabled={subscribing === plan.id}
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 ${
                  plan.popular 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                } disabled:opacity-50`}
              >
                {subscribing === plan.id ? (
                  <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Get Started</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-slate-100 pt-20">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Instant Access</h4>
            <p className="text-slate-500 text-sm">Get access to all products immediately after payment.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Secure Payments</h4>
            <p className="text-slate-500 text-sm">Your transactions are protected by industry-standard encryption.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Premium Quality</h4>
            <p className="text-slate-500 text-sm">Hand-picked digital assets of the highest quality.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
