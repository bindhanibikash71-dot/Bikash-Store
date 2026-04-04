import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, LogOut, Library, Shield, ShoppingBag, Menu, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Navbar: React.FC = () => {
  const { user, login, logout, isAdmin, isGuest } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Bikash Store
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <Link to="/premium" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Premium</span>
            </Link>
            {user && (
              <Link to="/library" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
                <Library className="w-4 h-4" />
                <span>My Library</span>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img src={user.photo} alt={user.name} className="w-8 h-8 rounded-full border border-blue-100" />
                    <span className="text-sm font-medium text-slate-700 hidden lg:block">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : isGuest ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-blue-700">Guest</span>
                  </div>
                  <button
                    onClick={login}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={login}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-blue-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-lg font-semibold text-slate-700 hover:text-blue-600"
              >
                Home
              </Link>
              <Link
                to="/premium"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 text-lg font-semibold text-slate-700 hover:text-blue-600"
              >
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Premium Access</span>
              </Link>
              {user && (
                <Link
                  to="/library"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-lg font-semibold text-slate-700 hover:text-blue-600"
                >
                  <Library className="w-5 h-5" />
                  <span>My Library</span>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-lg font-semibold text-slate-700 hover:text-blue-600"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}
              
              <div className="pt-4 border-t border-slate-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full border border-blue-100" />
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      login();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login with Google</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
