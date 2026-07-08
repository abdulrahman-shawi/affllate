"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import StarRating from "./StarRating";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/context/SettingsContext";
import { convertPrice, formatPrice } from "@/lib/currency";
import ProductModal from "./ProductModal";

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  description?: string | null;
  seoSlug?: string | null;
  averageRating?: number;
  totalReviews?: number;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { siteCurrency, usdToTryRate } = useSettings();
  const [added, setAdded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const finalPrice = product.originalPrice
      ? product.originalPrice - product.price
      : product.price;
    addToCart({
      id: product.id,
      name: product.name,
      price: convertPrice(finalPrice, siteCurrency, usdToTryRate),
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const wishlisted = isWishlisted(product.id);

  const discountAmount = product.originalPrice
    ? Math.round(product.originalPrice - product.price)
    : 0;
  const hasDiscount = discountAmount > 0;

  const productUrl = `/product/${product.seoSlug ?? product.id}`;

  return (
    <>
      <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(255,153,204,0.2)]">
        <Link href={productUrl} className="block">
          <div className="relative overflow-hidden aspect-square bg-gray-light">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg font-tajawal">
                {product.badge}
              </span>
            )}
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-pink text-white text-xs font-bold px-2 py-1 rounded-lg font-tajawal">
                -{formatPrice(product.price, siteCurrency, usdToTryRate)}
              </span>
            )}
            <button
              onClick={handleToggleWishlist}
              className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                wishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white hover:bg-pink hover:text-white"
              }`}
            >
              <Heart size={18} className={wishlisted ? "fill-white" : ""} />
            </button>
          </div>

          <div className="p-4 text-center">
            {(product.averageRating ?? 0) > 0 && (
              <div className="flex items-center justify-center gap-1 mb-2">
                <StarRating rating={product.averageRating ?? 0} size={14} />
                <span className="text-xs text-gray-400 font-tajawal">
                  ({product.totalReviews})
                </span>
              </div>
            )}
            <h3 className="font-medium text-gray-dark mb-2 font-tajawal text-sm truncate">
              {product.name}
            </h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-pink-dark font-bold font-tajawal">{formatPrice(discountAmount, siteCurrency, usdToTryRate)}</span>
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-sm font-tajawal">
                  {formatPrice(product.originalPrice, siteCurrency, usdToTryRate)}
                </span>
              )}
            </div>
            {typeof product.stock === "number" && (
              <p className="text-xs text-gray-500 font-tajawal mb-2">
                متبقي في المخزون:{" "}
                <span
                  className={
                    product.stock <= 5
                      ? "text-red-500 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {product.stock}
                </span>
              </p>
            )}
          </div>
        </Link>

        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 font-tajawal ${
              added
                ? "bg-green-500 text-white"
                : "bg-pink text-white hover:bg-pink-dark"
            }`}
          >
            <ShoppingCart size={16} />
            {added ? "تمت الإضافة!" : "أضف للسلة"}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all duration-300"
            title="عرض سريع"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
