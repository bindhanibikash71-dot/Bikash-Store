import React, { useEffect, useState } from "react";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Product, Purchase } from "../types";
import { motion } from "motion/react";
import { ShoppingBag, Play, Download, ExternalLink, FileText, Zap } from "lucide-react";
import { formatCurrency } from "../lib/utils";

const Library: React.FC = () => {
  const { user, isGuest, loading: authLoading, subscription } = useAuth();
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (subscription) {
          // If user has active subscription, show all products
          const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(q);
          setPurchasedProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        } else {
          // Otherwise show only purchased ones
          const q = query(collection(db, "purchases"), where("userId", "==", user.id));
          const querySnapshot = await getDocs(q);
          const purchases = querySnapshot.docs.map(doc => doc.data() as Purchase);
          
          if (purchases.length > 0) {
            const productIds = purchases.map(p => p.productId);
            // Firestore 'in' query limit is 10, but for simplicity let's assume it's fine or handle it
            const productsQ = query(collection(db, "products"), where("__name__", "in", productIds));
            const productsSnap = await getDocs(productsQ);
            setPurchasedProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
          } else {
            setPurchasedProducts([]);
          }
        }
      } catch (error) {
        console.error("Error fetching library:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchLibrary();
    }
  }, [user, authLoading, subscription]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="pt-32 text-center px-4 bg-white min-h-screen">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-blue-100 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Guest Mode</h1>
          <p className="text-slate-500 mb-6">Please login with Google to see your purchased products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subscription Banner */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Zap className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Active Premium Subscription</h2>
                <p className="text-blue-100 text-sm">
                  You have full access to all products until {subscription.expiresAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-all"
            >
              Browse All Products
            </a>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Library</h1>
          <div className="text-slate-500 text-sm font-medium">
            {purchasedProducts.length} Products Purchased
          </div>
        </div>

      {purchasedProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No products found</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You haven't purchased any digital products yet. Start exploring our marketplace!
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            Explore Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {purchasedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
            >
              <div className="aspect-video relative">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-blue-600 fill-current" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-widest">
                    {product.type}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 truncate">{product.title}</h3>
                
                <div className="flex items-center justify-between">
                  {product.type === "video" && (
                    <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10">
                      <Play className="w-4 h-4" />
                      <span>Watch Now</span>
                    </button>
                  )}
                  {product.type === "app" && (
                    <a
                      href={product.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download App</span>
                    </a>
                  )}
                  {product.type === "link" && (
                    <a
                      href={product.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Link</span>
                    </a>
                  )}
                  {product.type === "file" && (
                    <a
                      href={product.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download File</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  </div>
);
};

export default Library;
