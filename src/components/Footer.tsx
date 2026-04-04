import React from "react";
import { Instagram, Send, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Bikash Digital Store
            </span>
            <p className="mt-2 text-slate-500 text-sm">
              Discover & Buy Premium Digital Products 🚀
            </p>
          </div>

          <div className="flex justify-center space-x-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
              <Send className="w-6 h-6" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors">
              <Youtube className="w-6 h-6" />
            </a>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">
              Made by <span className="text-blue-600 font-medium">Bikash Bindhani</span> 🚀
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Powered by Bikash Bindhani 🚀
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
