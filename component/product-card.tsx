"use client";

import React from "react";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/lib/currency";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  category?: string;
}

export default function ProductCard({
  name,
  price,
  oldPrice,
  badge,
  image,
  category = "أدوات تجميل",
}: ProductCardProps) {
  const { siteCurrency, usdToTryRate } = useSettings();
  const badgeColor =
    badge === "خصم"
      ? "bg-[#ef837b]"
      : badge === "جديد"
      ? "bg-[#a6c76c]"
      : badge === "الأكثر مبيعاً"
      ? "bg-[#1cc0a0]"
      : "bg-[#c96]";

  return (
    <div className="group relative bg-white border border-gray-100 p-3 md:p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
      {/* صورة المنتج والبادج */}
      <div className="relative aspect-square bg-[#f9f9f9] overflow-hidden mb-4">
        {badge && (
          <span
            className={`absolute top-3 right-3 z-10 px-2.5 py-1 text-[10px] uppercase font-bold text-white tracking-wider rounded-sm ${badgeColor}`}
          >
            {badge}
          </span>
        )}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* أزرار العمليات السريعة (تظهر عند hover) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
          <button className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-[#c96] hover:bg-[#fafafa] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-[#c96] hover:bg-[#fafafa] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* زر أضف للسلة السريع */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-[#333] text-white py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#c96] transition-colors">
            إضافة إلى السلة
          </button>
        </div>
      </div>

      {/* تفاصيل المنتج */}
      <div className="space-y-1 text-right flex-grow">
        <span className="text-[11px] text-gray-400 uppercase tracking-widest">
          {category}
        </span>
        <h3 className="text-sm font-medium text-[#333] hover:text-[#c96] transition-colors line-clamp-2 h-10 cursor-pointer">
          {name}
        </h3>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-base font-bold text-[#c96]">{formatPrice(price, siteCurrency, usdToTryRate)}</span>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(oldPrice, siteCurrency, usdToTryRate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
