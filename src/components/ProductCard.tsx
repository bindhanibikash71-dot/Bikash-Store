import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Product } from "../types";
import { formatCurrency } from "../lib/utils";
import { Play, Download, Link as LinkIcon, FileText } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const Icon = {
    video: Play,
    app: Download,
    link: LinkIcon,
    file: FileText,
  }[product.type];

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
    >
      <Link to={`/product/${product.id}`}>
        <div className="aspect-video relative overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 border border-slate-100 shadow-sm">
            <Icon className="w-3 h-3 text-blue-600" />
            <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">
              {product.type}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-900 truncate">{product.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-2 mt-2 min-h-[40px]">
            {product.description}
          </p>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
            <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
              Buy Now
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
