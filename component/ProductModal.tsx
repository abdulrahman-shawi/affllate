"use client";

import { useState } from "react";
import { X, ShoppingCart, Heart, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSettings } from "@/context/SettingsContext";
import { convertPrice, formatPrice } from "@/lib/currency";
import type { Product } from "./ProductCard";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { siteCurrency, usdToTryRate } = useSettings();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const finalPrice = product.originalPrice
    ? product.originalPrice - product.price
    : product.price;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - finalPrice) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const finalPrice = product.originalPrice
      ? product.originalPrice - product.price
      : product.price;
    const cartPrice = convertPrice(finalPrice, siteCurrency, usdToTryRate);
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: cartPrice,
        image: product.image,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const wishlisted = isWishlisted(product.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative aspect-square bg-gray-50">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg font-tajawal">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 mt-8 bg-pink text-white text-xs font-bold px-3 py-1.5 rounded-lg font-tajawal">
                -{discount}%
              </span>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 flex flex-col text-right" dir="rtl">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 font-tajawal leading-relaxed">
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-pink-dark font-tajawal">
                {formatPrice(finalPrice, siteCurrency, usdToTryRate)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through font-tajawal">
                  {formatPrice(product.originalPrice, siteCurrency, usdToTryRate)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-md font-tajawal">
                  وفّر {formatPrice(product.price, siteCurrency, usdToTryRate)}
                </span>
              )}
            </div>

            {/* Description */}
            <div
              className="text-gray-500 text-sm mb-6 leading-relaxed font-tajawal min-h-[3rem] product-description"
              dangerouslySetInnerHTML={{
                __html:
                  product.description ??
                  "منتج عالي الجودة يوفر لك أفضل النتائج. تم اختياره بعناية لتلبية احتياجاتك اليومية.",
              }}
            />

            {/* Quantity Selector */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-700 font-medium font-tajawal">الكمية:</span>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-semibold font-tajawal">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <span className="text-gray-600 font-tajawal">الإجمالي:</span>
              <span className="text-xl font-bold text-gray-800 font-tajawal">
                {formatPrice(finalPrice * quantity, siteCurrency, usdToTryRate)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 font-tajawal ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-pink text-white hover:bg-pink-dark"
                }`}
              >
                {added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? "تمت الإضافة!" : "أضف للسلة"}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  wishlisted
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-gray-200 hover:border-red-300 hover:text-red-500"
                }`}
              >
                <Heart size={20} className={wishlisted ? "fill-red-500" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
