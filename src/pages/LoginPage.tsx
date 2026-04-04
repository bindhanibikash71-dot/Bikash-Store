import React from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { LogIn, UserCircle, ShoppingBag } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login, guestLogin } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-blue-100 p-8 rounded-3xl shadow-xl shadow-blue-500/5 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bikash Digital Store</h1>
        <p className="text-slate-500 mb-8">
          Please login to access our premium digital products.
        </p>

        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <LogIn className="w-5 h-5" />
            <span>Login with Google</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-slate-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <button
            onClick={guestLogin}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
          >
            <UserCircle className="w-5 h-5" />
            <span>Continue as Guest</span>
          </button>
        </div>

        <p className="mt-8 text-slate-400 text-xs">
          By continuing, you agree to our Terms of Service. <br />
          Powered by Bikash Bindhani 🚀
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
