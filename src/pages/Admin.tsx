import React, { useEffect, useState } from "react";
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { Product, Purchase, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit, Users, DollarSign, TrendingUp, Package, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { formatCurrency } from "../lib/utils";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

const Admin: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    type: "video" as Product["type"],
    thumbnail: "",
    contentUrl: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "contentUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, [field]: url }));
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Access Denied");
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      try {
        const [productsSnap, usersSnap, purchasesSnap, subscriptionsSnap] = await Promise.all([
          getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "purchases"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "subscriptions"), orderBy("createdAt", "desc"))),
        ]);

        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        setPurchases(purchasesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase)));
        setSubscriptions(subscriptionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast.success("Product updated");
      } else {
        await addDoc(collection(db, "products"), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        toast.success("Product added");
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({ title: "", description: "", price: 0, type: "video", thumbnail: "", contentUrl: "" });
      // Refresh data
      const productsSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter(p => p.id !== id));
      toast.success("Product deleted");
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 text-center bg-grid min-h-screen">
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  const totalRevenue = [...purchases, ...subscriptions].reduce((acc, p) => acc + (p.amount || 0), 0);

  const seedSampleProducts = async () => {
    const samples = [
      // Videos
      {
        title: "Master React.js Course",
        description: "Complete guide to React from scratch. Learn hooks, context, and performance optimization.",
        price: 999,
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/react-course"
      },
      {
        title: "Advanced Node.js Backend",
        description: "Master server-side development with Node.js, Express, and MongoDB.",
        price: 899,
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/node-course"
      },
      {
        title: "Python for Data Science",
        description: "Learn Python for data analysis, visualization, and machine learning.",
        price: 799,
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/python-course"
      },
      {
        title: "UI/UX Design Essentials",
        description: "Master the principles of design and create stunning user interfaces.",
        price: 699,
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/design-course"
      },
      // Apps
      {
        title: "Fitness Tracker App",
        description: "Premium Android app to track your daily steps, calories, and workouts.",
        price: 299,
        type: "app",
        thumbnail: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/fitness-app.apk"
      },
      {
        title: "Expense Manager Pro",
        description: "Track your daily expenses and manage your budget with ease.",
        price: 199,
        type: "app",
        thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/expense-app.apk"
      },
      {
        title: "Task Master Plus",
        description: "A powerful to-do list app to boost your productivity.",
        price: 149,
        type: "app",
        thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/task-app.apk"
      },
      {
        title: "Weather Forecast Pro",
        description: "Get accurate weather updates and forecasts for your location.",
        price: 99,
        type: "app",
        thumbnail: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/weather-app.apk"
      },
      // Links
      {
        title: "SEO Checklist Pro",
        description: "A comprehensive checklist to rank your website on the first page of Google.",
        price: 199,
        type: "link",
        thumbnail: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/seo-guide"
      },
      {
        title: "Digital Marketing Guide",
        description: "Learn the latest strategies for social media and content marketing.",
        price: 249,
        type: "link",
        thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/marketing-guide"
      },
      {
        title: "Freelancing Blueprint",
        description: "Start your freelancing career and get high-paying clients.",
        price: 399,
        type: "link",
        thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/freelance-guide"
      },
      {
        title: "Investment Strategies",
        description: "Learn how to invest in stocks, crypto, and real estate.",
        price: 499,
        type: "link",
        thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/invest-guide"
      },
      // Files
      {
        title: "Premium UI Kit",
        description: "Modern UI components for Figma and React. 500+ components included.",
        price: 499,
        type: "file",
        thumbnail: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/ui-kit.zip"
      },
      {
        title: "E-book Template Bundle",
        description: "Professional templates for your next e-book or lead magnet.",
        price: 299,
        type: "file",
        thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/ebook-templates.zip"
      },
      {
        title: "Icon Pack Pro",
        description: "1000+ high-quality icons for your web and mobile projects.",
        price: 149,
        type: "file",
        thumbnail: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/icons.zip"
      },
      {
        title: "Resume Templates",
        description: "Modern and professional resume templates to land your dream job.",
        price: 99,
        type: "file",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800",
        contentUrl: "https://example.com/resumes.zip"
      }
    ];

    setLoading(true);
    try {
      for (const sample of samples) {
        await addDoc(collection(db, "products"), {
          ...sample,
          createdAt: serverTimestamp()
        });
      }
      toast.success("Sample products added successfully!");
      // Refresh
      const productsSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error("Seed Error:", error);
      toast.error("Failed to add sample products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={seedSampleProducts}
            className="bg-white text-blue-600 border border-blue-100 px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center space-x-2 shadow-sm"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Seed Sample Products</span>
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setFormData({ title: "", description: "", price: 0, type: "video", thumbnail: "", contentUrl: "" });
              setShowAddModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        {[
          { icon: DollarSign, label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-green-600", bg: "bg-green-50" },
          { icon: Users, label: "Total Users", value: users.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Total Sales", value: purchases.length, color: "text-pink-600", bg: "bg-pink-50" },
          { icon: Zap, label: "Subscriptions", value: subscriptions.length, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Package, label: "Total Products", value: products.length, color: "text-indigo-600", bg: "bg-indigo-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Manage Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="text-slate-600 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={product.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                      <span className="font-semibold text-slate-900">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-blue-600">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            title: product.title,
                            description: product.description,
                            price: product.price,
                            type: product.type,
                            thumbnail: product.thumbnail,
                            contentUrl: product.contentUrl,
                          });
                          setShowAddModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Product?</h3>
              <p className="text-slate-500 text-center mb-8">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(productToDelete)}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="E.g. Master React Course"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description (Markdown supported)</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Product Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="video">Video Course</option>
                    <option value="app">Mobile App (APK)</option>
                    <option value="link">Premium Link</option>
                    <option value="file">Digital File (ZIP/PDF)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Thumbnail URL or Upload</label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      required
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="https://..."
                    />
                    <label className="bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl cursor-pointer transition-all border border-slate-200">
                      <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "thumbnail")} />
                      <Plus className="w-5 h-5 text-slate-600" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Content URL or Upload File</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={formData.contentUrl}
                    onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="Direct link or upload"
                  />
                  <label className="bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl cursor-pointer transition-all border border-slate-200">
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "contentUrl")} />
                    <Plus className="w-5 h-5 text-slate-600" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {uploading ? "Uploading..." : (editingProduct ? "Update Product" : "Create Product")}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
